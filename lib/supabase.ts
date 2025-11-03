import { SUPABASE_CONFIG } from '@/constants/config';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Tipos para a tabela read_place
export interface ReadPlace {
  id: string;
  created_at: string;
  place: string;
}

// Tipos para a tabela car_registry
export interface CarRegistry {
  id: string;
  created_at: string;
  updated_at: string;
  plate: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  comments?: string;
}
