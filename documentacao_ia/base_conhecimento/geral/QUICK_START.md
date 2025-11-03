# 🚀 Guia Rápido - 5 Minutos

## Passo 1: Instalar dependências (1 min)

```bash
npm install
```

## Passo 2: Criar tabela no Supabase (2 min)

1. Acesse: https://supabase.com/dashboard/project/ijvwtprjdrqwfxwliymk
2. Clique em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Cole este código:

```sql
CREATE TABLE IF NOT EXISTS public.read_place (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    place VARCHAR NOT NULL
);

CREATE INDEX idx_read_place_created_at 
ON public.read_place(created_at DESC);

ALTER TABLE public.read_place ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública" 
ON public.read_place FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" 
ON public.read_place FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir deleção pública" 
ON public.read_place FOR DELETE USING (true);
```

5. Clique em **Run** (ou Ctrl+Enter)
6. Deve aparecer: "Success. No rows returned"

## Passo 3: Rodar o app (2 min)

```bash
npx expo prebuild --clean
npx expo run:android
```

## ✅ Pronto!

Agora você pode:
1. Abrir o modal
2. Iniciar leitura em tempo real
3. Ver histórico de leituras
4. Deletar leituras

## 🔍 Verificar se funcionou

### No app:
1. Leia algum texto
2. Vá em "Histórico"
3. Deve aparecer a leitura

### No Supabase:
1. Vá em **Table Editor**
2. Selecione tabela: `read_place`
3. Deve ver os dados

## 🐛 Problemas?

### "relation does not exist"
→ Execute o SQL novamente no Supabase

### "new row violates row-level security"
→ Execute as políticas (CREATE POLICY) novamente

### Câmera não abre
→ Execute: `npx expo prebuild --clean`

## 📚 Mais informações

- **README.md** - Documentação completa
- **SUPABASE_SETUP.md** - Detalhes do Supabase
- **OCR_SETUP.md** - Detalhes do OCR
