import mongoose from 'mongoose'
import IssueGroup from '../models/IssueGroup.js'
import Report from '../models/Report.js'
import UrgencyVote from '../models/UrgencyVote.js'
import {
  HIGH_DUPLICATE_THRESHOLD,
  POSSIBLE_DUPLICATE_THRESHOLD,
  scoreDuplicateReports,
} from '../utils/duplicateDetection.js'

export async function getDuplicateCandidates(input, excludeReportId) {
  return findSimilarReports(input, excludeReportId)
}

export async function findSimilarReports(input, excludeReportId) {
  const filter = {
    category: input.category,
    status: { $nin: ['Resolved', 'Rejected'] },
  }
  if (excludeReportId) filter._id = { $ne: excludeReportId }

  const candidates = await Report.find(filter)
    .select('title description category location status createdAt issueGroupId')
    .sort({ createdAt: -1 })
    .limit(500)

  const matches = candidates
    .map((report) => ({ report, similarityScore: scoreDuplicateReports(input, report) }))
    .filter(({ similarityScore }) => similarityScore >= POSSIBLE_DUPLICATE_THRESHOLD)
    .sort((left, right) => right.similarityScore - left.similarityScore
      || new Date(right.report.createdAt) - new Date(left.report.createdAt))
    .slice(0, 5)

  if (!matches.length) return []
  const reportIds = matches.map(({ report }) => report._id)
  const [groups, voteCounts] = await Promise.all([
    IssueGroup.find({ status: 'confirmed', reports: { $in: reportIds } }).select('reports'),
    UrgencyVote.aggregate([
      { $match: { report: { $in: reportIds } } },
      { $group: { _id: '$report', count: { $sum: 1 } } },
    ]),
  ])
  const groupForReport = new Map()
  for (const group of groups) {
    for (const reportId of group.reports) groupForReport.set(reportId.toString(), group)
  }
  const counts = new Map(voteCounts.map(({ _id, count }) => [_id.toString(), count]))

  return matches.map(({ report, similarityScore }) => {
    const group = groupForReport.get(report._id.toString())
    return {
      reportId: report._id,
      title: report.title,
      category: report.category,
      location: report.location,
      status: report.status,
      similarityScore,
      reportCount: group?.reports.length || 1,
      urgencyVoteCount: group
        ? group.reports.reduce((total, id) => total + (counts.get(id.toString()) || 0), 0)
        : counts.get(report._id.toString()) || 0,
      issueGroupId: group?._id || null,
    }
  })
}

export async function attachReportToIssueGroup(report, matches) {
  const bestMatch = matches[0]
  if (bestMatch && bestMatch.similarityScore >= HIGH_DUPLICATE_THRESHOLD) {
    let group = bestMatch.issueGroupId
      ? await IssueGroup.findOne({ _id: bestMatch.issueGroupId, status: 'confirmed' })
      : null

    if (!group) {
      group = await IssueGroup.create({
        title: bestMatch.title,
        category: report.category,
        location: bestMatch.location,
        reports: [bestMatch.reportId],
        status: 'confirmed',
        similarityScore: bestMatch.similarityScore,
      })
    }
    group.reports.addToSet(report._id)
    await group.save()
    await Report.updateMany(
      { _id: { $in: group.reports } },
      { $set: { issueGroupId: group._id } },
    )
    report.issueGroupId = group._id
    return group
  }

  const group = await IssueGroup.create({
    title: report.title,
    category: report.category,
    location: report.location,
    reports: [report._id],
    status: 'confirmed',
    similarityScore: 100,
  })
  report.issueGroupId = group._id
  await report.save()

  if (bestMatch) {
    const rejectedPair = await IssueGroup.exists({
      status: 'rejected',
      reports: { $all: [bestMatch.reportId, report._id] },
    })
    if (!rejectedPair) {
      const candidateGroup = bestMatch.issueGroupId
        ? await IssueGroup.findOne({ _id: bestMatch.issueGroupId, status: 'confirmed' })
        : null
      const relatedReports = candidateGroup?.reports || [bestMatch.reportId]
      await IssueGroup.create({
        title: bestMatch.title,
        category: report.category,
        location: bestMatch.location,
        reports: [...relatedReports, report._id],
        status: 'proposed',
        similarityScore: bestMatch.similarityScore,
      })
    }
  }
  return group
}

export async function getIssueGroupForReport(reportId, includeReports = false, showReporterEmail = false) {
  if (!mongoose.isValidObjectId(reportId)) return null
  const report = await Report.findById(reportId).select('issueGroupId')
  if (!report?.issueGroupId) return null
  let query = IssueGroup.findOne({ _id: report.issueGroupId, status: 'confirmed' })
  if (includeReports) {
    query = query.populate({
      path: 'reports',
      select: 'title description category location status priority createdAt updatedAt imageUrl reportedBy',
      populate: { path: 'reportedBy', select: showReporterEmail ? 'name email studentId' : 'name' },
      options: { sort: { createdAt: 1 } },
    })
  }
  const group = await query
  if (!group) return null
  const reportIds = group.reports.map((item) => item._id || item)
  const memberIds = reportIds.map((id) => new mongoose.Types.ObjectId(id))
  const votes = await UrgencyVote.aggregate([
    { $match: { report: { $in: memberIds } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ])
  return {
    _id: group._id,
    title: group.title,
    category: group.category,
    location: group.location,
    reportCount: reportIds.length,
    urgencyVoteCount: votes[0]?.count || 0,
    reports: includeReports ? group.reports : undefined,
  }
}

export async function getProposedIssueGroups() {
  const groups = await IssueGroup.find({ status: 'proposed' })
    .populate({
      path: 'reports',
      select: 'title description category location status priority createdAt reportedBy',
      populate: { path: 'reportedBy', select: 'name' },
      options: { sort: { createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
  return Promise.all(groups.map(async (group) => {
    const reports = group.reports.map((report) => {
      const item = report.toObject()
      return {
        ...item,
        reportedBy: item.reportedBy ? { _id: item.reportedBy._id, name: item.reportedBy.name } : null,
      }
    })
    const voteCounts = await UrgencyVote.aggregate([
      { $match: { report: { $in: reports.map((report) => report._id) } } },
      { $group: { _id: '$report', count: { $sum: 1 } } },
    ])
    return {
      _id: group._id,
      title: group.title,
      category: group.category,
      location: group.location,
      status: group.status,
      similarityScore: group.similarityScore,
      reports,
      urgencyVoteCount: voteCounts.reduce((total, vote) => total + vote.count, 0),
    }
  }))
}

export async function reviewIssueGroup(groupId, action) {
  const group = await IssueGroup.findOne({ _id: groupId, status: 'proposed' })
  if (!group) return null
  if (action === 'reject') {
    group.status = 'rejected'
    await group.save()
    return { _id: group._id, status: group.status }
  }

  const reportIds = new Set(group.reports.map((id) => id.toString()))
  const existingGroups = await IssueGroup.find({
    _id: { $ne: group._id },
    status: 'confirmed',
    reports: { $in: [...reportIds].map((id) => new mongoose.Types.ObjectId(id)) },
  })
  for (const existingGroup of existingGroups) {
    for (const reportId of existingGroup.reports) reportIds.add(reportId.toString())
    existingGroup.status = 'merged'
    await existingGroup.save()
  }
  const allReportIds = [...reportIds].map((id) => new mongoose.Types.ObjectId(id))
  await Report.updateMany({ _id: { $in: allReportIds } }, { $set: { issueGroupId: group._id } })
  group.reports = allReportIds
  group.status = 'confirmed'
  await group.save()
  return { _id: group._id, status: group.status }
}

export async function getDuplicateGroupSummaries() {
  const groups = await IssueGroup.find({ status: 'confirmed' })
    .populate({
      path: 'reports',
      select: 'title category location status createdAt',
    })
    .sort({ updatedAt: -1 })
  const multiReportGroups = groups.filter((group) => group.reports.length > 1)
  if (!multiReportGroups.length) {
    return {
      groupCount: 0,
      groupsWithThreeOrMoreReports: 0,
      groupsWithUnresolvedReports: 0,
      groupsWithHighUrgency: 0,
    }
  }

  const reportIds = multiReportGroups.flatMap((group) => group.reports.map((report) => report._id))
  const voteCounts = await UrgencyVote.aggregate([
    { $match: { report: { $in: reportIds } } },
    { $group: { _id: '$report', count: { $sum: 1 } } },
  ])
  const votes = new Map(voteCounts.map(({ _id, count }) => [_id.toString(), count]))
  const thresholdValue = Number(process.env.COMMUNITY_URGENCY_THRESHOLD)
  const urgencyThreshold = Number.isInteger(thresholdValue) && thresholdValue > 0 ? thresholdValue : 10

  return {
    groupCount: multiReportGroups.length,
    groupsWithThreeOrMoreReports: multiReportGroups.filter((group) => group.reports.length >= 3).length,
    groupsWithUnresolvedReports: multiReportGroups.filter((group) => group.reports.some(
      (report) => !['Resolved', 'Rejected'].includes(report.status),
    )).length,
    groupsWithHighUrgency: multiReportGroups.filter((group) => group.reports.reduce(
      (total, report) => total + (votes.get(report._id.toString()) || 0),
      0,
    ) >= urgencyThreshold).length,
  }
}
