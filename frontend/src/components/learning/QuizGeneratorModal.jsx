import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  FileUp,
  HelpCircle,
  Layers,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  StickyNote,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { learningService } from '@/services/learningService'
import { topicService } from '@/services/topicService'

const SOURCE_OPTIONS = [
  { id: 'syllabus', label: 'Topic content / syllabus', icon: BookOpen },
  { id: 'notes', label: 'Paste notes', icon: StickyNote },
  { id: 'pdf', label: 'Upload PDF', icon: FileUp },
  { id: 'text', label: 'Upload text file', icon: FileText },
]

const QUESTION_TYPES = [
  { id: 'mcq', label: 'MCQ', desc: 'Multiple choice with explanations', icon: CheckCircle2 },
  { id: 'short-answer', label: 'Conceptual short-answer', desc: 'Written recall & feedback', icon: MessageSquareText },
  { id: 'flashcards', label: 'Flashcards', desc: 'Rapid front/back review', icon: Layers },
]

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'adaptive', label: 'Adaptive' },
]

const QUESTION_COUNTS = [3, 5, 10]

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function QuizGeneratorModal({
  open,
  onClose,
  topicId = null,
  topicTitle = 'Process Synchronization & Semaphores',
  subjectName = '',
  previousScore = null,
  currentMastery = null,
  aiUsage = null,
  onGenerated,
  onTopicRenamed,
  onUsageChanged,
  generatingDelayMs = 900,
}) {
  const [sourceType, setSourceType] = useState('syllabus')
  const [pastedNotes, setPastedNotes] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle') // 'idle' | 'ready'
  const [isDragging, setIsDragging] = useState(false)

  const [selectedTypes, setSelectedTypes] = useState(['mcq'])
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [errorMsg, setErrorMsg] = useState('')
  const [validationState, setValidationState] = useState(null) // null | { code, message, suggestion }
  const [editableTopicName, setEditableTopicName] = useState(topicTitle)
  const [isGenerating, setIsGenerating] = useState(false)

  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    setErrorMsg('')
    setValidationState(null)
    setEditableTopicName(topicTitle)
    setIsGenerating(false)
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [open, topicTitle])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, handleCancel])

  useEffect(() => {
    if (!open || !isGenerating) return

    let cancelled = false
    const controller = new AbortController()
    abortControllerRef.current = controller

    async function runGeneration() {
      const backendTypes = selectedTypes
        .map((t) => (t === 'short-answer' ? 'conceptual' : t))
        .filter((t) => t === 'mcq' || t === 'conceptual')

      // If connected to a real backend topic and requesting quiz questions, call backend validation + generation
      if (topicId && backendTypes.length > 0) {
        try {
          const trimmedEditedName = editableTopicName.trim()
          if (
            validationState?.code === 'INVALID_LEARNING_TOPIC' &&
            trimmedEditedName &&
            trimmedEditedName !== topicTitle
          ) {
            await topicService.updateTopic(topicId, { name: trimmedEditedName })
            onTopicRenamed?.(trimmedEditedName)
          }

          const res = await learningService.generateTopicQuiz(
            topicId,
            {
              difficulty,
              questionCount,
              questionTypes: backendTypes,
              customNotes: pastedNotes.trim(),
            },
            { signal: controller.signal }
          )

          if (cancelled || controller.signal.aborted) return
          abortControllerRef.current = null
          setIsGenerating(false)
          setValidationState(null)
          onUsageChanged?.()
          onGenerated?.({
            topicTitle: editableTopicName.trim() || topicTitle,
            subjectName,
            sourceType,
            selectedTypes,
            difficulty,
            questionCount,
            timerEnabled,
            timerMinutes,
            generatedQuiz: res?.data || null,
          })
        } catch (err) {
          if (cancelled || controller.signal.aborted || err?.name === 'AbortError') {
            return
          }
          abortControllerRef.current = null
          setIsGenerating(false)
          onUsageChanged?.()
          const code = err?.code || null
          if (code === 'AI_DAILY_LIMIT_REACHED') {
            const resetAt = err?.data?.resetAt
            const resetStr = resetAt
              ? new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'midnight UTC'
            setValidationState({
              code,
              message: err.message || 'You have reached your daily AI usage limit.',
              suggestion: `Used ${err?.data?.used ?? 0} of ${err?.data?.limit ?? 0}. Quota resets at ${resetStr}.`,
            })
          } else if (code === 'AI_RATE_LIMIT_EXCEEDED' || err?.status === 429) {
            setValidationState({
              code: 'AI_RATE_LIMIT_EXCEEDED',
              message: err.message || 'Too many AI requests in a short window.',
              suggestion: 'Please wait a minute and try again.',
            })
          } else if (code === 'INVALID_LEARNING_TOPIC') {
            setValidationState({
              code,
              message: err.message || "This doesn't appear to be a valid learning topic.",
              suggestion:
                err?.data?.suggestion ||
                'Please enter a recognizable academic or technical topic.',
            })
          } else if (code === 'TOPIC_NEEDS_CLARIFICATION') {
            setValidationState({
              code,
              message: err.message || 'We need a little more context about this topic.',
              suggestion:
                err?.data?.suggestion ||
                'Add a short description or some study notes.',
            })
            setSourceType('notes')
          } else if (code === 'INSUFFICIENT_UNIQUE_QUESTIONS') {
            setValidationState({
              code,
              message:
                err.message ||
                'Unable to generate enough unique questions for this topic.',
              suggestion:
                'Try switching difficulty (e.g. Hard or Adaptive) or pasting additional study notes.',
            })
          } else {
            setValidationState({
              code: 'AI_SERVICE_UNAVAILABLE',
              message:
                'AI quiz service is temporarily unavailable. Please try again.',
              suggestion: 'Your topic is saved—retry generating the quiz in a moment.',
            })
          }
        }
        return
      }

      // Local mock fallback when no backend topicId is provided (e.g., standalone/mock mode)
      const timer = setTimeout(() => {
        if (cancelled) return
        setIsGenerating(false)
        onGenerated?.({
          topicTitle: editableTopicName.trim() || topicTitle,
          subjectName,
          sourceType,
          selectedTypes,
          difficulty,
          questionCount,
          timerEnabled,
          timerMinutes,
        })
      }, generatingDelayMs)

      return () => clearTimeout(timer)
    }

    runGeneration()

    return () => {
      cancelled = true
      controller.abort()
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }, [
    open,
    isGenerating,
    topicId,
    generatingDelayMs,
    onGenerated,
    onTopicRenamed,
    topicTitle,
    editableTopicName,
    pastedNotes,
    validationState?.code,
    subjectName,
    sourceType,
    selectedTypes,
    difficulty,
    questionCount,
    timerEnabled,
    timerMinutes,
  ])

  if (!open) return null

  const isUploadSource = sourceType === 'pdf' || sourceType === 'text'

  const toggleQuestionType = (typeId) => {
    setErrorMsg('')
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    )
  }

  const handleFileSelect = (file) => {
    if (!file) return
    setErrorMsg('')
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || (sourceType === 'pdf' ? 'application/pdf' : 'text/plain'),
    })
    setUploadStatus('ready')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleGenerate = () => {
    if (selectedTypes.length === 0) {
      setErrorMsg('Select at least one question type to generate.')
      return
    }
    if (sourceType === 'notes' && pastedNotes.trim().length < 10 && validationState?.code !== 'TOPIC_NEEDS_CLARIFICATION') {
      setErrorMsg('Please paste at least a short paragraph of study notes.')
      return
    }
    if (validationState?.code === 'INVALID_LEARNING_TOPIC' && editableTopicName.trim().length < 2) {
      setErrorMsg('Please enter a meaningful topic name before retrying.')
      return
    }
    if (validationState?.code === 'TOPIC_NEEDS_CLARIFICATION' && pastedNotes.trim().length < 5) {
      setErrorMsg('Please add a short description or study notes to clarify this topic.')
      return
    }
    if (isUploadSource && !uploadedFile) {
      setErrorMsg(
        sourceType === 'pdf'
          ? 'Please attach a PDF file or choose another source.'
          : 'Please attach a text file or choose another source.'
      )
      return
    }
    setErrorMsg('')
    setIsGenerating(true)
  }

  const perTypeEstimate =
    selectedTypes.length > 0 ? Math.max(1, Math.floor(questionCount / selectedTypes.length)) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-generator-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={handleCancel}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 border-b border-[var(--color-border)] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-brand)] shrink-0" />
              <h2
                id="quiz-generator-title"
                className="text-base font-bold text-[var(--color-text)] truncate"
              >
                AI Quiz Generator
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {topicTitle}
              {subjectName ? ` · ${subjectName}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] cursor-pointer"
            aria-label="Close quiz generator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isGenerating ? (
            <div className="py-12 space-y-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-[var(--color-indigo-tint)] dark:bg-indigo-950/50 border border-[var(--color-indigo-border)] flex items-center justify-center text-[var(--color-academic-indigo)] animate-pulse motion-reduce:animate-none">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text)]">
                  Preparing your {difficulty} assessment...
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Building {questionCount} items from {sourceType === 'syllabus' ? 'topic syllabus' : sourceType === 'notes' ? 'your notes' : uploadedFile?.name || 'uploaded file'}
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-2.5 animate-pulse motion-reduce:animate-none" aria-hidden="true">
                <div className="h-4 w-5/6 mx-auto rounded bg-[var(--color-bg-muted)]" />
                <div className="h-11 w-full rounded-xl bg-[var(--color-bg-subtle)]" />
                <div className="h-11 w-full rounded-xl bg-[var(--color-bg-subtle)]" />
              </div>
            </div>
          ) : (
            <>
              {/* Adaptive Context & Quota Strip */}
              {(previousScore !== null || currentMastery !== null || aiUsage) && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs">
                  <div className="flex flex-wrap items-center gap-3 font-tabular">
                    {previousScore !== null && (
                      <span className="text-[var(--color-text-secondary)]">
                        Previous score: <strong className="text-[var(--color-text)]">{previousScore}%</strong>
                      </span>
                    )}
                    {currentMastery !== null && (
                      <span className="text-[var(--color-text-secondary)]">
                        Mastery: <strong className="text-[var(--color-text)]">{currentMastery}%</strong>
                      </span>
                    )}
                    <span className="text-[var(--color-text-secondary)] capitalize">
                      Difficulty: <strong className="text-[var(--color-text)]">{difficulty}</strong>
                    </span>
                  </div>
                  {aiUsage?.features && (
                    <span className="text-[var(--color-text-muted)] font-tabular">
                      Quiz quota left:{' '}
                      <strong className="text-[var(--color-text)]">
                        {aiUsage.features.find((f) => f.feature === 'QUIZ_GENERATION')?.remaining ?? '—'}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* Validation Error */}
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] text-xs font-medium text-[var(--color-coral-dark)] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Topic Validation Feedback (INVALID_LEARNING_TOPIC / TOPIC_NEEDS_CLARIFICATION / AI_SERVICE_UNAVAILABLE) */}
              {validationState && (
                <div
                  role="alert"
                  className={cn(
                    'p-4 rounded-xl border space-y-3',
                    validationState.code === 'INVALID_LEARNING_TOPIC'
                      ? 'border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] dark:bg-rose-950/40 dark:border-rose-800/60'
                      : validationState.code === 'TOPIC_NEEDS_CLARIFICATION'
                      ? 'border-[var(--color-amber-border)] bg-[var(--color-amber-tint)] dark:bg-amber-950/30 dark:border-amber-800/60'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)]'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {validationState.code === 'TOPIC_NEEDS_CLARIFICATION' ? (
                      <HelpCircle className="h-4 w-4 text-[var(--color-focus-amber)] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[var(--color-coral-dark)] dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-[var(--color-text)]">
                        {validationState.message}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {validationState.suggestion}
                      </p>
                    </div>
                  </div>

                  {validationState.code === 'INVALID_LEARNING_TOPIC' && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="edit-invalid-topic-name"
                        className="block text-xs font-semibold text-[var(--color-text)]"
                      >
                        Edit topic name
                      </label>
                      <input
                        id="edit-invalid-topic-name"
                        type="text"
                        value={editableTopicName}
                        onChange={(e) => {
                          setEditableTopicName(e.target.value)
                          setErrorMsg('')
                        }}
                        placeholder="e.g. JDBC, Database Normalization, Kubernetes"
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      />
                    </div>
                  )}

                  {validationState.code === 'AI_SERVICE_UNAVAILABLE' && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 1. Source Material */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--color-text)]">
                  Source material
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SOURCE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const active = sourceType === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSourceType(opt.id)
                          setErrorMsg('')
                        }}
                        aria-pressed={active}
                        className={cn(
                          'flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                          active
                            ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40 text-[var(--color-brand-text)] dark:text-blue-300'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-semibold leading-snug">
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Paste Notes Area */}
                {sourceType === 'notes' && (
                  <div className="space-y-1.5 pt-1">
                    <textarea
                      rows={4}
                      value={pastedNotes}
                      onChange={(e) => {
                        setPastedNotes(e.target.value)
                        setErrorMsg('')
                      }}
                      placeholder="Paste lecture notes, definitions, or key formulas to generate targeted questions..."
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      aria-label="Study notes input"
                    />
                    <p className="text-[11px] text-[var(--color-text-muted)] text-right font-tabular">
                      {pastedNotes.length} characters
                    </p>
                  </div>
                )}

                {/* Drag & Drop File Upload */}
                {isUploadSource && (
                  <div className="pt-1">
                    {!uploadedFile ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            fileInputRef.current?.click()
                          }
                        }}
                        className={cn(
                          'rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                          isDragging
                            ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/30'
                            : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)]'
                        )}
                      >
                        <FileUp className="h-6 w-6 mx-auto text-[var(--color-text-muted)] mb-2" />
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          Drop your {sourceType === 'pdf' ? 'PDF document' : 'text file'} here, or click to browse
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {sourceType === 'pdf' ? 'Accepts .pdf up to 10 MB' : 'Accepts .txt or .md up to 5 MB'} (local preview)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={sourceType === 'pdf' ? '.pdf,application/pdf' : '.txt,.md,text/plain'}
                          className="hidden"
                          onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-[var(--color-brand)] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] font-tabular">
                              {formatBytes(uploadedFile.size)} · {uploadedFile.type} ·{' '}
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {uploadStatus === 'ready' ? 'Ready' : 'Pending'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFile(null)
                            setUploadStatus('idle')
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                          aria-label="Remove uploaded file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Question Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[var(--color-text)]">
                    Question types
                  </label>
                  {selectedTypes.length > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)] font-tabular">
                      ~{perTypeEstimate} per selected type
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {QUESTION_TYPES.map((qt) => {
                    const Icon = qt.icon
                    const checked = selectedTypes.includes(qt.id)
                    return (
                      <button
                        key={qt.id}
                        type="button"
                        onClick={() => toggleQuestionType(qt.id)}
                        aria-pressed={checked}
                        className={cn(
                          'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                          checked
                            ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-subtle)]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 mt-0.5 shrink-0',
                            checked ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
                          )}
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-[var(--color-text)]">
                            {qt.label}
                          </span>
                          <span className="block text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            {qt.desc}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Difficulty & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-[var(--color-text)]">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTIES.map((d) => {
                      const active = difficulty === d.id
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDifficulty(d.id)}
                          aria-pressed={active}
                          className={cn(
                            'py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                            active
                              ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40 text-[var(--color-brand-text)] dark:text-blue-300'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                          )}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-[var(--color-text)]">
                    Number of questions
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUESTION_COUNTS.map((cnt) => {
                      const active = questionCount === cnt
                      return (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setQuestionCount(cnt)}
                          aria-pressed={active}
                          className={cn(
                            'py-2 px-3 rounded-lg border text-xs font-semibold font-tabular transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                            active
                              ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40 text-[var(--color-brand-text)] dark:text-blue-300'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                          )}
                        >
                          {cnt}
                        </button>
                      )
                    })}
                  </div>

                  {/* Optional Timer Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={timerEnabled}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                        className="rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                      />
                      <Timer className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      <span>Enable quiz timer</span>
                    </label>

                    {timerEnabled && (
                      <select
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Number(e.target.value))}
                        aria-label="Timer duration in minutes"
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-tabular text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      >
                        <option value={5}>5 min</option>
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 border-t border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || validationState?.code === 'AI_DAILY_LIMIT_REACHED'}
          >
            <Sparkles className="h-4 w-4" />
            Generate Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
