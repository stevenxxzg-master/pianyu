export const getThreadDepth = (
  rootId: string | undefined,
  statusId: string,
  inReplyTos: Record<string, string | undefined>,
) => {
  if (!rootId) {
    return 0;
  }

  let depth = 0;
  let currentId: string | undefined = statusId;
  const seen = new Set<string>();

  while (currentId && currentId !== rootId && !seen.has(currentId)) {
    seen.add(currentId);
    currentId = inReplyTos[currentId];
    depth += 1;
  }

  if (currentId !== rootId) {
    return 1;
  }

  return Math.max(depth, 1);
};
