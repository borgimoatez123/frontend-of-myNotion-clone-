export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Page {
  _id: string;
  ownerId: User;
  title: string;
  parentId: string | null;
  iconUrl?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  _id: string;
  pageId: {
    _id: string;
    title: string;
  };
  type: 'paragraph' | 'heading' | 'todo' | 'image' | 'pdf' | 'video' | 'code' | 'table';
  order: number;
  content: BlockContent;
  createdAt: string;
  updatedAt: string;
}

export interface BlockContent {
  text?: string;
  headingLevel?: 1 | 2 | 3;
  checked?: boolean;
  url?: string;
  videoUrl?: string;
  autoplay?: boolean;
  code?: string;
  language?: string;
  table?: string[][];
}

export interface CreatePageRequest {
  title: string;
  parentId?: string | null;
  iconUrl?: string;
  coverUrl?: string;
}

export interface CreateBlockRequest {
  pageId: string;
  type: Block['type'];
  order: number;
  content: BlockContent;
}