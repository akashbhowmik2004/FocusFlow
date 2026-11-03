const toMilliseconds = (value) => {
  const milliseconds = new Date(value).getTime();
  return Number.isFinite(milliseconds) ? milliseconds : null;
};

export function getFocusDisplaySeconds(
  session,
  { now = Date.now(), serverTime, serverTimeReceivedAt = now } = {},
) {
  if (!session) return 0;

  const accumulated = Math.max(0, Number(session.activeDurationSeconds) || 0);
  if (session.status !== "in-progress" || !session.activeStartedAt) {
    return accumulated;
  }

  const activeStartedAt = toMilliseconds(session.activeStartedAt);
  if (activeStartedAt === null) return accumulated;

  const serverTimestamp = toMilliseconds(serverTime);
  const referenceTimestamp =
    serverTimestamp === null
      ? now
      : serverTimestamp + (now - serverTimeReceivedAt);
  const elapsed = Math.floor((referenceTimestamp - activeStartedAt) / 1000);

  return accumulated + Math.max(0, elapsed);
}
