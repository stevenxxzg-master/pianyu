import { describe, expect, it } from 'vitest';

import { getThreadDepth } from './thread_depth';

describe('getThreadDepth', () => {
  it('returns direct-reply depth for statuses directly under the root', () => {
    expect(getThreadDepth('root', 'reply', { reply: 'root' })).toBe(1);
  });

  it('walks nested reply chains back to the root', () => {
    expect(
      getThreadDepth('root', 'leaf', {
        leaf: 'mid',
        mid: 'reply',
        reply: 'root',
      }),
    ).toBe(3);
  });

  it('falls back safely when the reply chain does not lead back to the root', () => {
    expect(
      getThreadDepth('root', 'orphan', {
        orphan: 'elsewhere',
      }),
    ).toBe(1);
  });

  it('guards against cycles in malformed reply maps', () => {
    expect(
      getThreadDepth('root', 'loop-a', {
        'loop-a': 'loop-b',
        'loop-b': 'loop-a',
      }),
    ).toBe(1);
  });
});
