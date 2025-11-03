# Localize Car - Leitor OCR com Supabase

Aplicativo React Native para leitura de texto em tempo real usando câmera e OCR, com histórico armazenado no Supabase.

## 📱 Funcionalidades

✅ **Leitura em tempo real** - Câmera ativa que detecta placas automaticamente  
✅ **Validação de placas** - Aceita apenas placas brasileiras válidas (Mercosul e Antiga)  
✅ **Histórico completo** - Todas as placas lidas com data e hora  
✅ **Supabase integrado** - Dados sincronizados na nuvem  
✅ **Interface intuitiva** - Design limpo e responsivo  
✅ **Deletar leituras** - Gerenciamento fácil do histórico  

## 🚀 Início Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

Execute o script SQL no Supabase Dashboard (SQL Editor):

```bash
# O script está em: supabase-setup.sql
```

Ou veja instruções detalhadas em: **SUPABASE_SETUP.md**

### 3. Rodar o app

```bash
# Android
npx expo prebuild --clean
npx expo run:android

# iOS
npx expo run:ios
```

## 📖 Documentação

- **QUICK_START.md** - Guia rápido de 5 minutos
- **SUPABASE_SETUP.md** - Configuração completa do Supabase
- **PLATE_VALIDATION.md** - Detalhes sobre validação de placas
- **OCR_SETUP.md** - Configuração do OCR e câmera
- **supabase-setup.sql** - Script SQL para criar tabela

## 🗄️ Estrutura do Banco

**Schema:** `public`  
**Tabela:** `read_place`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único (auto) |
| created_at | TIMESTAMP | Data/hora (auto) |
| place | VARCHAR | Texto lido |

## 🎯 Como Usar

### Ler Placa:
1. Abra o app
2. Toque no modal
3. "Iniciar Leitura em Tempo Real"
4. Aponte para uma placa de veículo brasileira
5. Placa válida aparece automaticamente e é salva

**Formatos aceitos:**
- 🇧🇷 Mercosul: ABC1D23
- 🇧🇷 Antiga: ABC1234

### Ver Histórico:
1. Toque em "Histórico"
2. Veja todas as placas lidas
3. Delete leituras com 🗑️
4. Pull-to-refresh para atualizar

## 🔧 Tecnologias

- **React Native** + Expo
- **TypeScript**
- **react-native-vision-camera** - Câmera em tempo real
- **react-native-mlkit-ocr** - Reconhecimento de texto
- **Supabase** - Banco de dados PostgreSQL

## 📦 Estrutura do Projeto

```
localize-car/
├── app/
│   ├── modal.tsx          # Leitor OCR
│   ├── history.tsx        # Histórico de leituras
│   └── _layout.tsx        # Navegação
├── lib/
│   └── supabase.ts        # Cliente Supabase
├── services/
│   └── ocrService.ts      # Serviço de OCR
├── constants/
│   └── config.ts          # Configurações Supabase
└── supabase-setup.sql     # Script de criação da tabela
```

## ⚙️ Configuração

### Credenciais Supabase

Já configuradas em `constants/config.ts`:

```typescript
export const SUPABASE_CONFIG = {
  URL: 'https://ijvwtprjdrqwfxwliymk.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  TABLE: 'read_place',
};
```

### Permissões

Configuradas em `app.json`:
- Câmera (iOS e Android)
- Armazenamento (Android)

## 🐛 Troubleshooting

### Tabela não existe

Execute o script `supabase-setup.sql` no SQL Editor do Supabase.

### Erro de permissão RLS

Verifique se as políticas foram criadas corretamente no Supabase.

### Câmera não funciona

```bash
npx expo prebuild --clean
npx expo run:android
```

## 📊 Monitoramento

Acesse o Supabase Dashboard para:
- Ver todas as leituras
- Executar queries SQL
- Monitorar uso do banco
- Fazer backup dos dados

## 🎉 Pronto para usar!

O app está totalmente funcional e integrado com Supabase. Sem necessidade de backend próprio!

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido para leitura de placas e textos em tempo real.
