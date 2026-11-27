import QuizGeneratorModal from './QuizGeneratorModal'
import MCQAssessmentModal from './MCQAssessmentModal'
import ConceptCheckModal from './ConceptCheckModal'
import FlashcardReviewModal from './FlashcardReviewModal'
import MistakeReviewModal from './MistakeReviewModal'

export default function TopicLearningModals({
  activeModal, // null | 'generator' | 'mcq' | 'concept' | 'flashcards' | 'mistakes'
  onSetModal,
  topicId = null,
  topicTitle,
  subjectName,
  previousScore = null,
  currentMastery = null,
  aiUsage = null,
  quizConfig,
  onSetQuizConfig,
  onQuizComplete,
  onConceptComplete,
  onTopicRenamed,
  onUsageChanged,
}) {
  const close = () => onSetModal(null)

  return (
    <>
      <QuizGeneratorModal
        open={activeModal === 'generator'}
        onClose={close}
        topicId={topicId}
        topicTitle={topicTitle}
        subjectName={subjectName}
        previousScore={previousScore}
        currentMastery={currentMastery}
        aiUsage={aiUsage}
        onTopicRenamed={onTopicRenamed}
        onUsageChanged={onUsageChanged}
        onGenerated={(config) => {
          onSetQuizConfig?.(config)
          const firstType = config.selectedTypes?.[0] || 'mcq'
          if (firstType === 'short-answer') {
            onSetModal('concept')
          } else if (firstType === 'flashcards') {
            onSetModal('flashcards')
          } else {
            onSetModal('mcq')
          }
        }}
      />

      <MCQAssessmentModal
        open={activeModal === 'mcq'}
        onClose={close}
        generatedQuiz={quizConfig?.generatedQuiz || null}
        topicTitle={topicTitle}
        subjectName={subjectName}
        difficulty={quizConfig?.difficulty || 'medium'}
        questionCount={quizConfig?.questionCount || 5}
        timerEnabled={quizConfig?.timerEnabled ?? true}
        onComplete={onQuizComplete}
        onStartFlashcards={() => onSetModal('flashcards')}
        onGenerateNewTest={() => onSetModal('generator')}
      />

      <ConceptCheckModal
        open={activeModal === 'concept'}
        onClose={close}
        topicId={topicId}
        topicTitle={topicTitle}
        subjectName={subjectName}
        onComplete={onConceptComplete}
        onUsageChanged={onUsageChanged}
      />

      <FlashcardReviewModal
        open={activeModal === 'flashcards'}
        onClose={close}
        topicId={topicId}
        topicTitle={topicTitle}
        subjectName={subjectName}
        onUsageChanged={onUsageChanged}
      />

      <MistakeReviewModal
        open={activeModal === 'mistakes'}
        onClose={close}
        topicId={topicId}
        topicTitle={topicTitle}
        onPracticeAgain={() => onSetModal('mcq')}
        onResolved={onUsageChanged}
      />
    </>
  )
}
