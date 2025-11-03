-- Criar tabela de registros de carros
CREATE TABLE IF NOT EXISTS public.car_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  plate VARCHAR(7) NOT NULL UNIQUE,
  brand VARCHAR(50),
  model VARCHAR(100),
  year INTEGER,
  color VARCHAR(30),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  comments TEXT
);

-- Criar índice para busca por placa
CREATE INDEX IF NOT EXISTS idx_car_registry_plate ON public.car_registry(plate);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.car_registry ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (leitura) para todos
CREATE POLICY "Permitir leitura para todos" ON public.car_registry
  FOR SELECT USING (true);

-- Política para permitir INSERT (criação) para todos
CREATE POLICY "Permitir criação para todos" ON public.car_registry
  FOR INSERT WITH CHECK (true);

-- Política para permitir UPDATE (atualização) para todos
CREATE POLICY "Permitir atualização para todos" ON public.car_registry
  FOR UPDATE USING (true);

-- Política para permitir DELETE (exclusão) para todos
CREATE POLICY "Permitir exclusão para todos" ON public.car_registry
  FOR DELETE USING (true);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_car_registry_updated_at
  BEFORE UPDATE ON public.car_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
