export interface Artwork {
  id: string;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  palette: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum SectionId {
  HERO = 'hero',
  GALLERY = 'gallery',
  STUDIO = 'studio',
  VISION = 'vision',
  LETTERS = 'letters',
  AUDIO = 'audio',
  ABOUT = 'about',
  VISIT = 'visit',
}