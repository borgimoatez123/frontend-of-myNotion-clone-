import { Block, BlockContent } from '@/types';

export const getDefaultContent = (type: Block['type'], headingLevel?: 1 | 2 | 3): BlockContent => {
  switch (type) {
    case 'paragraph':
      return { text: '' };
    case 'heading':
      return { text: '', headingLevel: headingLevel || 1 };
    case 'todo':
      return { text: '', checked: false };
    case 'code':
      return { code: '', language: 'javascript' };
    case 'image':
      return { url: '' };
    case 'video':
      return { videoUrl: '', autoplay: false };
    case 'table':
      return { table: [['Header 1', 'Header 2'], ['', '']] };
    case 'pdf':
      return { url: '' };
    default:
      return { text: '' };
  }
};

export const getDefaultContentForType = (type: Block['type']): BlockContent => {
  switch (type) {
    case 'todo':
      return { checked: false };
    case 'code':
      return { code: '', language: 'javascript' };
    case 'image':
    case 'pdf':
      return { url: '' };
    case 'video':
      return { videoUrl: '', autoplay: false };
    case 'table':
      return { table: [['Header 1', 'Header 2'], ['', '']] };
    default:
      return {};
  }
};