export const TOPIC_LEARNING_HUB_DEFAULTS = {
  masteryScore: 72,
  learningProgress: 68,
  lastStudiedLabel: '2 days ago',
  quizPerformanceSummary: '78% avg across 3 quizzes',
  upcomingRevisionLabel: 'Tomorrow',
  weakConcepts: [
    'Coffman Deadlock Conditions',
    'Binary vs Counting Semaphores',
    'Priority Inversion',
  ],
  recentAttempts: [
    {
      id: 'att-1',
      type: 'AI Quiz (MCQ)',
      dateLabel: '2 days ago',
      scoreLabel: '80% (4/5)',
      difficulty: 'Medium',
    },
    {
      id: 'att-2',
      type: 'Concept Check',
      dateLabel: '5 days ago',
      scoreLabel: '7.5 / 10',
      difficulty: 'Medium',
    },
    {
      id: 'att-3',
      type: 'Flashcards',
      dateLabel: '1 week ago',
      scoreLabel: '12 cards reviewed',
      difficulty: 'Adaptive',
    },
  ],
}

export const MOCK_MCQ_QUESTIONS = [
  {
    id: 'mcq-1',
    difficulty: 'easy',
    question: "What primary problem does Peterson's Algorithm solve in concurrent systems?",
    options: [
      'Deadlock detection in distributed clusters',
      'Mutual exclusion for two processes in critical sections',
      'Dynamic heap memory compaction',
      'Thread priority inversion in real-time kernels',
    ],
    correctAnswer: 'Mutual exclusion for two processes in critical sections',
    hint: 'Think about classical software-based synchronization between two competing threads.',
    explanation:
      "Peterson's algorithm is a classic software-based mutual exclusion solution for two processes sharing a single-use resource without hardware atomic instructions.",
  },
  {
    id: 'mcq-2',
    difficulty: 'easy',
    question:
      'Which of the following is NOT one of the four Coffman conditions required for a deadlock?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemption',
      'Circular Wait',
    ],
    correctAnswer: 'Preemption',
    hint: 'Consider whether resources can be forcibly taken away during a deadlock.',
    explanation:
      'Deadlock requires No Preemption — meaning resources already allocated to a process cannot be forcibly reclaimed until the process voluntarily releases them.',
  },
  {
    id: 'mcq-3',
    difficulty: 'medium',
    question:
      'What happens when `wait()` (or `P()`) is invoked on a counting semaphore whose current value is 0?',
    options: [
      'The calling process increments the semaphore and enters immediately',
      'The calling process is blocked until another process calls signal()',
      'A kernel panic or segmentation fault is raised',
      'The semaphore value resets to its initial capacity',
    ],
    correctAnswer:
      'The calling process is blocked until another process calls signal()',
    hint: 'A semaphore value of 0 indicates no remaining permits are available.',
    explanation:
      'When a counting semaphore reaches 0, any thread calling wait() cannot acquire a permit and is placed in the waiting queue until signal() increments the count.',
  },
  {
    id: 'mcq-4',
    difficulty: 'medium',
    question:
      'In the bounded-buffer Producer-Consumer problem, why must the mutex lock be acquired AFTER `wait(empty)`?',
    options: [
      'To increase CPU cache locality for consumer threads',
      'To avoid deadlock if a producer holds the mutex while waiting for an empty slot',
      'Because counting semaphores cannot be called inside critical sections',
      'To allow multiple producers to write to the same index simultaneously',
    ],
    correctAnswer:
      'To avoid deadlock if a producer holds the mutex while waiting for an empty slot',
    hint: 'Imagine what happens if the buffer is full and the producer already holds the mutex.',
    explanation:
      'If a producer acquires the mutex first when the buffer is full, it will block on wait(empty) while holding the mutex, preventing consumers from ever acquiring the mutex to free a slot.',
  },
  {
    id: 'mcq-5',
    difficulty: 'medium',
    question:
      'What is the key semantic difference between a binary semaphore and a mutex?',
    options: [
      'A mutex enforces ownership: only the acquiring thread should release it',
      'A binary semaphore allows up to 4 concurrent threads',
      'A mutex cannot be used in user-space libraries',
      'A binary semaphore automatically resolves priority inversion',
    ],
    correctAnswer:
      'A mutex enforces ownership: only the acquiring thread should release it',
    hint: 'Think about which thread is permitted to unlock or signal.',
    explanation:
      'Mutexes have strict ownership semantics (only the locking thread may unlock), whereas binary semaphores can be signaled by any thread (useful for event signaling).',
  },
  {
    id: 'mcq-6',
    difficulty: 'hard',
    question:
      'How does Priority Inheritance mitigate priority inversion in real-time operating systems?',
    options: [
      'By terminating any low-priority thread holding a kernel lock',
      'By temporarily elevating the lock-holding low-priority thread to the priority of the highest waiting thread',
      'By disabling all hardware interrupts during user-mode execution',
      'By converting all mutexes into lock-free ring buffers',
    ],
    correctAnswer:
      'By temporarily elevating the lock-holding low-priority thread to the priority of the highest waiting thread',
    hint: 'The goal is to help the lock holder finish and release the resource quickly.',
    explanation:
      'Priority inheritance boosts the low-priority lock holder so medium-priority threads cannot preempt it, allowing it to exit the critical section and unblock the high-priority thread.',
  },
  {
    id: 'mcq-7',
    difficulty: 'hard',
    question:
      'Why do Mesa-style monitors require a `while` loop rather than an `if` statement around `wait()` on a condition variable?',
    options: [
      'Because `while` loops execute faster in modern JIT compilers',
      'Because another thread may alter the condition between signal() and when the woken thread re-acquires the lock',
      'Because `if` statements cannot evaluate boolean predicates inside monitors',
      'Because Mesa monitors automatically release all locks on exit',
    ],
    correctAnswer:
      'Because another thread may alter the condition between signal() and when the woken thread re-acquires the lock',
    hint: 'Consider spurious wakeups and competing threads entering before the woken thread resumes.',
    explanation:
      'In Mesa semantics, signal() is a hint; the notified thread must re-acquire the monitor lock and re-check the predicate in a while loop in case another thread invalidated it.',
  },
  {
    id: 'mcq-8',
    difficulty: 'easy',
    question:
      'Which hardware instruction atomically updates a memory location only if it matches an expected value?',
    options: [
      'Compare-and-Swap (CAS)',
      'Branch-if-Zero',
      'Context-Switch-Trap',
      'Direct Memory Access (DMA)',
    ],
    correctAnswer: 'Compare-and-Swap (CAS)',
    hint: 'This primitive forms the foundation of lock-free data structures.',
    explanation:
      'Compare-and-Swap (CAS) reads, compares, and conditionally writes a memory word in one indivisible hardware step.',
  },
  {
    id: 'mcq-9',
    difficulty: 'medium',
    question:
      'In a Readers-Preference Readers-Writers solution, what risk arises under heavy read traffic?',
    options: [
      'Writer starvation',
      'Reader deadlock',
      'Page table corruption',
      'Stack overflow in the scheduler',
    ],
    correctAnswer: 'Writer starvation',
    hint: 'What happens to a waiting writer if new readers keep arriving continuously?',
    explanation:
      'If new readers continually overlap with active readers, the reader count never drops to zero and waiting writers can be starved indefinitely.',
  },
  {
    id: 'mcq-10',
    difficulty: 'hard',
    question:
      'Why is spinlocking (busy waiting) generally counterproductive on a single-core CPU without preemption?',
    options: [
      'The spinning thread consumes CPU cycles while preventing the lock holder from running to release the lock',
      'Spinlocks automatically flush the L1 instruction cache on every iteration',
      'Spinlocks require at least 64-bit virtual addressing',
      'Single-core CPUs cannot execute atomic test-and-set instructions',
    ],
    correctAnswer:
      'The spinning thread consumes CPU cycles while preventing the lock holder from running to release the lock',
    hint: 'Only one thread can run at a time on a single core.',
    explanation:
      'On a single-core processor, busy waiting wastes the CPU quantum when the lock-holding thread actually needs CPU time to finish its critical section and release the lock.',
  },
]

export const MOCK_CONCEPT_QUESTIONS = [
  {
    id: 'concept-1',
    topic: 'Process Synchronization & Semaphores',
    difficulty: 'Medium',
    prompt:
      'Explain the difference between a mutex and a binary semaphore, and describe a scenario where a semaphore is preferred over a mutex.',
    expectedConcepts: [
      'Ownership semantics',
      'Signaling vs mutual exclusion',
      'Cross-thread notification',
      'Deadlock / priority inversion implications',
    ],
    simulatedFeedback: {
      scoreOutOf10: 8,
      overallFeedback:
        'Clear explanation of mutual exclusion and thread ownership. You accurately contrasted lock ownership with signaling.',
      conceptsUnderstood: [
        'Mutex ownership semantics (locking thread must unlock)',
        'Binary semaphore as a signaling mechanism',
      ],
      missingConcepts: [
        'Mentioning that mutexes often support priority inheritance whereas semaphores typically do not',
      ],
      incorrectAssumptions: [
        'Ensure you do not treat binary semaphores as interchangeable with mutexes for protecting critical sections in multi-threaded apps.',
      ],
      suggestedImprovedAnswer:
        'A mutex enforces strict ownership: only the thread that acquires the lock may release it, making it ideal for protecting critical sections and enabling features like priority inheritance. A binary semaphore has no ownership—any thread can call signal()—which makes it well-suited for producer-consumer or event-signaling workflows where one thread notifies another.',
    },
  },
  {
    id: 'concept-2',
    topic: 'Deadlocks & Resource Allocation',
    difficulty: 'Hard',
    prompt:
      'How do the four Coffman conditions lead to a deadlock, and which condition is typically easiest to break in practice?',
    expectedConcepts: [
      'Mutual exclusion',
      'Hold and wait',
      'No preemption',
      'Circular wait ordering',
    ],
    simulatedFeedback: {
      scoreOutOf10: 7,
      overallFeedback:
        'Good breakdown of the four conditions. Adding a concrete lock-ordering example will sharpen your answer.',
      conceptsUnderstood: [
        'All four Coffman conditions must hold simultaneously',
        'Breaking Circular Wait via global lock ordering',
      ],
      missingConcepts: [
        'Explaining why breaking Mutual Exclusion is often impractical for non-shareable resources like printers or write locks',
      ],
      incorrectAssumptions: [],
      suggestedImprovedAnswer:
        'Deadlock occurs only when Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait all hold simultaneously. In practice, Circular Wait is the easiest to prevent by imposing a strict global ordering on resource acquisition (e.g., always acquiring Lock A before Lock B).',
    },
  },
]

export const MOCK_FLASHCARDS = [
  {
    id: 'fc-1',
    conceptTag: 'Synchronization',
    front: "What does Peterson's Algorithm guarantee for two processes?",
    back: 'Mutual exclusion, progress, and bounded waiting for two processes entering a critical section using two shared variables (`flag[]` and `turn`).',
  },
  {
    id: 'fc-2',
    conceptTag: 'Deadlocks',
    front: 'Name all four Coffman conditions required for deadlock.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
  },
  {
    id: 'fc-3',
    conceptTag: 'Semaphores',
    front: 'What are the two atomic operations on a semaphore?',
    back: '`wait()` / `P()` (decrements and blocks if <= 0) and `signal()` / `V()` (increments and wakes a waiting process).',
  },
  {
    id: 'fc-4',
    conceptTag: 'Real-Time OS',
    front: 'What is Priority Inversion and how is it mitigated?',
    back: 'A high-priority task waits on a lock held by a low-priority task that is preempted by a medium-priority task. Mitigated via Priority Inheritance Protocol.',
  },
  {
    id: 'fc-5',
    conceptTag: 'Monitors',
    front: 'Why do Mesa-style monitors use `while` instead of `if` around `wait()`?',
    back: 'Because `signal()` does not immediately transfer the lock; another thread could invalidate the condition before the woken thread resumes.',
  },
]

export const MOCK_ADAPTIVE_SCHEDULE = [
  {
    id: 'sched-1',
    bucket: 'overdue',
    topic: 'Process Synchronization & Semaphores',
    subject: 'Operating Systems',
    dueDateLabel: 'Yesterday',
    reason: 'Missed 2 questions on counting semaphores',
    previousScore: 60,
    difficulty: 'Medium',
  },
  {
    id: 'sched-2',
    bucket: 'due-today',
    topic: 'Deadlocks & Coffman Conditions',
    subject: 'Operating Systems',
    dueDateLabel: 'Today',
    reason: 'Spaced recall interval reached (4d)',
    previousScore: 72,
    difficulty: 'Hard',
  },
  {
    id: 'sched-3',
    bucket: 'due-today',
    topic: 'B+ Tree Indexing & Splits',
    subject: 'Database Management Systems',
    dueDateLabel: 'Today',
    reason: 'Low confidence rating on last Concept Check',
    previousScore: 65,
    difficulty: 'Medium',
  },
  {
    id: 'sched-4',
    bucket: 'tomorrow',
    topic: 'TCP Congestion Control',
    subject: 'Computer Networks',
    dueDateLabel: 'Tomorrow',
    reason: 'Scheduled adaptive reinforcement',
    previousScore: 84,
    difficulty: 'Medium',
  },
  {
    id: 'sched-5',
    bucket: 'upcoming',
    topic: 'Dynamic Programming on Trees',
    subject: 'Algorithms',
    dueDateLabel: 'In 3 days',
    reason: 'Maintain 90%+ mastery threshold',
    previousScore: 88,
    difficulty: 'Hard',
  },
]

export const MOCK_MASTERY_TOPICS = [
  {
    id: 'mast-1',
    topic: 'Process Synchronization & Semaphores',
    subject: 'Operating Systems',
    masteryPct: 58,
    level: 'weak',
    weakConcepts: ['Counting semaphores', 'Priority inversion'],
  },
  {
    id: 'mast-2',
    topic: 'B+ Tree Indexing & Splits',
    subject: 'Database Management Systems',
    masteryPct: 74,
    level: 'medium',
    weakConcepts: ['Leaf node redistribution'],
  },
  {
    id: 'mast-3',
    topic: 'Deadlocks & Coffman Conditions',
    subject: 'Operating Systems',
    masteryPct: 68,
    level: 'medium',
    weakConcepts: ['Banker’s safety check'],
  },
  {
    id: 'mast-4',
    topic: 'TCP Congestion Control',
    subject: 'Computer Networks',
    masteryPct: 89,
    level: 'strong',
    weakConcepts: [],
  },
  {
    id: 'mast-5',
    topic: 'Normalization (1NF–BCNF)',
    subject: 'Database Management Systems',
    masteryPct: 92,
    level: 'strong',
    weakConcepts: [],
  },
]

export const MOCK_MISTAKE_JOURNAL = [
  {
    id: 'mist-1',
    question:
      'Which of the following is NOT one of the Coffman conditions required for a deadlock?',
    topic: 'Deadlocks & Coffman Conditions',
    subject: 'Operating Systems',
    mistakeCategory: 'Conceptual confusion',
    previousAnswer: 'Circular Wait',
    correctConcept: 'Preemption (deadlock requires No Preemption)',
    suggestedRevision:
      'Review the 4 necessary conditions and verify why forcible preemption prevents deadlock.',
    difficulty: 'Easy',
  },
  {
    id: 'mist-2',
    question:
      'In the bounded-buffer Producer-Consumer problem, why must the mutex lock be acquired AFTER wait(empty)?',
    topic: 'Process Synchronization & Semaphores',
    subject: 'Operating Systems',
    mistakeCategory: 'Ordering / Deadlock edge case',
    previousAnswer: 'To allow multiple producers to write simultaneously',
    correctConcept:
      'To avoid deadlock when the buffer is full while holding the mutex',
    suggestedRevision:
      'Trace the Producer-Consumer execution with buffer capacity = 1 when mutex is acquired first.',
    difficulty: 'Medium',
  },
  {
    id: 'mist-3',
    question:
      'Why do Mesa-style monitors require a while loop rather than an if statement around wait()?',
    topic: 'Monitors & Condition Variables',
    subject: 'Operating Systems',
    mistakeCategory: 'Concurrency semantics',
    previousAnswer: 'Because while loops execute faster in JIT compilers',
    correctConcept:
      'Another thread may alter the shared predicate before the woken thread re-acquires the lock',
    suggestedRevision:
      'Compare Hoare vs Mesa monitor signaling semantics.',
    difficulty: 'Hard',
  },
]

export const MOCK_REVISION_ANALYTICS = {
  quizScoreTrend: [
    { label: 'Wk 1', score: 62 },
    { label: 'Wk 2', score: 68 },
    { label: 'Wk 3', score: 74 },
    { label: 'Wk 4', score: 79 },
    { label: 'Wk 5', score: 84 },
  ],
  masteryProgress: 76,
  improvingTopics: [
    { name: 'TCP Congestion Control', delta: '+14%' },
    { name: 'Normalization (1NF–BCNF)', delta: '+11%' },
  ],
  decliningTopics: [
    { name: 'Process Synchronization & Semaphores', delta: '-6%' },
  ],
  upcomingWorkload: [
    { day: 'Today', count: 3 },
    { day: 'Tomorrow', count: 2 },
    { day: 'Wed', count: 4 },
    { day: 'Thu', count: 1 },
    { day: 'Fri', count: 3 },
  ],
}

export function getMockMcqSet({
  difficulty = 'medium',
  count = 5,
} = {}) {
  let filtered = MOCK_MCQ_QUESTIONS
  if (difficulty && difficulty !== 'adaptive') {
    const byDiff = MOCK_MCQ_QUESTIONS.filter((q) => q.difficulty === difficulty)
    const rest = MOCK_MCQ_QUESTIONS.filter((q) => q.difficulty !== difficulty)
    filtered = [...byDiff, ...rest]
  }
  return filtered.slice(0, Math.min(Math.max(1, count), filtered.length))
}
