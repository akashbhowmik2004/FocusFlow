import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  BookOpen,
  Plus,
  Search,
  Timer,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react'
import { useApp, useSubjects } from '@/context/AppContext'
import { subjectColors, generateId, cn } from '@/lib/utils'
import { getDaysUntil, formatDate } from '@/lib/dates'
import Button from '@/components/ui/Button'
import Card, { SubjectCard } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function Subjects() {
  const { state } = useApp()
  const { subjects, addSubject } = useSubjects()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [color, setColor] = useState(subjectColors[0].value)
  const [examDate, setExamDate] = useState('')

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Subject name is required')
      return
    }

    addSubject({
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      examDate: examDate || undefined,
    })

    toast.success(`Created subject "${name.trim()}"!`)
    setName('')
    setCode('')
    setExamDate('')
    setAddDialogOpen(false)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Subjects & Syllabus
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your courses, syllabi chapters, and exam schedules in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Filter subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-2.5" />
          </div>

          <Button
            size="default"
            onClick={() => setAddDialogOpen(true)}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          bordered
          title={search ? 'No matching subjects found' : 'No subjects added yet'}
          description={
            search
              ? `No subjects match "${search}". Try clearing your search.`
              : 'Add your first semester course to organize its syllabus topics.'
          }
          action={
            <Button onClick={() => setAddDialogOpen(true)} size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const total = sub.topics?.length || 0
            const completed = sub.topics?.filter((t) => t.status === 'completed').length || 0
            const daysLeft = sub.examDate ? getDaysUntil(sub.examDate) : null

            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                totalTopics={total}
                completedTopics={completed}
                daysLeft={daysLeft}
              />
            )
          })}
        </div>
      )}

      {/* Add Subject Modal Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Add Course / Subject"
        description="Enter the course title, optional course code, color theme, and exam date."
      >
        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Course Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CS450"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
              Color Palette Theme
            </label>
            <div className="flex items-center gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c.value ? 'scale-115 border-slate-900 shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Upcoming Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Create Subject
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
