export enum ToolMode {
  DOWNLOADER = 'DOWNLOADER',
  AI_CAPTION = 'AI_CAPTION',
}

export interface MediaResult {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  username: string;
  timestamp: string;
}

export interface CaptionResult {
  captions: string[];
  hashtags: string[];
  strategy: string;
}

export interface NavItem {
  label: string;
  mode: ToolMode;
}
