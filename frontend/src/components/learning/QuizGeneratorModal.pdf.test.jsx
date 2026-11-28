import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QuizGeneratorModal from './QuizGeneratorModal'
import { learningService } from '@/services/learningService'

vi.mock('@/services/learningService', () => ({
  learningService: {
    generateTopicQuiz: vi.fn(),
    requestPdfUploadUrl: vi.fn(),
  },
}))

vi.mock('@/services/topicService', () => ({
  topicService: {
    updateTopic: vi.fn(),
  },
}))

describe('QuizGeneratorModal PDF Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    learningService.requestPdfUploadUrl.mockResolvedValue({
      data: { configured: false },
    })
    learningService.generateTopicQuiz.mockResolvedValue({
      data: { id: 'quiz-1', title: 'PDF Quiz', questions: [] },
    })
  })

  it('reads a valid PDF file and sends sourceDocument to generateTopicQuiz', async () => {
    const onGenerated = vi.fn()
    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        topicId="topic-1"
        topicTitle="Linked List"
        subjectName="Data Structure"
        onGenerated={onGenerated}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /upload pdf/i }))

    const fileInput = document.querySelector('input[type="file"]')
    const pdfBytes = new TextEncoder().encode('%PDF-1.4\n%test\n%%EOF')
    const pdfFile = new File([pdfBytes], 'lecture-notes.pdf', {
      type: 'application/pdf',
    })
    pdfFile.arrayBuffer = async () => pdfBytes.buffer

    fireEvent.change(fileInput, { target: { files: [pdfFile] } })

    await waitFor(() => {
      expect(screen.getByText('lecture-notes.pdf')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: /generate quiz/i }))

    await waitFor(() => {
      expect(learningService.generateTopicQuiz).toHaveBeenCalledTimes(1)
    })

    const [, payload] = learningService.generateTopicQuiz.mock.calls[0]
    expect(payload.sourceDocument).toBeTruthy()
    expect(payload.sourceDocument.fileName).toBe('lecture-notes.pdf')
    expect(payload.sourceDocument.mimeType).toBe('application/pdf')
    expect(typeof payload.sourceDocument.data).toBe('string')
    expect(payload.sourceDocument.data.length).toBeGreaterThan(0)
  })

  it('shows an error if a non-PDF file is uploaded in PDF mode', async () => {
    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        topicId="topic-1"
        topicTitle="Linked List"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /upload pdf/i }))

    const fileInput = document.querySelector('input[type="file"]')
    const badBytes = new TextEncoder().encode('plain text content')
    const badFile = new File([badBytes], 'fake.pdf', {
      type: 'application/pdf',
    })
    badFile.arrayBuffer = async () => badBytes.buffer

    fireEvent.change(fileInput, { target: { files: [badFile] } })

    await waitFor(() => {
      expect(
        screen.getByText('The selected file is not a valid PDF document.'),
      ).toBeTruthy()
    })
  })

  it('uploads PDF to Upstash Blob when configured and shows relevance error when AI rejects PDF', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true })
    learningService.requestPdfUploadUrl.mockResolvedValue({
      data: {
        configured: true,
        uploadUrl: 'https://blob.upstash.io/signed-put',
        headers: { 'Content-Type': 'application/pdf' },
        blobPath: 'quiz-pdfs/user-1/unrelated-abc.pdf',
      },
    })
    learningService.generateTopicQuiz.mockRejectedValue({
      code: 'IRRELEVANT_PDF_DOCUMENT',
      message: 'The uploaded PDF ("unrelated.pdf") is not relevant to "Linked List".',
      data: { detectedTopic: 'Cooking Recipes' },
    })

    render(
      <QuizGeneratorModal
        open={true}
        onClose={vi.fn()}
        topicId="topic-1"
        topicTitle="Linked List"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /upload pdf/i }))

    const fileInput = document.querySelector('input[type="file"]')
    const pdfBytes = new TextEncoder().encode('%PDF-1.4\n%test\n%%EOF')
    const pdfFile = new File([pdfBytes], 'unrelated.pdf', {
      type: 'application/pdf',
    })
    pdfFile.arrayBuffer = async () => pdfBytes.buffer

    fireEvent.change(fileInput, { target: { files: [pdfFile] } })

    await waitFor(() => {
      expect(screen.getByText('Uploaded to Upstash')).toBeTruthy()
    })
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://blob.upstash.io/signed-put',
      expect.objectContaining({ method: 'PUT' }),
    )

    fireEvent.click(screen.getByRole('button', { name: /generate quiz/i }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'The uploaded PDF ("unrelated.pdf") is not relevant to "Linked List".',
        ),
      ).toBeTruthy()
    })

    const [, payload] = learningService.generateTopicQuiz.mock.calls[0]
    expect(payload.sourceDocument.blobPath).toBe('quiz-pdfs/user-1/unrelated-abc.pdf')
    fetchSpy.mockRestore()
  })
})
