import { generateId } from '@/lib/utils'

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

// Helper to get date string offset from today
function dateOffset(days) {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const mockSubjects = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    color: '#3b82f6',
    colorBg: '#dbeafe',
    examDate: dateOffset(28),
    topics: [
      { id: 'top-1', name: 'Arrays & Linked Lists', status: 'completed', lastRevised: dateOffset(-3), nextRevision: dateOffset(4) },
      { id: 'top-2', name: 'Stacks & Queues', status: 'completed', lastRevised: dateOffset(-5), nextRevision: dateOffset(2) },
      { id: 'top-3', name: 'Binary Trees', status: 'in-progress', lastRevised: dateOffset(-1), nextRevision: dateOffset(6) },
      { id: 'top-4', name: 'Graph Algorithms', status: 'in-progress', lastRevised: null, nextRevision: dateOffset(1) },
      { id: 'top-5', name: 'Dynamic Programming', status: 'not-started', lastRevised: null, nextRevision: dateOffset(8) },
      { id: 'top-6', name: 'Sorting Algorithms', status: 'completed', lastRevised: dateOffset(-2), nextRevision: dateOffset(5) },
      { id: 'top-7', name: 'Hashing', status: 'not-started', lastRevised: null, nextRevision: dateOffset(10) },
    ],
  },
  {
    id: 'sub-2',
    name: 'Operating Systems',
    code: 'CS301',
    color: '#8b5cf6',
    colorBg: '#ede9fe',
    examDate: dateOffset(35),
    topics: [
      { id: 'top-8', name: 'Process Management', status: 'completed', lastRevised: dateOffset(-2), nextRevision: dateOffset(5) },
      { id: 'top-9', name: 'Memory Management', status: 'in-progress', lastRevised: dateOffset(-1), nextRevision: dateOffset(3) },
      { id: 'top-10', name: 'File Systems', status: 'not-started', lastRevised: null, nextRevision: dateOffset(7) },
      { id: 'top-11', name: 'CPU Scheduling', status: 'completed', lastRevised: dateOffset(-4), nextRevision: dateOffset(3) },
      { id: 'top-12', name: 'Deadlocks', status: 'not-started', lastRevised: null, nextRevision: dateOffset(9) },
    ],
  },
  {
    id: 'sub-3',
    name: 'Linear Algebra',
    code: 'MATH202',
    color: '#22c55e',
    colorBg: '#dcfce7',
    examDate: dateOffset(21),
    topics: [
      { id: 'top-13', name: 'Matrices & Determinants', status: 'completed', lastRevised: dateOffset(-1), nextRevision: dateOffset(6) },
      { id: 'top-14', name: 'Vector Spaces', status: 'in-progress', lastRevised: dateOffset(-2), nextRevision: dateOffset(1) },
      { id: 'top-15', name: 'Eigenvalues & Eigenvectors', status: 'not-started', lastRevised: null, nextRevision: dateOffset(5) },
      { id: 'top-16', name: 'Linear Transformations', status: 'not-started', lastRevised: null, nextRevision: dateOffset(8) },
    ],
  },
  {
    id: 'sub-4',
    name: 'Database Systems',
    code: 'CS302',
    color: '#f97316',
    colorBg: '#ffedd5',
    examDate: dateOffset(42),
    topics: [
      { id: 'top-17', name: 'ER Modeling', status: 'completed', lastRevised: dateOffset(-3), nextRevision: dateOffset(4) },
      { id: 'top-18', name: 'Normalization', status: 'completed', lastRevised: dateOffset(-1), nextRevision: dateOffset(6) },
      { id: 'top-19', name: 'SQL Queries', status: 'in-progress', lastRevised: dateOffset(-2), nextRevision: dateOffset(2) },
      { id: 'top-20', name: 'Transactions & Concurrency', status: 'not-started', lastRevised: null, nextRevision: dateOffset(7) },
      { id: 'top-21', name: 'Indexing & Hashing', status: 'not-started', lastRevised: null, nextRevision: dateOffset(11) },
    ],
  },
  {
    id: 'sub-5',
    name: 'Computer Networks',
    code: 'CS303',
    color: '#ec4899',
    colorBg: '#fce7f3',
    examDate: dateOffset(49),
    topics: [
      { id: 'top-22', name: 'OSI & TCP/IP Models', status: 'completed', lastRevised: dateOffset(-4), nextRevision: dateOffset(3) },
      { id: 'top-23', name: 'Network Layer Protocols', status: 'in-progress', lastRevised: null, nextRevision: dateOffset(2) },
      { id: 'top-24', name: 'Transport Layer', status: 'not-started', lastRevised: null, nextRevision: dateOffset(6) },
      { id: 'top-25', name: 'Application Layer', status: 'not-started', lastRevised: null, nextRevision: dateOffset(9) },
    ],
  },
]

export const mockSessions = [
  // Today's sessions
  { id: 'ses-1', subjectId: 'sub-1', topicId: 'top-3', title: 'Binary Trees — Traversals', date: todayStr, startTime: '09:00', endTime: '10:30', duration: 90, status: 'completed' },
  { id: 'ses-2', subjectId: 'sub-3', topicId: 'top-14', title: 'Vector Spaces — Basis & Dimension', date: todayStr, startTime: '11:00', endTime: '12:00', duration: 60, status: 'in-progress' },
  { id: 'ses-3', subjectId: 'sub-2', topicId: 'top-9', title: 'Memory Management — Paging', date: todayStr, startTime: '14:00', endTime: '15:30', duration: 90, status: 'upcoming' },
  { id: 'ses-4', subjectId: 'sub-4', topicId: 'top-19', title: 'SQL Joins & Subqueries', date: todayStr, startTime: '16:00', endTime: '17:00', duration: 60, status: 'upcoming' },

  // Yesterday
  { id: 'ses-5', subjectId: 'sub-1', topicId: 'top-6', title: 'Sorting — Quick Sort & Merge Sort', date: dateOffset(-1), startTime: '09:00', endTime: '10:30', duration: 90, status: 'completed' },
  { id: 'ses-6', subjectId: 'sub-2', topicId: 'top-8', title: 'Process Synchronization', date: dateOffset(-1), startTime: '11:00', endTime: '12:00', duration: 60, status: 'completed' },
  { id: 'ses-7', subjectId: 'sub-3', topicId: 'top-13', title: 'Matrices — Row Reduction', date: dateOffset(-1), startTime: '14:00', endTime: '15:00', duration: 60, status: 'completed' },

  // 2 days ago
  { id: 'ses-8', subjectId: 'sub-4', topicId: 'top-18', title: 'Normalization — BCNF', date: dateOffset(-2), startTime: '10:00', endTime: '11:30', duration: 90, status: 'completed' },
  { id: 'ses-9', subjectId: 'sub-5', topicId: 'top-22', title: 'TCP/IP Protocol Stack', date: dateOffset(-2), startTime: '14:00', endTime: '15:00', duration: 60, status: 'completed' },

  // 3 days ago
  { id: 'ses-10', subjectId: 'sub-1', topicId: 'top-1', title: 'Arrays — Practice Problems', date: dateOffset(-3), startTime: '09:00', endTime: '10:00', duration: 60, status: 'completed' },
  { id: 'ses-11', subjectId: 'sub-4', topicId: 'top-17', title: 'ER Diagrams Practice', date: dateOffset(-3), startTime: '11:00', endTime: '12:00', duration: 60, status: 'completed' },

  // 4 days ago
  { id: 'ses-12', subjectId: 'sub-2', topicId: 'top-11', title: 'CPU Scheduling Algorithms', date: dateOffset(-4), startTime: '10:00', endTime: '11:30', duration: 90, status: 'completed' },
  { id: 'ses-13', subjectId: 'sub-5', topicId: 'top-22', title: 'OSI Model Deep Dive', date: dateOffset(-4), startTime: '14:00', endTime: '15:30', duration: 90, status: 'completed' },

  // 5 days ago
  { id: 'ses-14', subjectId: 'sub-1', topicId: 'top-2', title: 'Stacks Implementation', date: dateOffset(-5), startTime: '09:00', endTime: '10:00', duration: 60, status: 'completed' },
  { id: 'ses-15', subjectId: 'sub-3', topicId: 'top-13', title: 'Determinants Computation', date: dateOffset(-5), startTime: '11:00', endTime: '12:00', duration: 60, status: 'missed' },

  // 6 days ago
  { id: 'ses-16', subjectId: 'sub-2', topicId: 'top-8', title: 'Process Creation & Termination', date: dateOffset(-6), startTime: '09:00', endTime: '10:30', duration: 90, status: 'completed' },

  // Tomorrow
  { id: 'ses-17', subjectId: 'sub-1', topicId: 'top-4', title: 'Graph — BFS & DFS', date: dateOffset(1), startTime: '09:00', endTime: '10:30', duration: 90, status: 'upcoming' },
  { id: 'ses-18', subjectId: 'sub-3', topicId: 'top-15', title: 'Eigenvalues Introduction', date: dateOffset(1), startTime: '11:00', endTime: '12:00', duration: 60, status: 'upcoming' },
  { id: 'ses-19', subjectId: 'sub-4', topicId: 'top-19', title: 'Advanced SQL — Aggregations', date: dateOffset(1), startTime: '14:00', endTime: '15:00', duration: 60, status: 'upcoming' },

  // Day after tomorrow
  { id: 'ses-20', subjectId: 'sub-2', topicId: 'top-9', title: 'Virtual Memory & Swapping', date: dateOffset(2), startTime: '10:00', endTime: '11:30', duration: 90, status: 'upcoming' },
  { id: 'ses-21', subjectId: 'sub-5', topicId: 'top-23', title: 'IP Addressing & Subnetting', date: dateOffset(2), startTime: '14:00', endTime: '15:30', duration: 90, status: 'upcoming' },

  // +3 days
  { id: 'ses-22', subjectId: 'sub-1', topicId: 'top-5', title: 'DP — Fibonacci & Knapsack', date: dateOffset(3), startTime: '09:00', endTime: '11:00', duration: 120, status: 'upcoming' },
  { id: 'ses-23', subjectId: 'sub-3', topicId: 'top-14', title: 'Vector Spaces — Problems', date: dateOffset(3), startTime: '14:00', endTime: '15:00', duration: 60, status: 'upcoming' },
]

export const mockUser = {
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatar: null,
  studyGoal: 'Ace my semester exams',
  dailyStudyHours: 5,
  preferredStartTime: '09:00',
  preferredEndTime: '18:00',
  reminderEnabled: true,
  theme: 'light',
}

export const weeklyStudyData = [
  { day: 'Mon', planned: 300, completed: 270 },
  { day: 'Tue', planned: 240, completed: 240 },
  { day: 'Wed', planned: 300, completed: 210 },
  { day: 'Thu', planned: 270, completed: 270 },
  { day: 'Fri', planned: 240, completed: 180 },
  { day: 'Sat', planned: 180, completed: 180 },
  { day: 'Sun', planned: 120, completed: 90 },
]

export const subjectProgressData = mockSubjects.map((s) => {
  const completed = s.topics.filter((t) => t.status === 'completed').length
  const total = s.topics.length
  return {
    name: s.code || s.name.substring(0, 8),
    fullName: s.name,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    color: s.color,
  }
})

export function getSubjectById(id) {
  return mockSubjects.find((s) => s.id === id)
}

export function getSessionsForDate(dateStr) {
  return mockSessions.filter((s) => s.date === dateStr)
}

export function getTodaySessions() {
  return getSessionsForDate(todayStr)
}

export function getUpcomingExams() {
  return mockSubjects
    .filter((s) => s.examDate)
    .map((s) => ({
      subject: s.name,
      code: s.code,
      color: s.color,
      date: s.examDate,
      daysLeft: Math.ceil((new Date(s.examDate) - today) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export function getRevisionsDue() {
  const allTopics = mockSubjects.flatMap((s) =>
    s.topics.map((t) => ({ ...t, subjectName: s.name, subjectColor: s.color, subjectId: s.id }))
  )

  const overdue = allTopics.filter(
    (t) => t.nextRevision && new Date(t.nextRevision) < today && t.status !== 'completed'
  )
  const dueToday = allTopics.filter(
    (t) => t.nextRevision && t.nextRevision === todayStr
  )
  const upcoming = allTopics.filter(
    (t) => t.nextRevision && new Date(t.nextRevision) > today
  ).sort((a, b) => new Date(a.nextRevision) - new Date(b.nextRevision))

  return { overdue, dueToday, upcoming }
}

export function getStudyStats() {
  const todaySessions = getTodaySessions()
  const completedToday = todaySessions.filter((s) => s.status === 'completed')
  const totalPlannedMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0)
  const completedMinutes = completedToday.reduce((acc, s) => acc + s.duration, 0)

  const allCompleted = mockSessions.filter((s) => s.status === 'completed')
  const totalStudiedMinutes = allCompleted.reduce((acc, s) => acc + s.duration, 0)

  const allTopics = mockSubjects.flatMap((s) => s.topics)
  const completedTopics = allTopics.filter((t) => t.status === 'completed')

  return {
    todayPlanned: totalPlannedMinutes,
    todayCompleted: completedMinutes,
    todaySessions: todaySessions.length,
    todayCompletedSessions: completedToday.length,
    totalStudiedMinutes,
    totalTopics: allTopics.length,
    completedTopics: completedTopics.length,
    completionRate: Math.round((completedTopics.length / allTopics.length) * 100),
    weeklyAverage: Math.round(totalStudiedMinutes / 7),
  }
}
