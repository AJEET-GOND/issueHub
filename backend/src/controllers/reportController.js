import mongoose from 'mongoose'
import IssueGroup from '../models/IssueGroup.js'
import Report, { REPORT_CATEGORIES, REPORT_PRIORITIES, REPORT_STATUSES } from '../models/Report.js'
import UrgencyVote from '../models/UrgencyVote.js'
import { deleteReportImage, uploadReportImage } from '../services/imagekitService.js'
import {
  attachReportToIssueGroup,
  findSimilarReports,
  getDuplicateGroupSummaries,
  getIssueGroupForReport,
  getProposedIssueGroups,
  reviewIssueGroup,
} from '../services/duplicateReportService.js'

function serializeReport(report, urgencyVoteCount = 0, hasVoted = false, showReporterEmail = false) {
  const result = report.toObject ? report.toObject() : { ...report }
  delete result.imageFileId
  if (report.populated?.('reportedBy') && result.reportedBy && typeof result.reportedBy === 'object') {
    const { _id, name, email, studentId } = result.reportedBy
    result.reportedBy = {
      ...(typeof _id !== 'undefined' ? { _id } : {}),
      ...(typeof name === 'string' ? { name } : {}),
      ...(showReporterEmail && typeof email === 'string' ? { email } : {}),
      ...(showReporterEmail && typeof studentId === 'string' ? { studentId } : {}),
    }
  }
  return { ...result, urgencyVoteCount, hasVoted }
}

async function removeReportFromIssueGroups(reportId) {
  const groups = await IssueGroup.find({ reports: reportId })
  for (const group of groups) {
    group.reports.pull(reportId)
    if (group.reports.length === 0 || (group.status === 'proposed' && group.reports.length < 2)) {
      await group.deleteOne()
    } else {
      await group.save()
    }
  }
}

async function addUrgencyToReports(reports, userId, showReporterEmail = false) {
  if (!reports.length) return []
  const reportIds = reports.map((report) => report._id)
  const [counts, userVotes, groups] = await Promise.all([
    UrgencyVote.aggregate([
      { $match: { report: { $in: reportIds } } },
      { $group: { _id: '$report', count: { $sum: 1 } } },
    ]),
    UrgencyVote.find({ report: { $in: reportIds }, user: userId }).distinct('report'),
    IssueGroup.find({ status: 'confirmed', reports: { $in: reportIds } }).select('title category location reports'),
  ])
  const countByReport = new Map(counts.map(({ _id, count }) => [_id.toString(), count]))
  const votedReportIds = new Set(userVotes.map((id) => id.toString()))
  const groupByReport = new Map()
  const groupVotes = new Map()
  const groupReportIds = groups.flatMap((group) => group.reports)
  const groupVoteCounts = groupReportIds.length
    ? await UrgencyVote.aggregate([
      { $match: { report: { $in: groupReportIds } } },
      { $group: { _id: '$report', count: { $sum: 1 } } },
    ])
    : []
  for (const group of groups) {
    for (const reportId of group.reports) groupByReport.set(reportId.toString(), group)
  }
  const voteCountByReport = new Map(groupVoteCounts.map(({ _id, count }) => [_id.toString(), count]))
  for (const group of groups) {
    const totalVotes = group.reports.reduce((total, id) => total + (voteCountByReport.get(id.toString()) || 0), 0)
    groupVotes.set(group._id.toString(), totalVotes)
  }
  return reports.map((report) => {
    const group = groupByReport.get(report._id.toString())
    const result = serializeReport(
      report,
      countByReport.get(report._id.toString()) || 0,
      votedReportIds.has(report._id.toString()),
      showReporterEmail,
    )
    if (group) {
      result.issueGroup = {
        _id: group._id,
        title: group.title,
        category: group.category,
        location: group.location,
        reportCount: group.reports.length,
        urgencyVoteCount: groupVotes.get(group._id.toString()) || 0,
      }
    }
    return result
  })
}

function normalizeProblemPart(value) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function getCommunityUrgencyThreshold() {
  const configured = Number(process.env.COMMUNITY_URGENCY_THRESHOLD)
  return Number.isInteger(configured) && configured > 0 ? configured : 10
}

async function getProblemInsights() {
  const reports = await Report.aggregate([
    {
      $lookup: {
        from: UrgencyVote.collection.name,
        localField: '_id',
        foreignField: 'report',
        pipeline: [{ $count: 'count' }],
        as: 'voteCount',
      },
    },
    {
      $project: {
        title: 1,
        category: 1,
        location: 1,
        status: 1,
        createdAt: 1,
        urgencyVoteCount: { $ifNull: [{ $arrayElemAt: ['$voteCount.count', 0] }, 0] },
      },
    },
    { $sort: { createdAt: -1 } },
  ])

  const grouped = new Map()
  for (const report of reports) {
    const key = [
      report.category,
      normalizeProblemPart(report.location),
      normalizeProblemPart(report.title),
    ].join('|')
    let problem = grouped.get(key)
    if (!problem) {
      problem = {
        title: report.title,
        category: report.category,
        location: report.location,
        reportCount: 0,
        unresolvedCount: 0,
        urgencyVoteCount: 0,
        oldestReportAt: report.createdAt,
        oldestUnresolvedAt: null,
        status: report.status,
      }
      grouped.set(key, problem)
    }
    problem.reportCount += 1
    problem.urgencyVoteCount += report.urgencyVoteCount
    if (report.status !== 'Resolved' && report.status !== 'Rejected') {
      problem.unresolvedCount += 1
      if (!problem.oldestUnresolvedAt || report.createdAt < problem.oldestUnresolvedAt) {
        problem.oldestUnresolvedAt = report.createdAt
      }
    }
  }

  const problems = [...grouped.values()]
  const locationCounts = new Map()
  const categoryCounts = new Map()
  for (const report of reports) {
    locationCounts.set(report.location, (locationCounts.get(report.location) || 0) + 1)
    categoryCounts.set(report.category, (categoryCounts.get(report.category) || 0) + 1)
  }
  const threshold = getCommunityUrgencyThreshold()
  const configuredPendingDays = Number(process.env.LONG_PENDING_DAYS)
  const pendingDays = Number.isInteger(configuredPendingDays) && configuredPendingDays > 0
    ? configuredPendingDays
    : 7
  const now = Date.now()
  const byUrgency = (left, right) => right.urgencyVoteCount - left.urgencyVoteCount
    || right.reportCount - left.reportCount

  const summarized = (problem) => ({
    title: problem.title,
    category: problem.category,
    location: problem.location,
    reportCount: problem.reportCount,
    unresolvedCount: problem.unresolvedCount,
    urgencyVoteCount: problem.urgencyVoteCount,
    oldestReportAt: problem.oldestReportAt,
    oldestUnresolvedAt: problem.oldestUnresolvedAt,
    currentStatus: problem.status,
  })
  const unresolved = problems.filter((problem) => problem.unresolvedCount > 0)

  return {
    threshold,
    recurringProblems: problems.filter((problem) => problem.reportCount > 1)
      .sort((left, right) => right.reportCount - left.reportCount)
      .slice(0, 10).map(summarized),
    unresolvedProblems: unresolved.toSorted((left, right) => right.unresolvedCount - left.unresolvedCount)
      .slice(0, 10).map(summarized),
    longPendingProblems: unresolved.filter((problem) => problem.oldestUnresolvedAt
      && now - new Date(problem.oldestUnresolvedAt).getTime() >= pendingDays * 24 * 60 * 60 * 1000)
      .sort((left, right) => new Date(left.oldestUnresolvedAt) - new Date(right.oldestUnresolvedAt))
      .slice(0, 10).map((problem) => ({ ...summarized(problem), pendingDays: Math.floor((now - new Date(problem.oldestUnresolvedAt).getTime()) / (24 * 60 * 60 * 1000)) })),
    affectedLocations: [...locationCounts].map(([location, reportCount]) => ({ location, reportCount }))
      .sort((left, right) => right.reportCount - left.reportCount).slice(0, 10),
    reportedCategories: [...categoryCounts].map(([category, reportCount]) => ({ category, reportCount }))
      .sort((left, right) => right.reportCount - left.reportCount),
    communityUrgency: problems.filter((problem) => problem.urgencyVoteCount > 0)
      .sort(byUrgency).slice(0, 10).map(summarized),
    highConcern: problems.filter((problem) => problem.urgencyVoteCount >= threshold
      && problem.reportCount > 1
      && problem.unresolvedCount > 0)
      .sort(byUrgency)
      .map((problem) => ({
        ...summarized(problem),
        suggestedAction: 'Review this issue for priority resolution and investigate whether a recurring underlying problem exists.',
      })),
    pendingDaysThreshold: pendingDays,
  }
}

function validReportInput(body) {
  return typeof body.title === 'string'
    && body.title.trim().length >= 4
    && body.title.trim().length <= 120
    && typeof body.description === 'string'
    && body.description.trim().length >= 10
    && body.description.trim().length <= 5000
    && REPORT_CATEGORIES.includes(body.category)
    && typeof body.location === 'string'
    && body.location.trim().length >= 2
    && body.location.trim().length <= 160
    && REPORT_PRIORITIES.includes(body.priority)
}

export async function createReport(request, response) {
  if (!validReportInput(request.body)) {
    response.status(400).json({ message: 'Please complete each field with valid information.' })
    return
  }
  const similarReports = await findSimilarReports(request.body)
  if (similarReports.length && request.body.allowSimilar !== 'true') {
    response.status(409).json({
      code: 'SIMILAR_REPORTS_FOUND',
      message: 'A similar issue may already have been reported.',
      similarReports,
    })
    return
  }

  const image = request.file ? await uploadReportImage(request.file) : null
  let report
  try {
    report = await Report.create({
      title: request.body.title.trim(),
      description: request.body.description.trim(),
      category: request.body.category,
      location: request.body.location.trim(),
      priority: request.body.priority,
      reportedBy: request.user._id,
      ...(image || {}),
    })
    await attachReportToIssueGroup(report, similarReports)
  } catch (error) {
    if (report) {
      await removeReportFromIssueGroups(report._id)
      await Report.deleteOne({ _id: report._id })
    }
    if (image) {
      try {
        await deleteReportImage(image.imageFileId)
      } catch (cleanupError) {
        console.error('Could not clean up an ImageKit file after report creation failed:', cleanupError)
      }
    }
    throw error
  }
  const [serializedReport] = await addUrgencyToReports([report], request.user._id)
  response.status(201).json({ report: serializedReport })
}

export async function getMyReports(request, response) {
  const reports = await Report.find({ reportedBy: request.user._id })
    .populate('reportedBy', 'name')
    .sort({ createdAt: -1 })
  response.json({ reports: await addUrgencyToReports(reports, request.user._id) })
}

export async function getMyReportById(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const report = await Report.findById(request.params.id)
    .populate('reportedBy', request.user.role === 'admin' ? 'name email studentId' : 'name')
  if (!report) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const [serializedReport] = await addUrgencyToReports(
    [report],
    request.user._id,
    request.user.role === 'admin',
  )
  serializedReport.issueGroup = await getIssueGroupForReport(
    request.params.id,
    true,
    request.user.role === 'admin',
  )
  response.json({ report: serializedReport })
}

export async function getCampusReports(request, response) {
  const filter = {}
  const { status, category, priority, search, sort } = request.query
  if (typeof status === 'string' && status) {
    if (!REPORT_STATUSES.includes(status)) {
      response.status(400).json({ message: 'Choose a valid report status filter.' })
      return
    }
    filter.status = status
  }
  if (typeof category === 'string' && category) {
    if (!REPORT_CATEGORIES.includes(category)) {
      response.status(400).json({ message: 'Choose a valid category filter.' })
      return
    }
    filter.category = category
  }
  if (typeof priority === 'string' && priority) {
    if (!REPORT_PRIORITIES.includes(priority)) {
      response.status(400).json({ message: 'Choose a valid priority filter.' })
      return
    }
    filter.priority = priority
  }
  if (typeof search === 'string' && search.trim()) {
    const escapedSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const searchPattern = new RegExp(escapedSearch, 'i')
    filter.$or = [
      { title: searchPattern },
      { location: searchPattern },
      { category: searchPattern },
    ]
  }
  const reports = await Report.find(filter)
    .populate('reportedBy', 'name')
    .sort({ createdAt: -1 })
  const enrichedReports = await addUrgencyToReports(reports, request.user._id)
  if (sort === 'urgent') enrichedReports.sort((left, right) => right.urgencyVoteCount - left.urgencyVoteCount
    || new Date(right.createdAt) - new Date(left.createdAt))
  response.json({ reports: enrichedReports })
}

export async function voteUrgency(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const reportExists = await Report.exists({ _id: request.params.id })
  if (!reportExists) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  try {
    await UrgencyVote.create({ report: request.params.id, user: request.user._id })
  } catch (error) {
    if (error?.code === 11000) {
      response.status(409).json({ message: 'You have already marked this problem as urgent.' })
      return
    }
    throw error
  }
  const urgencyVoteCount = await UrgencyVote.countDocuments({ report: request.params.id })
  response.status(201).json({ message: 'Marked as urgent.', urgencyVoteCount, hasVoted: true })
}

export async function removeUrgencyVote(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const reportExists = await Report.exists({ _id: request.params.id })
  if (!reportExists) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  await UrgencyVote.deleteOne({ report: request.params.id, user: request.user._id })
  const urgencyVoteCount = await UrgencyVote.countDocuments({ report: request.params.id })
  response.json({ message: 'Urgency vote removed.', urgencyVoteCount, hasVoted: false })
}

export async function getAllReports(request, response) {
  const filter = {}
  const { status, category, priority } = request.query
  if (typeof status === 'string' && REPORT_STATUSES.includes(status)) filter.status = status
  if (typeof category === 'string' && REPORT_CATEGORIES.includes(category)) filter.category = category
  if (typeof priority === 'string' && REPORT_PRIORITIES.includes(priority)) filter.priority = priority

  const reports = await Report.find(filter)
    .populate('reportedBy', 'name email studentId')
    .sort({ createdAt: -1 })
  response.json({ reports: await addUrgencyToReports(reports, request.user._id, true) })
}

export async function getAdminDashboard(request, response) {
  const [total, pending, inProgress, resolved, rejected, recentReports, insights] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'In Progress' }),
    Report.countDocuments({ status: 'Resolved' }),
    Report.countDocuments({ status: 'Rejected' }),
    Report.find()
      .populate('reportedBy', 'name email studentId')
      .sort({ createdAt: -1 })
      .limit(5),
    getProblemInsights(),
  ])
  response.json({
    stats: { total, pending, inProgress, resolved, rejected },
    recentReports: await addUrgencyToReports(recentReports, request.user._id, true),
    mostUrgentProblems: insights.communityUrgency.slice(0, 3),
    highConcern: insights.highConcern.slice(0, 3),
    highConcernCount: insights.highConcern.length,
  })
}

export async function getAdminInsights(_request, response) {
  const [insights, duplicateGroups, proposedDuplicateGroups] = await Promise.all([
    getProblemInsights(),
    getDuplicateGroupSummaries(),
    getProposedIssueGroups(),
  ])
  response.json({
    insights: {
      ...insights,
      duplicateGroups,
      proposedDuplicateGroups,
    },
  })
}

export async function reviewDuplicateGroup(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Related report group not found.' })
    return
  }
  const result = await reviewIssueGroup(request.params.id, request.params.action)
  if (!result) {
    response.status(404).json({ message: 'Related report group not found.' })
    return
  }
  response.json({
    group: result,
    message: result.status === 'confirmed' ? 'Related reports grouped.' : 'Reports marked as unrelated.',
  })
}

export async function updateReportStatus(request, response) {
  const { status } = request.body
  if (!REPORT_STATUSES.includes(status)) {
    response.status(400).json({ message: 'Choose a valid report status.' })
    return
  }
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const report = await Report.findByIdAndUpdate(
    request.params.id,
    { status },
    { new: true, runValidators: true },
  ).populate('reportedBy', 'name email studentId')
  if (!report) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const [serializedReport] = await addUrgencyToReports([report], request.user._id, true)
  response.json({ report: serializedReport })
}

export async function deleteReport(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  const report = await Report.findByIdAndDelete(request.params.id)
  if (!report) {
    response.status(404).json({ message: 'Report not found.' })
    return
  }
  await UrgencyVote.deleteMany({ report: report._id })
  await removeReportFromIssueGroups(report._id)
  let imageCleanupWarning
  if (report.imageFileId) {
    try {
      await deleteReportImage(report.imageFileId)
    } catch (error) {
      console.error('Report was deleted but its ImageKit image could not be removed:', error)
      imageCleanupWarning = 'The report was deleted, but its image could not be removed from storage.'
    }
  }
  response.json({ message: 'Report deleted.', ...(imageCleanupWarning ? { warning: imageCleanupWarning } : {}) })
}
