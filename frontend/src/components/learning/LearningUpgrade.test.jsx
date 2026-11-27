import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TopicLearningHub from './TopicLearningHub'
import QuizGeneratorModal from './QuizGeneratorModal'
import MCQAssessmentModal from './MCQAssessmentModal'
import ConceptCheckModal from './ConceptCheckModal'
import FlashcardReviewModal from './FlashcardReviewModal'
import AdaptiveQuizSchedule from '@/components/revision/AdaptiveQuizSchedule'
import MasteryOverview from '@/components/revision/MasteryOverview'
import MistakeJournal from '@/components/revision/MistakeJournal'
import { learningService } from '@/services/learningService'
import { topicService } from '@/services/topicService'

describe('TopicLearningHub', () => {
  it('renders mastery, weak concepts, recent attempts, and triggers all 4 actions', async () => {
    const user = userEvent.setup()
    const onGenerateQuiz = vi.fn()
    const onStartConceptCheck = vi.fn()
    const onStartFlashcards = vi.fn()
    const onReviewMistakes = vi.fn()

    render(
      <TopicLearningHub
        topicTitle="Process Synchronization"
        subjectName="Operating Systems"
        masteryScore={72}
        onGenerateQuiz={onGenerateQuiz}
        onStartConceptCheck={onStartConceptCheck}
        onStartFlashcards={onStartFlashcards}
        onReviewMistakes={onReviewMistakes}
      />
    )

    expect(screen.getByText('Topic Learning Hub')).toBeInTheDocument()
    expect(screen.getByText('72% Mastery')).toBeInTheDocument()
    expect(screen.getByText('Coffman Deadlock Conditions')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /generate ai quiz/i }))
    await user.click(screen.getByRole('button', { name: /concept check/i }))
    await user.click(screen.getByRole('button', { name: /flashcards/i }))
    await user.click(screen.getByRole('button', { name: /review mistakes/i }))

    expect(onGenerateQuiz).toHaveBeenCalledTimes(1)
    expect(onStartConceptCheck).toHaveBeenCalledTimes(1)
    expect(onStartFlashcards).toHaveBeenCalledTimes(1)
    expect(onReviewMistakes).toHaveBeenCalledTimes(1)
  })

  it('displays AIUsageIndicator and disables exhausted AI actions', () => {
    render(
      <TopicLearningHub
        topicTitle="JDBC"
        subjectName="Java"
        aiUsage={{
          totalUsed: 10,
          totalLimit: 33,
          totalRemaining: 23,
          resetAt: '2026-11-28T00:00:00.000Z',
          features: [
            { feature: 'QUIZ_GENERATION', label: 'Quiz generation', limit: 5, used: 5, remaining: 0 },
            { feature: 'CONCEPTUAL_EVALUATION', label: 'Conceptual evaluation', limit: 15, used: 5, remaining: 10 },
            { feature: 'FLASHCARD_GENERATION', label: 'Flashcard generation', limit: 3, used: 0, remaining: 3 },
          ],
        }}
        onGenerateQuiz={vi.fn()}
        onStartConceptCheck={vi.fn()}
        onStartFlashcards={vi.fn()}
        onReviewMistakes={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Daily AI usage indicator')).toBeInTheDocument()
    expect(screen.getByText(/10 \/ 33 used/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate ai quiz/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /concept check/i })).not.toBeDisabled()
  })
})

describe('QuizGeneratorModal', () => {
  it('supports paste notes validation and generates quiz config', async () => {
    const user = userEvent.setup()
    const onGenerated = vi.fn()

    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        onGenerated={onGenerated}
        generatingDelayMs={20}
      />
    )

    await user.click(screen.getByRole('button', { name: /paste notes/i }))
    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/paste at least/i)

    await user.type(
      screen.getByLabelText(/study notes input/i),
      'Semaphores use wait() and signal() to coordinate critical sections.'
    )
    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))

    await waitFor(() => {
      expect(onGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceType: 'notes',
          difficulty: 'medium',
          questionCount: 5,
        })
      )
    })
  })

  it('handles INVALID_LEARNING_TOPIC, TOPIC_NEEDS_CLARIFICATION, and AI_SERVICE_UNAVAILABLE', async () => {
    const user = userEvent.setup()
    const onGenerated = vi.fn()

    const invalidErr = Object.assign(
      new Error("This doesn't appear to be a valid learning topic."),
      {
        status: 422,
        code: 'INVALID_LEARNING_TOPIC',
        data: { suggestion: 'Please enter a recognizable academic or technical topic.' },
      }
    )
    const clarifyErr = Object.assign(
      new Error('We need a little more context about this topic.'),
      {
        status: 422,
        code: 'TOPIC_NEEDS_CLARIFICATION',
        data: { suggestion: 'Add a short description or some study notes.' },
      }
    )
    const outageErr = Object.assign(new Error('Service Unavailable'), {
      status: 503,
      code: 'AI_SERVICE_UNAVAILABLE',
    })

    const spy = vi
      .spyOn(learningService, 'generateTopicQuiz')
      .mockRejectedValueOnce(invalidErr)
      .mockRejectedValueOnce(clarifyErr)
      .mockRejectedValueOnce(outageErr)
      .mockResolvedValueOnce({ data: { id: 'quiz-ok', questions: [] } })

    const updateSpy = vi
      .spyOn(topicService, 'updateTopic')
      .mockResolvedValue({ topic: { id: 'top-1', name: 'JDBC' } })

    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        topicId="top-1"
        topicTitle="asdfgh"
        onGenerated={onGenerated}
      />
    )

    // 1. INVALID_LEARNING_TOPIC shows inline error + topic input
    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))
    await waitFor(() => {
      expect(screen.getByText(/doesn't appear to be a valid learning topic/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/edit topic name/i)).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText(/edit topic name/i))
    await user.type(screen.getByLabelText(/edit topic name/i), 'JDBC')
    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))

    // 2. TOPIC_NEEDS_CLARIFICATION shows clarification message + notes editor
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('top-1', { name: 'JDBC' })
      expect(screen.getByText(/need a little more context/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/study notes input/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/study notes input/i), 'Java database connectivity')
    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))

    // 3. AI_SERVICE_UNAVAILABLE shows retryable message + Retry button
    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^retry$/i })).toBeInTheDocument()
    })

    // 4. Retry succeeds
    await user.click(screen.getByRole('button', { name: /^retry$/i }))
    await waitFor(() => {
      expect(onGenerated).toHaveBeenCalled()
    })

    spy.mockRestore()
    updateSpy.mockRestore()
  })

  it('handles AI_DAILY_LIMIT_REACHED and triggers onUsageChanged', async () => {
    const user = userEvent.setup()
    const onUsageChanged = vi.fn()
    const quotaErr = Object.assign(
      new Error('You have reached your daily AI usage limit.'),
      {
        status: 429,
        code: 'AI_DAILY_LIMIT_REACHED',
        data: { limit: 5, used: 5, remaining: 0, resetAt: '2026-11-28T00:00:00.000Z' },
      }
    )

    const spy = vi
      .spyOn(learningService, 'generateTopicQuiz')
      .mockRejectedValueOnce(quotaErr)

    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        topicId="top-1"
        topicTitle="JDBC"
        onUsageChanged={onUsageChanged}
      />
    )

    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))

    await waitFor(() => {
      expect(onUsageChanged).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/reached your daily ai usage limit/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^generate quiz$/i })).toBeDisabled()
    })

    spy.mockRestore()
  })

  it('aborts in-flight Gemini request and closes modal on Cancel or top-right X button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    let capturedSignal = null

    const spy = vi
      .spyOn(learningService, 'generateTopicQuiz')
      .mockImplementation((_topicId, _cfg, opts) => {
        capturedSignal = opts?.signal
        return new Promise(() => {})
      })

    const { rerender } = render(
      <QuizGeneratorModal
        open={true}
        onClose={onClose}
        topicId="top-1"
        topicTitle="Linked List"
      />
    )

    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))
    await waitFor(() => {
      expect(screen.getByText(/preparing your medium assessment/i)).toBeInTheDocument()
      expect(capturedSignal).toBeTruthy()
      expect(capturedSignal.aborted).toBe(false)
    })

    // Cancel button aborts signal and closes modal
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(capturedSignal.aborted).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)

    // Re-open and test top-right X button
    onClose.mockClear()
    capturedSignal = null
    rerender(
      <QuizGeneratorModal
        open={false}
        onClose={onClose}
        topicId="top-1"
        topicTitle="Linked List"
      />
    )
    rerender(
      <QuizGeneratorModal
        open={true}
        onClose={onClose}
        topicId="top-1"
        topicTitle="Linked List"
      />
    )

    await user.click(screen.getByRole('button', { name: /^generate quiz$/i }))
    await waitFor(() => {
      expect(capturedSignal).toBeTruthy()
      expect(capturedSignal.aborted).toBe(false)
    })

    await user.click(screen.getByRole('button', { name: /close quiz generator/i }))
    expect(capturedSignal.aborted).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
})

describe('MCQAssessmentModal', () => {
  it('supports flagging, hints, navigator grid, and results review', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <MCQAssessmentModal
        open={true}
        onClose={vi.fn()}
        difficulty="easy"
        questionCount={3}
        onComplete={onComplete}
      />
    )

    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /show hint/i }))
    expect(screen.getByText(/software-based synchronization/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /flag for review/i }))
    expect(screen.getByRole('button', { name: /^flagged$/i })).toBeInTheDocument()

    await user.click(
      screen.getByRole('radio', {
        name: /mutual exclusion for two processes in critical sections/i,
      })
    )
    await user.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText('2 of 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /jump to question 3/i }))
    expect(screen.getByText('3 of 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit quiz/i }))
    expect(screen.getByText('Assessment complete')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalled()
  })
})

describe('ConceptCheckModal', () => {
  it('submits written explanation and renders constructive feedback', async () => {
    const user = userEvent.setup()
    render(<ConceptCheckModal open={true} onClose={vi.fn()} />)

    await user.type(
      screen.getByLabelText(/your explanation/i),
      'A mutex enforces thread ownership while a binary semaphore can be signaled by any thread.'
    )
    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    expect(screen.getByText('Constructive feedback')).toBeInTheDocument()
    expect(screen.getByText('Concepts understood')).toBeInTheDocument()
    expect(screen.getByText('Missing concepts')).toBeInTheDocument()
    expect(screen.getByText('Suggested improved answer')).toBeInTheDocument()
  })
})

describe('FlashcardReviewModal', () => {
  it('flips card, rates recall, and completes session', async () => {
    const user = userEvent.setup()
    render(<FlashcardReviewModal open={true} onClose={vi.fn()} />)

    expect(screen.getByText('1 of 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reveal answer back/i }))
    expect(screen.getByText('Answer')).toBeInTheDocument()

    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: /good/i }))
    }

    expect(screen.getByText('Flashcard session complete')).toBeInTheDocument()
  })
})

describe('Adaptive Revision Views', () => {
  it('renders AdaptiveQuizSchedule filters, MasteryOverview, and MistakeJournal', async () => {
    const user = userEvent.setup()
    const onStartMiniQuiz = vi.fn()
    const onPracticeAgain = vi.fn()

    render(
      <div>
        <AdaptiveQuizSchedule onStartMiniQuiz={onStartMiniQuiz} />
        <MasteryOverview onPracticeTopic={vi.fn()} />
        <MistakeJournal onPracticeAgain={onPracticeAgain} />
      </div>
    )

    expect(screen.getByText('Adaptive Quiz Schedule')).toBeInTheDocument()
    expect(screen.getByText('Topic Mastery Overview')).toBeInTheDocument()
    expect(screen.getByText('Mistake Journal')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /overdue/i }))
    await user.click(screen.getByRole('button', { name: /start mini-quiz/i }))
    expect(onStartMiniQuiz).toHaveBeenCalledTimes(1)

    const practiceButtons = screen.getAllByRole('button', { name: /practice again/i })
    await user.click(practiceButtons[0])
    expect(onPracticeAgain).toHaveBeenCalledTimes(1)
  })
})
