import { describe, expect, test } from 'vitest';

import { getStatusContentMeta, shouldPromoteStatusContent } from './status_content';

describe('getStatusContentMeta', () => {
  test('extracts plain text and block count from rich text html', () => {
    expect(getStatusContentMeta('<p>短文本 <a href="https://example.com">link</a></p><p>第二段</p>')).toEqual({
      blockCount: 2,
      text: '短文本 link第二段',
      textLength: 11,
    });
  });
});

describe('shouldPromoteStatusContent', () => {
  test('promotes a short single-paragraph status', () => {
    expect(shouldPromoteStatusContent('<p>让短文本成为主角。</p>')).toBe(true);
  });

  test('does not promote long statuses', () => {
    expect(
      shouldPromoteStatusContent(`<p>${'长文'.repeat(90)}</p>`),
    ).toBe(false);
  });

  test('does not promote multi-block statuses', () => {
    expect(
      shouldPromoteStatusContent('<p>第一段</p><p>第二段</p><blockquote>第三块</blockquote>'),
    ).toBe(false);
  });

  test('does not promote quoted, collapsed, or spoilered statuses', () => {
    expect(
      shouldPromoteStatusContent('<p>短文本</p>', { isQuotedPost: true }),
    ).toBe(false);
    expect(
      shouldPromoteStatusContent('<p>短文本</p>', { collapsed: true }),
    ).toBe(false);
    expect(
      shouldPromoteStatusContent('<p>短文本</p>', { spoilerText: 'cw' }),
    ).toBe(false);
  });
});
