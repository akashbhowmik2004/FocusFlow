import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Building,
  Target,
  Timer,
  ChevronRight,
  Check,
  User,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useApp, useSubjects } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { subjectColors, generateId } from '@/lib/utils'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, title: 'Academic identity', subtitle: 'Institution, degree & semester' },
  { id: 2, title: 'Term timeline', subtitle: 'Semester dates & session' },
  { id: 3, title: 'Academic goals', subtitle: 'Target GPA & core objectives' },
  { id: 4, title: 'Study cadence', subtitle: 'Daily hours & focus timer' },
  { id: 5, title: 'Course syllabus', subtitle: 'Enrolled subjects & exams' },
]

const SECONDARY_GOAL_OPTIONS = [
  'Master active spaced repetition',
  'Build consistent daily study habit',
  'Deep work without digital distractions',
  'Comprehensive exam & finals prep',
  'Complete reading assignments on time',
  'Maintain high academic GPA',
]

const SUBJECT_PRESETS = [
  { name: 'Data Structures & Algorithms', code: 'CS 201', color: '#059669' },
  { name: 'Computer Systems & Architecture', code: 'CS 210', color: '#3b82f6' },
  { name: 'Linear Algebra & Differential Eq.', code: 'MATH 240', color: '#8b5cf6' },
  { name: 'Operating Systems & Concurrency', code: 'CS 301', color: '#d97706' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { addSubject } = useSubjects()
  const { completeOnboarding, saveOnboardingProgress, user } = useAuth()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Step 1: Academic Identity
  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState(user?.institution || '')
  const [degree, setDegree] = useState(user?.degree || '')
  const [department, setDepartment] = useState(user?.department || '')
  const [academicYear, setAcademicYear] = useState(user?.academicYear || 1)
  const [currentSemester, setCurrentSemester] = useState(user?.currentSemester || 1)

  // Step 2: Term Timeline
  const [academicSession, setAcademicSession] = useState(user?.academicSession || '2026-2027')
  const [semesterStartDate, setSemesterStartDate] = useState(
    user?.semesterStartDate ? new Date(user.semesterStartDate).toISOString().slice(0, 10) : ''
  )
  const [semesterEndDate, setSemesterEndDate] = useState(
    user?.semesterEndDate ? new Date(user.semesterEndDate).toISOString().slice(0, 10) : ''
  )
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(
    user?.expectedGraduationYear || ''
  )

  // Step 3: Academic Goals & Vision
  const [studyGoal, setStudyGoal] = useState(
    user?.studyGoal || 'Achieve Dean\'s Honours and master core curriculum'
  )
  const [targetCgpa, setTargetCgpa] = useState(user?.targetCgpa || 3.85)
  const [secondaryGoals, setSecondaryGoals] = useState(
    user?.secondaryGoals?.length
      ? user.secondaryGoals
      : ['Master active spaced repetition', 'Build consistent daily study habit']
  )
  const [customGoal, setCustomGoal] = useState(user?.customGoal || '')

  // Step 4: Study Cadence & Preferences
  const [dailyStudyHours, setDailyStudyHours] = useState(user?.dailyStudyHours || 5)
  const [preferredStartTime, setPreferredStartTime] = useState(user?.preferredStartTime || '09:00')
  const [preferredEndTime, setPreferredEndTime] = useState(user?.preferredEndTime || '18:00')
  const [defaultFocusDuration, setDefaultFocusDuration] = useState(user?.defaultFocusDuration || 45)
  const [defaultBreakDuration, setDefaultBreakDuration] = useState(user?.defaultBreakDuration || 10)

  // Step 5: Enrolled Subjects
  const [subjectsList, setSubjectsList] = useState(
    state.subjects?.length > 0
      ? state.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code || '',
          color: s.color || '#059669',
          examDate: s.examDate ? new Date(s.examDate).toISOString().slice(0, 10) : '',
        }))
      : [
          {
            id: 'init-1',
            name: 'Data Structures & Algorithms',
            code: 'CS 201',
            color: '#059669',
            examDate: '',
          },
        ]
  )
  const [newSubName, setNewSubName] = useState('')
  const [newSubCode, setNewSubCode] = useState('')
  const [newSubColor, setNewSubColor] = useState(subjectColors[1].value)
  const [newSubExamDate, setNewSubExamDate] = useState('')

  // Sync state if user arrives/updates asynchronously
  useEffect(() => {
    if (user) {
      if (user.name) setName((prev) => prev || user.name)
      if (user.institution) setInstitution((prev) => prev || user.institution)
      if (user.degree) setDegree((prev) => prev || user.degree)
      if (user.department) setDepartment((prev) => prev || user.department)
      if (user.academicYear) setAcademicYear((prev) => (prev === 1 ? user.academicYear : prev))
      if (user.currentSemester) setCurrentSemester((prev) => (prev === 1 ? user.currentSemester : prev))
      if (user.academicSession) setAcademicSession((prev) => prev || user.academicSession)
      if (user.semesterStartDate) setSemesterStartDate((prev) => prev || new Date(user.semesterStartDate).toISOString().slice(0, 10))
      if (user.semesterEndDate) setSemesterEndDate((prev) => prev || new Date(user.semesterEndDate).toISOString().slice(0, 10))
      if (user.expectedGraduationYear) setExpectedGraduationYear((prev) => prev || user.expectedGraduationYear)
      if (user.studyGoal) setStudyGoal((prev) => prev || user.studyGoal)
      if (user.targetCgpa) setTargetCgpa((prev) => prev || user.targetCgpa)
      if (user.secondaryGoals?.length) setSecondaryGoals((prev) => (prev.length ? prev : user.secondaryGoals))
      if (user.customGoal) setCustomGoal((prev) => prev || user.customGoal)
      if (user.dailyStudyHours) setDailyStudyHours((prev) => (prev === 5 ? user.dailyStudyHours : prev))
      if (user.defaultFocusDuration) setDefaultFocusDuration((prev) => (prev === 45 ? user.defaultFocusDuration : prev))
      if (user.defaultBreakDuration) setDefaultBreakDuration((prev) => (prev === 10 ? user.defaultBreakDuration : prev))
    }
  }, [user])

  // Resume step detection based on partially saved user progress
  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      if (user.institution) {
        if (user.academicSession || user.semesterStartDate || user.expectedGraduationYear) {
          if (user.studyGoal || (user.secondaryGoals && user.secondaryGoals.length > 0)) {
            if (user.dailyStudyHours && user.dailyStudyHours !== 5) {
              setStep((s) => Math.max(s, 5))
            } else {
              setStep((s) => Math.max(s, 4))
            }
          } else {
            setStep((s) => Math.max(s, 3))
          }
        } else {
          setStep((s) => Math.max(s, 2))
        }
      }
    }
  }, [user])

  const toggleSecondaryGoal = (goalItem) => {
    setSecondaryGoals((prev) =>
      prev.includes(goalItem) ? prev.filter((g) => g !== goalItem) : [...prev, goalItem]
    )
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!institution || !institution.trim()) {
        newErrors.institution = 'University or college is required'
      }
    } else if (currentStep === 2) {
      if (semesterStartDate && semesterEndDate && new Date(semesterEndDate) < new Date(semesterStartDate)) {
        newErrors.semesterEndDate = 'Semester end date cannot be earlier than start date'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = async () => {
    if (!validateStep(step)) {
      toast.error('Please complete required fields before continuing')
      return
    }

    // Save partial progress to backend as student advances
    try {
      if (step === 1 && saveOnboardingProgress) {
        await saveOnboardingProgress({
          name: name.trim() || undefined,
          institution: institution.trim(),
          degree: degree.trim() || null,
          department: department.trim() || null,
          academicYear: Number(academicYear),
          currentSemester: Number(currentSemester),
        })
      } else if (step === 2 && saveOnboardingProgress) {
        await saveOnboardingProgress({
          academicSession: academicSession.trim() || null,
          expectedGraduationYear: expectedGraduationYear ? Number(expectedGraduationYear) : null,
          semesterStartDate: semesterStartDate || null,
          semesterEndDate: semesterEndDate || null,
        })
      } else if (step === 3 && saveOnboardingProgress) {
        await saveOnboardingProgress({
          studyGoal: studyGoal.trim() || null,
          targetCgpa: targetCgpa ? Number(targetCgpa) : null,
          secondaryGoals,
          customGoal: customGoal.trim() || null,
        })
      } else if (step === 4 && saveOnboardingProgress) {
        await saveOnboardingProgress({
          dailyStudyHours: Number(dailyStudyHours) || 5,
          preferredStartTime,
          preferredEndTime,
          defaultFocusDuration: Number(defaultFocusDuration) || 45,
          defaultBreakDuration: Number(defaultBreakDuration) || 10,
        })
      }
    } catch (err) {
      console.warn('Could not save partial onboarding progress:', err)
    }

    setStep((s) => s + 1)
  }

  const handleAddSubject = (e) => {
    if (e) e.preventDefault()
    if (!newSubName.trim()) return
    setSubjectsList((prev) => [
      ...prev,
      {
        id: generateId(),
        name: newSubName.trim(),
        code: newSubCode.trim() || undefined,
        color: newSubColor,
        examDate: newSubExamDate || undefined,
      },
    ])
    setNewSubName('')
    setNewSubCode('')
    setNewSubExamDate('')
    toast.success(`Added ${newSubName.trim()}`)
  }

  const handleAddPresetSubject = (preset) => {
    if (subjectsList.some((s) => s.name.toLowerCase() === preset.name.toLowerCase())) {
      toast.info(`${preset.name} is already added`)
      return
    }
    setSubjectsList((prev) => [
      ...prev,
      {
        id: generateId(),
        name: preset.name,
        code: preset.code,
        color: preset.color,
      },
    ])
    toast.success(`Added ${preset.name}`)
  }

  const handleRemoveSubject = (id) => {
    if (subjectsList.length <= 1) {
      toast.error('Keep at least one subject to complete setup')
      return
    }
    setSubjectsList((prev) => prev.filter((s) => s.id !== id))
  }

  const handleFinish = async () => {
    if (!institution || !institution.trim()) {
      toast.error('Institution is required to complete onboarding')
      setStep(1)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim() || user?.name || 'Student',
        institution: institution.trim(),
        degree: degree.trim() || 'General Studies',
        department: department.trim() || null,
        academicYear: Number(academicYear) || 1,
        currentSemester: Number(currentSemester) || 1,
        academicSession: academicSession.trim() || null,
        semesterStartDate: semesterStartDate || null,
        semesterEndDate: semesterEndDate || null,
        expectedGraduationYear: expectedGraduationYear ? Number(expectedGraduationYear) : null,
        studyGoal: studyGoal.trim() || null,
        secondaryGoals,
        customGoal: customGoal.trim() || null,
        targetCgpa: targetCgpa ? Number(targetCgpa) : null,
        dailyStudyHours: Number(dailyStudyHours) || 5,
        preferredStartTime,
        preferredEndTime,
        defaultFocusDuration: Number(defaultFocusDuration) || 45,
        defaultBreakDuration: Number(defaultBreakDuration) || 10,
        onboardingCompleted: true,
      }

      let updatedUser = null
      if (completeOnboarding) {
        const response = await completeOnboarding(payload)
        updatedUser = response?.user
      }

      // Add subjects to backend if not already added
      for (const subject of subjectsList) {
        const alreadyExists = (state.subjects || []).some(
          (s) => s.name.toLowerCase() === subject.name.toLowerCase()
        )
        if (!alreadyExists && addSubject && subject.name?.trim()) {
          await addSubject({
            name: subject.name.trim(),
            code: subject.code || null,
            color: subject.color,
            examDate: subject.examDate || null,
          }).catch((err) => console.warn('Could not add onboarding subject:', err))
        }
      }

      if (updatedUser) {
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser,
        })
      }

      toast.success('Academic profile configured! Welcome to FocusFlow.')
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not complete onboarding setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="h-16 max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--color-text)]">
                FocusFlow
              </span>
              <span className="ml-2 text-xs font-semibold text-[var(--color-brand)]">
                Academic Onboarding
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
            <span>Step {step} of 5</span>
            <span className="text-[var(--color-border)]">·</span>
            <span className="text-[var(--color-text)] font-semibold">{STEPS[step - 1].title}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1 bg-[var(--color-border)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-brand)]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] shrink-0" />
            Academic setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            {STEPS[step - 1].title}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {STEPS[step - 1].subtitle}
          </p>
        </div>

        {/* Step Views */}
        <AnimatePresence mode="wait">
          {/* ── Step 1: Academic Identity ────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    University / Institution <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => {
                        setInstitution(e.target.value)
                        if (errors.institution) setErrors((prev) => ({ ...prev, institution: undefined }))
                      }}
                      placeholder="e.g. Stanford University, MIT, Oxford"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.institution ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                      } bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]`}
                    />
                  </div>
                  {errors.institution && (
                    <p className="mt-1 text-xs text-rose-500">{errors.institution}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Degree & Major
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. School of Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>5th Year (Graduate)</option>
                    <option value={6}>Postgraduate / Ph.D.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Current Semester
                  </label>
                  <select
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Term Timeline ────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    placeholder="e.g. 2026-2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    min={2024}
                    max={2035}
                    value={expectedGraduationYear}
                    onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Semester Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={semesterStartDate}
                      onChange={(e) => setSemesterStartDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    Used to dynamically compute your active academic week.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Semester End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={semesterEndDate}
                      onChange={(e) => setSemesterEndDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Academic Goals & Vision ──────────────── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                  Primary Academic Goal
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    placeholder="e.g. Master Operating Systems, maintain 3.9 CGPA"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                  Target CGPA / GPA (out of 4.0 or 10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(Number(e.target.value))}
                  className="w-36 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                  Secondary Focus Priorities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECONDARY_GOAL_OPTIONS.map((goalItem) => {
                    const isSelected = secondaryGoals.includes(goalItem)
                    return (
                      <button
                        key={goalItem}
                        type="button"
                        onClick={() => toggleSecondaryGoal(goalItem)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs transition-colors ${
                          isSelected
                            ? 'border-[var(--color-scholar-emerald)] bg-emerald-50/50 text-[var(--color-text)] dark:bg-emerald-950/20'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[var(--color-scholar-emerald)] border-[var(--color-scholar-emerald)] text-white'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-medium leading-snug">{goalItem}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                  Custom Personal Statement / Vision (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Build disciplined habits, prioritize deep focus over frantic last-minute cramming."
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Study Cadence & Focus Preferences ───── */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--color-text)]">
                    Daily Study Target
                  </label>
                  <span className="text-xs font-bold text-[var(--color-scholar-emerald)]">
                    {dailyStudyHours} hours / day
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDailyStudyHours(hours)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        dailyStudyHours === hours
                          ? 'border-[var(--color-scholar-emerald)] bg-[var(--color-scholar-emerald)] text-white'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Study Window Start
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="time"
                      value={preferredStartTime}
                      onChange={(e) => setPreferredStartTime(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Study Window End
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3" />
                    <input
                      type="time"
                      value={preferredEndTime}
                      onChange={(e) => setPreferredEndTime(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Default Focus Block
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 45, 50].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDefaultFocusDuration(mins)}
                        className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                          defaultFocusDuration === mins
                            ? 'border-[var(--color-scholar-emerald)] bg-[var(--color-scholar-emerald)] text-white'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Default Short Break
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDefaultBreakDuration(mins)}
                        className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                          defaultBreakDuration === mins
                            ? 'border-[var(--color-scholar-emerald)] bg-[var(--color-scholar-emerald)] text-white'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Course Syllabus & First Subject Setup ── */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                  Enrolled Courses ({subjectsList.length})
                </label>
                <div className="space-y-2 mb-4">
                  {subjectsList.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)]">
                            {subject.name}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)]">
                            {subject.code || 'Course'}
                            {subject.examDate && ` · Exam: ${subject.examDate}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-rose-500 hover:bg-[var(--color-bg-subtle)] transition-colors"
                        title="Remove subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Presets */}
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Recommended course presets
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SUBJECT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPresetSubject(preset)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-secondary)] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Custom Add Form */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3">
                  <p className="text-xs font-semibold text-[var(--color-text)]">
                    Add custom subject
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Subject name (e.g. Database Systems)"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. CS 320)"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[var(--color-text-muted)]">Color:</span>
                      {subjectColors.slice(0, 5).map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewSubColor(c.value)}
                          className={`w-5 h-5 rounded-full transition-transform ${
                            newSubColor === c.value ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddSubject}
                      disabled={!newSubName.trim()}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add subject
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step Controls ─────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
            ) : (
              <span className="text-xs text-[var(--color-text-muted)]">
                You can adjust any setting later in Settings.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 5 ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors px-3 py-2"
                >
                  Skip
                </button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs px-5 shadow-xs"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs px-6 shadow-xs"
              >
                {isSubmitting ? (
                  'Configuring workspace...'
                ) : (
                  <>
                    Finish setup & enter workspace <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
