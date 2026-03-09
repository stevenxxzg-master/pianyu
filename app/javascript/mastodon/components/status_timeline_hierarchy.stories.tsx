import { fromJS, List, Map as ImmutableMap } from 'immutable';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ApiQuoteJSON } from '@/mastodon/api_types/quotes';
import { accountFactoryState, statusFactoryState } from '@/testing/factories';

import { StatusQuoteManager } from './status_quoted';

const makeSvgDataUrl = ({
  accent,
  background,
  label,
}: {
  accent: string;
  background: string;
  label: string;
}) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${background}" />
        <stop offset="100%" stop-color="${accent}" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)" />
    <circle cx="920" cy="240" r="180" fill="rgba(255,255,255,0.18)" />
    <circle cx="250" cy="620" r="220" fill="rgba(255,255,255,0.10)" />
    <text x="96" y="132" fill="rgba(255,255,255,0.82)" font-size="42" font-family="Georgia, serif">PianYu feed preview</text>
    <text x="96" y="708" fill="white" font-size="74" font-family="Georgia, serif">${label}</text>
  </svg>`)} `;

const blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

const makeAttachment = ({
  id,
  label,
  background,
  accent,
}: {
  id: string;
  label: string;
  background: string;
  accent: string;
}) => {
  const preview = makeSvgDataUrl({ accent, background, label });

  return fromJS({
    id,
    type: 'image',
    url: preview,
    preview_url: preview,
    blurhash,
    description: `${label} mock attachment`,
    meta: {
      focus: { x: 0, y: 0 },
      small: {
        aspect: 3 / 2,
        width: 1200,
        height: 800,
      },
      original: {
        width: 1200,
        height: 800,
      },
    },
  });
};

const makeCard = ({
  accent,
  background,
  description,
  id,
  title,
}: {
  accent: string;
  background: string;
  description: string;
  id: string;
  title: string;
}) =>
  fromJS({
    type: 'link',
    url: `https://example.com/read/${id}`,
    title,
    description,
    provider_name: 'PianYu Weekly',
    author_name: '',
    language: 'zh-CN',
    image_description: `${title} preview`,
    image: makeSvgDataUrl({ accent, background, label: title }),
    blurhash,
    width: 1600,
    height: 900,
    published_at: '2026-03-09T00:00:00.000Z',
    authors: [],
  });

const statuses = {
  'feed-image': statusFactoryState({
    id: 'feed-image',
    text: '这一条带图内容先给出一句可读的摘要，再补两张图片做气氛说明。\n\n理想状态是扫时间线时，先读字，再决定要不要看图。',
  })
    .set('account', '1')
    .set(
      'contentHtml',
      '<p>这一条带图内容先给出一句可读的摘要，再补两张图片做气氛说明。</p><p>理想状态是扫时间线时，先读字，再决定要不要看图。</p>',
    )
    .set(
      'media_attachments',
      List([
        makeAttachment({
          id: 'feed-image-1',
          label: 'Morning tide',
          background: '#5a3cf0',
          accent: '#ff9bd2',
        }),
        makeAttachment({
          id: 'feed-image-2',
          label: 'Evening pier',
          background: '#1941b8',
          accent: '#87d8ff',
        }),
      ]),
    ),
  'feed-link': statusFactoryState({
    id: 'feed-link',
    text: '正文在前，链接卡片只负责补充“这篇文章大概讲什么”，而不是直接抢走整个版面。',
  })
    .set('account', '2')
    .set(
      'contentHtml',
      '<p>正文在前，链接卡片只负责补充“这篇文章大概讲什么”，而不是直接抢走整个版面。</p>',
    )
    .set(
      'card',
      makeCard({
        id: 'feed-link-card',
        title: '把附件降到第二阅读层',
        description:
          '通过紧凑缩略图、克制字号与更短的纵向占位，让链接预览退到辅助角色。',
        background: '#12203a',
        accent: '#ef9c65',
      }),
    ),
  'feed-quote': statusFactoryState({
    id: 'feed-quote',
    text: '引用也应该像旁注，而不是再造一个主视觉区块。',
    quote: ImmutableMap({
      state: 'accepted',
      quoted_status: 'quoted-source',
    }) as unknown as ApiQuoteJSON,
  })
    .set('account', '1')
    .set('contentHtml', '<p>引用也应该像旁注，而不是再造一个主视觉区块。</p>'),
  'quoted-source': statusFactoryState({
    id: 'quoted-source',
    text: '被引用的内容保留必要信息，但应该明显退后一步，避免与主贴争夺层级。',
  })
    .set('account', '3')
    .set(
      'contentHtml',
      '<p>被引用的内容保留必要信息，但应该明显退后一步，避免与主贴争夺层级。</p>',
    )
    .set(
      'card',
      makeCard({
        id: 'quoted-card',
        title: '引用卡片保留信息，不抢注意力',
        description: '引用中的外链预览继续存在，但默认更紧凑、更像补充上下文。',
        background: '#103b36',
        accent: '#8de1bb',
      }),
    ),
};

const meta = {
  title: 'Components/Status/TimelineHierarchy',
  render() {
    return (
      <div
        style={{
          display: 'grid',
          gap: '18px',
          maxWidth: '680px',
          padding: '20px',
        }}
      >
        <StatusQuoteManager id='feed-image' />
        <StatusQuoteManager id='feed-link' />
        <StatusQuoteManager id='feed-quote' />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    state: {
      accounts: {
        '1': accountFactoryState({ id: '1', acct: 'lin', display_name: 'Lin' }),
        '2': accountFactoryState({ id: '2', acct: 'mo', display_name: 'Mo' }),
        '3': accountFactoryState({
          id: '3',
          acct: 'qiao',
          display_name: 'Qiao',
        }),
      },
      statuses,
    },
  },
} satisfies Meta<typeof StatusQuoteManager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MixedContentFeed: Story = {};
