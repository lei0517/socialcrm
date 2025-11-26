export enum Platform {
  XIAOHONGSHU = 'xiaohongshu',
  XIANYU = 'xianyu',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional when retrieving lists
  role: UserRole;
  canViewAll: boolean; // Permission for ADMIN to view all data
  createdAt: number;
}

export interface ImageAsset {
  id: string;
  url: string; // Base64 or Blob URL
  createdAt: number;
  isAiGenerated: boolean;
}

export interface Copywriting {
  id: string;
  content: string;
  createdAt: number;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface Customer {
  id: string;
  creatorId: string; // ID of the user who created this customer
  name: string;
  contactInfo: string;
  platform: Platform;
  dealDate?: number; // Timestamp
  expiryDate?: number; // Timestamp
  lastTrackedDate: number; // Timestamp
  images: ImageAsset[];
  copywritings: Copywriting[];
  notes: string;
}

export interface ManualSection {
  id: string;
  title: string;
  content: string; // Markdown/HTML
  type: 'tip' | 'guide';
}

export enum AiTextModel {
  DEEPSEEK = 'DeepSeek',
  GEMINI = 'Gemini',
  DOUBAO = '豆包',
  WENXIN = '文心一言',
  QWEN = '通义千问',
  CHATGPT = 'ChatGPT',
}

export enum AiImageModel {
  DOUBAO = '豆包',
  JIMENG = '即梦',
}