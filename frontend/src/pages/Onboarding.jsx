import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  GraduationCap,
  Plus,
  Trash2,
  Award
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { subjectColors, generateId } from '@/lib/utils'
import { toast } from 'sonner'

export default function Onboarding() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { updateUser } = useAuth()

  const [step, setStep] = useState(1)
  const totalSteps = 6

  // Form states across steps
  const [goal, setGoal] = useState(state.user?.studyGoal || '')
  const [context, setContext] = useState('University / College')
  const [subjectsList, setSubjectsList] = useState([
    { id: 'onb-1', name: 'Data Structures & Algorithms', code: 'CS201', color: '#3b82f6' },
    { id: 'onb-2', name: 'Linear Algebra', code: 'MATH202', color: '#22c55e' },
  ])
  const [newSubName, setNewSubName] = useState('')
  const [newSubCode, setNewSubCode] = useState('')
  const [newSubColor, setNewSubColor] = useState(subjectColors[1].value)
  const [examSubject, setExamSubject] = useState('Linear Algebra')
  const [examDate, setExamDate] = useState('2026-11-20')
  const [dailyHours, setDailyHours] = useState(5)
  const [preferredTime, setPreferredTime] = useState('Morning (09:00 - 13:00)')

  const handleAddSubject = (e) => {
    e.preventDefault()
    if (!newSubName.trim()) return
    setSubjectsList([
      ...subjectsList,
      {
        id: generateId(),
        name: newSubName.trim(),
        code: newSubCode.trim() || undefined,
        color: newSubColor,
      },
    ])
    setNewSubName('')
    setNewSubCode('')
    toast.success(`Added ${newSubName.trim()}`)
  }

  const handleRemoveSubject = (id) => {
    if (subjectsList.length <= 1) {
      toast.error('Keep at least one subject to begin')
      return
    }
    setSubjectsList(subjectsList.filter((s) => s.id !== id))
  }

  const handleFinish = async () => {
    try {
      if (updateUser) {
        await updateUser({
          studyGoal: goal,
          dailyStudyHours: dailyHours,
        })
      }
    } catch (err) {
      console.warn('Failed to save onboarding preferences to server:', err)
    }

    // Save onboarding preferences into global context
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        studyGoal: goal,
        dailyStudyHours: dailyHours,
      },
    })

    toast.success('Your personalized study space is ready!')
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5 font-bold text-lg text-[var(--color-text)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span>FocusFlow Setup</span>
        </div>
        <div className="text-xs font-semibold text-[var(--color-text-muted)]">
          Step {step} of {totalSteps}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mt-2 mb-6">
        <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-brand)]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Cards Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Goal */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand)] border border-[var(--color-brand-100)] flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Welcome to FocusFlow!</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  What is your primary academic goal right now?
                </p>

                <div className="mt-6 space-y-2.5">
                  {[
                    'Ace my semester exams',
                    'Prepare for a competitive examination',
                    'Build a consistent daily study habit',
                    'Master complex technical coursework',
                  ].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        goal === g
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)] text-[var(--color-brand-text)] shadow-xs'
                          : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      <span>{g}</span>
                      {goal === g && <CheckCircle2 className="w-5 h-5 text-[var(--color-brand)] shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Context */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-info-light)] text-[var(--color-info-text)] border border-[var(--color-info-border)] flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">What is your study context?</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  This tailors your planning defaults and weekly recommendations.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'University / College', sub: 'Semester courses & finals' },
                    { title: 'Competitive Exams', sub: 'Long-term intensive prep' },
                    { title: 'High School / Prep', sub: 'AP, IB or board exams' },
                    { title: 'Self-Directed Learner', sub: 'Certifications & skills' },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => setContext(item.title)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        context === item.title
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)] text-[var(--color-brand-text)] shadow-xs'
                          : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{item.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Add Initial Subjects */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Add your active subjects</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Add 2 or more courses you need to study this semester.
                </p>

                <div className="mt-5 space-y-2">
                  {subjectsList.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                        <span className="font-semibold text-[var(--color-text)]">{sub.name}</span>
                        {sub.code && <span className="text-[var(--color-text-muted)]">({sub.code})</span>}
                      </div>
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1 rounded text-red-500 hover:bg-[var(--color-error-light)]"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSubject} className="mt-5 pt-4 border-t border-[var(--color-border-light)] space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Subject name (e.g. Operating Systems)"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="col-span-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                    <input
                      type="text"
                      placeholder="Code (optional)"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="col-span-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {subjectColors.slice(0, 6).map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewSubColor(c.value)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            newSubColor === c.value ? 'scale-115 border-[var(--color-text)] shadow-xs' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>

                    <Button type="submit" size="sm" variant="secondary" className="text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Upcoming Exam (Optional) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">When is your next big exam?</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Optional. This activates countdown indicators and prioritization meters.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      Target Subject
                    </label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    >
                      {subjectsList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} {s.code ? `(${s.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Daily Study Availability */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Daily Study Availability</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  How many hours can you realistically dedicate to focused study each day?
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                      Target Daily Study: <span className="text-[var(--color-brand)] font-bold">{dailyHours} Hours</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[2, 3, 4, 5, 6].map((hrs) => (
                        <button
                          key={hrs}
                          onClick={() => setDailyHours(hrs)}
                          className={`py-3 rounded-xl border text-center text-sm font-bold transition-all cursor-pointer ${
                            dailyHours === hrs
                              ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)] text-[var(--color-brand-text)]'
                              : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                          }`}
                        >
                          {hrs}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                      Preferred Study Time Block
                    </label>
                    <div className="space-y-2">
                      {[
                        'Morning (09:00 - 13:00)',
                        'Afternoon (13:00 - 17:00)',
                        'Evening / Night (18:00 - 22:00)',
                      ].map((time) => (
                        <button
                          key={time}
                          onClick={() => setPreferredTime(time)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            preferredTime === time
                              ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)] text-[var(--color-brand-text)]'
                              : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                          }`}
                        >
                          <span>{time}</span>
                          {preferredTime === time && <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Finish */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">You're all set!</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Here is a preview of your personalized FocusFlow configuration:
                </p>

                <div className="mt-5 space-y-2.5 text-xs bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border)]">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-light)]">
                    <span className="text-[var(--color-text-muted)]">Academic Goal:</span>
                    <span className="font-bold text-[var(--color-text)]">{goal}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-light)]">
                    <span className="text-[var(--color-text-muted)]">Context:</span>
                    <span className="font-bold text-[var(--color-text)]">{context}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-light)]">
                    <span className="text-[var(--color-text-muted)]">Active Courses:</span>
                    <span className="font-bold text-[var(--color-text)]">{subjectsList.length} subjects</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-light)]">
                    <span className="text-[var(--color-text-muted)]">Daily Availability:</span>
                    <span className="font-bold text-[var(--color-text)]">{dailyHours} hours/day</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-muted)]">Upcoming Exam:</span>
                    <span className="font-bold text-indigo-600">{examSubject} on {examDate}</span>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <Button
                    onClick={handleFinish}
                    size="lg"
                    className="w-full justify-center text-sm font-bold shadow-lg"
                  >
                    Enter My Study Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {step < 6 && (
            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {step === 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(step + 1)}
                    className="text-xs"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  className="gap-1.5"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <footer className="max-w-2xl mx-auto w-full text-center text-xs text-[var(--color-text-muted)] py-3">
        FocusFlow adapts dynamically to your study pace as you complete sessions.
      </footer>
    </div>
  )
}
