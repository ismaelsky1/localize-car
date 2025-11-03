-- Script SQL para criar a tabela no Supabase
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Criar a tabela read_place no schema public
CREATE TABLE IF NOT EXISTS public.read_place (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    place VARCHAR NOT NULL
);

-- 2. Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_read_place_created_at 
ON public.read_place(created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.read_place ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para permitir leitura pública
CREATE POLICY "Permitir leitura pública" 
ON public.read_place 
FOR SELECT 
USING (true);

-- 5. Criar política para permitir inserção pública
CREATE POLICY "Permitir inserção pública" 
ON public.read_place 
FOR INSERT 
WITH CHECK (true);

-- 6. Criar política para permitir deleção pública
CREATE POLICY "Permitir deleção pública" 
ON public.read_place 
FOR DELETE 
USING (true);

-- 7. Verificar se a tabela foi criada
SELECT * FROM public.read_place LIMIT 1;
