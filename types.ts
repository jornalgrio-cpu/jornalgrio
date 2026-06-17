
export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content?: string;
  author_name: string;
  author_role?: string;
  section: ArticleSection;
  image_url: string;
  images?: string[]; // Array para fotos adicionais (galeria)
  created_at: string;
  is_published?: boolean;
}

export type ArticleSection = 
  | 'Editorial' 
  | 'Aconteceu na Escola' 
  | 'Entrevistas' 
  | 'Opinião' 
  | 'Estudos' 
  | 'Curiosidades'
  | 'Carreira'
  | 'Destaques';

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface AgendaItem {
  id: string;
  event_title: string;
  event_date: string;
  description: string;
}

export interface Recadinho {
  id: string;
  sender: string;
  message: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  tier: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
}
