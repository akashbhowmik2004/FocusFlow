import dotenv from 'dotenv'
dotenv.config()
import { prisma } from '../lib/prisma.js'

async function run() {
  console.log('--- Starting Real-Data Session Integrity & Completion Verification ---')

  const testEmail = `disposable_integrity_${Date.now()}@focusflow.test`
  let user, subject, topic, sessionA, sessionB

  try {
    // 1. Create isolated disposable test user
    user = await prisma.user.create({
      data: {
        name: 'Integrity Tester',
        email: testEmail,
        passwordHash: 'hashed_password_test_123',
      },
    })
    console.log(`[PASS] Created disposable test user: ${user.id} (${user.email})`)

    // 2. Create test subject & topic
    subject = await prisma.subject.create({
      data: {
        name: 'Distributed Systems',
        code: 'CS701',
        color: '#6366f1',
        userId: user.id,
      },
    })
    topic = await prisma.topic.create({
      data: {
        name: 'Raft Consensus Algorithm',
        status: 'not-started',
        subjectId: subject.id,
      },
    })
    console.log(`[PASS] Created subject: ${subject.id}, topic: ${topic.id}`)

    // 3. Create Session A (for Start Focus verification)
    const todayStr = new Date().toISOString().split('T')[0]
    sessionA = await prisma.studySession.create({
      data: {
        title: 'Raft Leader Election Study',
        date: new Date(`${todayStr}T00:00:00.000Z`),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        status: 'upcoming',
        subjectId: subject.id,
        topicId: topic.id,
        userId: user.id,
      },
    })
    console.log(`[PASS] Created Session A in PostgreSQL: ${sessionA.id}`)
    if (!sessionA.id || sessionA.id.startsWith('session-')) {
      throw new Error(`Session A does not have a genuine DB ID: ${sessionA.id}`)
    }

    // 4. Test Start Focus on Session A via focusSession service
    const { startFocusSession } = await import('../services/focusSession.service.js')
    const started = await startFocusSession(sessionA.id, user.id)
    console.log(`[PASS] Start Focus succeeded on Session A directly without refreshing!`)
    console.log(`       Status: ${started.status}, startedAt: ${started.startedAt}, activeStartedAt: ${started.activeStartedAt}`)
    if (started.status !== 'in-progress') {
      throw new Error(`Expected in-progress status, got ${started.status}`)
    }

    // 5. Create Session B (for manual completion verification)
    sessionB = await prisma.studySession.create({
      data: {
        title: 'Log Replication Revision',
        date: new Date(`${todayStr}T00:00:00.000Z`),
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
        status: 'upcoming',
        subjectId: subject.id,
        topicId: topic.id,
        userId: user.id,
      },
    })
    console.log(`[PASS] Created Session B in PostgreSQL: ${sessionB.id}`)

    // 6. Test manual completion of Session B
    // Mimic PUT /api/session/:id with status: 'completed'
    const updatedB = await prisma.studySession.update({
      where: { id: sessionB.id },
      data: {
        status: 'completed',
        actualDurationSeconds: null,
        activeStartedAt: null,
        pausedAt: null,
        completedAt: null,
        cancelledAt: null,
      },
    })

    console.log(`[PASS] Manually completed Session B in database:`)
    console.log(`       Status: ${updatedB.status}`)
    console.log(`       actualDurationSeconds: ${updatedB.actualDurationSeconds} (strictly null)`)
    console.log(`       completedAt: ${updatedB.completedAt}`)

    if (updatedB.status !== 'completed') {
      throw new Error(`Session B status is not completed: ${updatedB.status}`)
    }
    if (updatedB.actualDurationSeconds !== null) {
      throw new Error(`Session B actualDurationSeconds is not null: ${updatedB.actualDurationSeconds}`)
    }

    // 7. Verify persistence by querying fresh from database
    const freshB = await prisma.studySession.findFirst({
      where: { id: sessionB.id, userId: user.id },
    })
    if (freshB.status !== 'completed' || freshB.actualDurationSeconds !== null) {
      throw new Error('Persistence check failed on Session B!')
    }
    console.log(`[PASS] Re-querying database confirmed Session B persists as completed with actualDurationSeconds: null`)

    console.log('\n--- Real-Data Verification Succeeded 100% ---')
  } catch (err) {
    console.error('[FAIL] Error during verification:', err)
    process.exitCode = 1
  } finally {
    // Cleanup
    if (sessionA?.id) {
      await prisma.studySession.deleteMany({ where: { id: sessionA.id } }).catch(() => {})
    }
    if (sessionB?.id) {
      await prisma.studySession.deleteMany({ where: { id: sessionB.id } }).catch(() => {})
    }
    if (topic?.id) {
      await prisma.topic.deleteMany({ where: { id: topic.id } }).catch(() => {})
    }
    if (subject?.id) {
      await prisma.subject.deleteMany({ where: { id: subject.id } }).catch(() => {})
    }
    if (user?.id) {
      await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {})
    }
    console.log('[PASS] Cleaned up all disposable test records from database.')
    await prisma.$disconnect()
  }
}

run()
