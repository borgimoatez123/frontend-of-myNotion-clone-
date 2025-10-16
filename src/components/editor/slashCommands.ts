import { Type, Hash, CheckSquare, Code, Image, Video, Table, FileText } from 'lucide-react';
import { SlashCommand } from './types';

export const slashCommands: SlashCommand[] = [
  { id: 'paragraph', label: 'Text', icon: <Type className="w-4 h-4" />, type: 'paragraph', description: 'Just start writing with plain text.' },
  { id: 'heading1', label: 'Heading 1', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Big section heading.' },
  { id: 'heading2', label: 'Heading 2', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Medium section heading.' },
  { id: 'heading3', label: 'Heading 3', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Small section heading.' },
  { id: 'todo', label: 'To-do list', icon: <CheckSquare className="w-4 h-4" />, type: 'todo', description: 'Track tasks with a to-do list.' },
  { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" />, type: 'code', description: 'Capture a code snippet.' },
  { id: 'image', label: 'Image', icon: <Image className="w-4 h-4" />, type: 'image', description: 'Upload or embed with a link.' },
  { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" />, type: 'video', description: 'Embed a video.' },
  { id: 'table', label: 'Table', icon: <Table className="w-4 h-4" />, type: 'table', description: 'Create a table.' },
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" />, type: 'pdf', description: 'Upload a PDF file.' },
];