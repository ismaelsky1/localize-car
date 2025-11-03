# Configuração do Supabase

## ✅ O que foi implementado

### Migração de MongoDB para Supabase

1. **Removido:**
   - Backend Node.js/Express
   - MongoDB
   - AsyncStorage fallback

2. **Adicionado:**
   - Supabase como banco de dados
   - Integração direta do app com Supabase
   - Queries otimizadas

### Estrutura do Banco de Dados

**Schema:** `public` (padrão do Supabase)  
**Tabela:** `read_place`

**Campos:**
- `id` - UUID (gerado automaticamente)
- `created_at` - TIMESTAMP (gerado automaticamente)
- `place` - VARCHAR (texto lido pelo OCR)

## 🚀 Configuração Inicial

### 1. Criar a tabela no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Login no projeto: `ijvwtprjdrqwfxwliymk`
3. Vá em **SQL Editor**
4. Cole o conteúdo do arquivo `supabase-setup.sql`
5. Clique em **Run**

Ou execute manualmente:

```sql
-- Criar tabela no schema public
CREATE TABLE IF NOT EXISTS public.read_place (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    place VARCHAR NOT NULL
);

-- Criar índice
CREATE INDEX idx_read_place_created_at 
ON public.read_place(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.read_place ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Permitir leitura pública" 
ON public.read_place FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" 
ON public.read_place FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir deleção pública" 
ON public.read_place FOR DELETE USING (true);
```

### 2. Verificar configuração

As credenciais já estão configuradas em `constants/config.ts`:

```typescript
export const SUPABASE_CONFIG = {
  URL: 'https://ijvwtprjdrqwfxwliymk.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  TABLE: 'read_place',
};
```

### 3. Rebuild do app

```bash
npx expo prebuild --clean
npx expo run:android
```

## 📱 Como funciona

### Salvar leitura:
1. Usuário lê texto com a câmera
2. Texto é salvo automaticamente no Supabase
3. Aparece no histórico instantaneamente

### Ver histórico:
1. Toque em "Histórico"
2. Lista todas as leituras do Supabase
3. Ordenadas por data (mais recente primeiro)

### Deletar leitura:
1. Toque no ícone 🗑️
2. Confirme a exclusão
3. Removido do Supabase

## 🔧 Estrutura de Arquivos

```
localize-car/
├── lib/
│   └── supabase.ts           # Cliente Supabase
├── services/
│   └── ocrService.ts         # Serviço de OCR com Supabase
├── constants/
│   └── config.ts             # Credenciais Supabase
├── app/
│   ├── modal.tsx             # Leitor OCR
│   └── history.tsx           # Histórico
└── supabase-setup.sql        # Script de criação da tabela
```

## 📊 Monitoramento

### Ver dados no Supabase Dashboard:

1. Acesse [supabase.com](https://supabase.com)
2. Selecione o projeto
3. Vá em **Table Editor**
4. Selecione tabela: `read_place`

### Queries úteis:

```sql
-- Ver todas as leituras
SELECT * FROM public.read_place 
ORDER BY created_at DESC;

-- Contar leituras
SELECT COUNT(*) FROM public.read_place;

-- Leituras de hoje
SELECT * FROM public.read_place 
WHERE created_at::date = CURRENT_DATE;

-- Deletar todas as leituras (cuidado!)
DELETE FROM public.read_place;
```

## 🎯 Vantagens do Supabase

✅ **Sem backend necessário** - Conexão direta do app  
✅ **Tempo real** - Dados sincronizados instantaneamente  
✅ **Escalável** - Suporta milhões de registros  
✅ **Grátis** - Até 500MB de banco de dados  
✅ **Dashboard** - Interface visual para gerenciar dados  
✅ **Backup automático** - Dados seguros  

## 🔒 Segurança

### Row Level Security (RLS)

As políticas configuradas permitem:
- ✅ Qualquer pessoa pode ler (SELECT)
- ✅ Qualquer pessoa pode inserir (INSERT)
- ✅ Qualquer pessoa pode deletar (DELETE)

### Para produção (recomendado):

Se quiser restringir acesso, modifique as políticas:

```sql
-- Exemplo: Apenas leitura pública, inserção/deleção autenticada
DROP POLICY "Permitir inserção pública" ON public.read_place;
DROP POLICY "Permitir deleção pública" ON public.read_place;

CREATE POLICY "Permitir inserção autenticada" 
ON public.read_place 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir deleção autenticada" 
ON public.read_place 
FOR DELETE 
USING (auth.role() = 'authenticated');
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"

**Problema:** Tabela não foi criada

**Solução:**
1. Execute o script `supabase-setup.sql` no SQL Editor
2. Confirme o nome da tabela: `read_place`
3. Verifique se está no schema `public`

### Erro: "new row violates row-level security policy"

**Problema:** RLS está bloqueando inserções

**Solução:**
1. Verifique se as políticas foram criadas
2. Execute novamente as políticas do script
3. Ou desabilite RLS temporariamente:
   ```sql
   ALTER TABLE public.read_place DISABLE ROW LEVEL SECURITY;
   ```

### Erro: "Failed to fetch"

**Problema:** Credenciais incorretas ou rede

**Solução:**
1. Verifique URL e ANON_KEY em `config.ts`
2. Confirme que o dispositivo tem internet
3. Teste no navegador: `https://ijvwtprjdrqwfxwliymk.supabase.co`

### Histórico vazio

**Problema:** Nenhuma leitura foi salva

**Solução:**
1. Faça uma leitura no modal
2. Verifique os logs: `npx expo start` (pressione 'j')
3. Procure por "✅ Leitura salva no Supabase"
4. Verifique no Supabase Dashboard se o dado foi inserido

## 📈 Limites do Plano Gratuito

- 500 MB de banco de dados
- 2 GB de transferência/mês
- 50 MB de armazenamento de arquivos
- Pausado após 1 semana de inatividade

Para produção, considere upgrade para Pro ($25/mês).

## 🔄 Migração de Dados

Se você tinha dados no MongoDB ou AsyncStorage:

### Exportar do MongoDB:
```bash
mongoexport --uri="mongodb+srv://..." --collection=readings --out=readings.json
```

### Importar para Supabase:
1. Converta o JSON para CSV
2. Use o Supabase Dashboard → Table Editor → Import CSV
3. Mapeie os campos: `text` → `place`, `timestamp` → `created_at`

## 📝 Exemplo de Uso

```typescript
import ocrService from '@/services/ocrService';

// Salvar leitura
const reading = await ocrService.saveReading('ABC1234');

// Buscar todas
const readings = await ocrService.getReadings();

// Deletar
await ocrService.deleteReading('uuid-aqui');
```

## 🎉 Pronto!

O app agora está totalmente integrado com Supabase. Sem necessidade de backend próprio!
