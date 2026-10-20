import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import { createReport } from '../../services/reportService.js'

const categories = ['Infrastructure', 'Electrical', 'Water', 'Cleanliness', 'Internet', 'Other']
const priorities = ['Low', 'Medium', 'High']

function ReportIssue() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', priority: 'Medium' })
  const [error, setError] = useState('')
  const [similarReports, setSimilarReports] = useState([])
  const [pending, setPending] = useState(false)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const imageInputRef = useRef(null)
  const imagePreviewRef = useRef('')

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current)
    }
  }, [])

  function setSelectedImage(file) {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current)
    imagePreviewRef.current = file ? URL.createObjectURL(file) : ''
    setImage(file)
    setImagePreview(imagePreviewRef.current)
  }

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitReport(allowSimilar = false) {
    setError('')
    setPending(true)
    try {
      await createReport(form, image, allowSimilar)
      navigate('/student/reports', { replace: true, state: { success: 'Your report has been submitted.' } })
    } catch (requestError) {
      if (requestError.response?.status === 409 && requestError.response?.data?.code === 'SIMILAR_REPORTS_FOUND') {
        setSimilarReports(requestError.response.data.similarReports || [])
      } else {
        setError(requestError.response?.data?.message || 'We couldn’t submit your report. Please try again.')
      }
    } finally {
      setPending(false)
    }
  }

  function onSubmit(event) {
    event.preventDefault()
    setSimilarReports([])
    submitReport()
  }

  function selectImage(event) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setSelectedImage(null)
      setError('Choose a JPEG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setSelectedImage(null)
      setError('Image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }
    setSelectedImage(selected)
  }

  function removeImage() {
    setSelectedImage(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  return (
    <div className="max-w-3xl">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft size={14} />Dashboard</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Report a campus issue</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Describe the issue and where the campus team can find it.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">
        {error && <p role="alert" className="rounded-lg bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]">{error}</p>}
        {similarReports.length > 0 && <section aria-live="polite" className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
          <h2 className="text-sm font-semibold text-[var(--warning)]">Similar issues may already be reported</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Review these reports before submitting. Your report will remain separate, but campus staff may group related issues.</p>
          <ul className="mt-3 space-y-2">{similarReports.map((match) => <li key={match.reportId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <div><Link to={`/student/reports/${match.reportId}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-[var(--accent-hover)]">{match.title}</Link><p className="mt-1 text-xs text-[var(--text-muted)]">{match.category} · {match.location} · {match.similarityScore}% match</p></div>
            <span className="text-xs text-[var(--text-muted)]">{match.reportCount} {match.reportCount === 1 ? 'report' : 'reports'}</span>
          </li>)}</ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={pending} onClick={() => submitReport(true)} className="rounded-lg bg-[var(--warning)] px-4 py-2.5 text-sm font-medium text-[#1f1f1f] disabled:opacity-60">{pending ? 'Submitting…' : 'Submit anyway'}</button>
            <button type="button" onClick={() => setSimilarReports([])} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Review my report</button>
          </div>
        </section>}
        <label className="block text-sm font-medium">Title<input required minLength={4} maxLength={120} name="title" value={form.title} onChange={onChange} placeholder="Briefly describe the issue" className="field-input mt-2" /></label>
        <label className="block text-sm font-medium">Description<textarea required minLength={10} maxLength={5000} rows={5} name="description" value={form.description} onChange={onChange} placeholder="What is happening? Include details that may help resolve it." className="field-input mt-2 resize-y" /><span className="mt-1 block text-right text-[10px] font-normal text-[var(--text-muted)]">{form.description.length}/5000</span></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Category<select required name="category" value={form.category} onChange={onChange} className="field-input mt-2"><option value="">Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block text-sm font-medium">Priority<select name="priority" value={form.priority} onChange={onChange} className="field-input mt-2">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        </div>
        <label className="block text-sm font-medium">Location<input required minLength={2} maxLength={160} name="location" value={form.location} onChange={onChange} placeholder="Building, floor, or nearby landmark" className="field-input mt-2" /></label>
        <div>
          <label htmlFor="report-image" className="block text-sm font-medium">Add a photo <span className="font-normal text-[var(--text-muted)]">(optional)</span></label>
          <p className="mt-1 text-xs text-[var(--text-muted)]">JPEG, PNG, or WebP · up to 5 MB</p>
          <input ref={imageInputRef} id="report-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} disabled={pending} className="sr-only" />
          {imagePreview ? (
            <div className="relative mt-3 max-w-sm overflow-hidden rounded-xl border border-[var(--border)]">
              <img src={imagePreview} alt="Selected issue" className="max-h-64 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-muted)]">
                <span className="truncate">{image.name} · {(image.size / (1024 * 1024)).toFixed(1)} MB</span>
                <button type="button" onClick={removeImage} disabled={pending} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[var(--error)] hover:bg-[var(--error)]/10"><Trash2 size={13} />Remove</button>
              </div>
            </div>
          ) : (
            <label htmlFor="report-image" className={`mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] ${pending ? 'pointer-events-none opacity-50' : ''}`}>
              <ImagePlus size={16} />Choose image
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5"><p className="text-xs text-[var(--text-muted)]">Your account will be attached automatically.</p><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60">{pending ? 'Checking…' : 'Submit report'} {!pending && <ArrowRight size={15} />}</button></div>
      </form>
    </div>
  )
}

export default ReportIssue
