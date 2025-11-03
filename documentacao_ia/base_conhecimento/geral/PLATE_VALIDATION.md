# Validação de Placas Brasileiras

## 📋 Visão Geral

O app agora **valida automaticamente** se o texto lido é uma placa de veículo brasileira válida. Apenas placas válidas são salvas no banco de dados e exibidas no histórico.

## 🚗 Formatos Aceitos

### 1. Placa Mercosul (Atual)
**Formato:** ABC1D23  
**Padrão:** 3 letras + 1 número + 1 letra + 2 números

**Exemplos válidos:**
- ABC1D23 → ABC-1D23
- XYZ9A87 → XYZ-9A87
- BRA2E19 → BRA-2E19

### 2. Placa Antiga (Pré-Mercosul)
**Formato:** ABC1234  
**Padrão:** 3 letras + 4 números

**Exemplos válidos:**
- ABC1234 → ABC-1234
- XYZ9876 → XYZ-9876
- BRA2019 → BRA-2019

## ✅ Como Funciona

### 1. Leitura Automática
- Câmera captura texto a cada 1 segundo
- OCR processa a imagem
- Validador verifica se é uma placa válida

### 2. Validação
```typescript
// Texto detectado: "ABC1D23"
PlateValidator.validate("ABC1D23")
// Resultado: { isValid: true, format: 'mercosul', plate: 'ABC-1D23' }

// Texto detectado: "ABC1234"
PlateValidator.validate("ABC1234")
// Resultado: { isValid: true, format: 'antigo', plate: 'ABC-1234' }

// Texto detectado: "HELLO123"
PlateValidator.validate("HELLO123")
// Resultado: { isValid: false }
```

### 3. Salvamento
- ✅ **Placa válida** → Salva no Supabase + Exibe na tag
- ❌ **Texto inválido** → Não salva + Mostra "Aguardando placa válida..."

## 🎯 Recursos

### Limpeza Automática
O validador remove automaticamente:
- Espaços em branco
- Hífens
- Caracteres especiais
- Converte para maiúsculas

**Exemplos:**
```
"abc 1d23"  → "ABC1D23" ✅
"ABC-1234"  → "ABC1234" ✅
"abc 1234"  → "ABC1234" ✅
```

### Extração de Texto
Se o OCR capturar texto adicional, o validador tenta extrair a placa:

```typescript
PlateValidator.findPlateInText("Veículo ABC1D23 estacionado")
// Resultado: { isValid: true, format: 'mercosul', plate: 'ABC-1D23' }
```

### Formatação
Placas válidas são formatadas com hífen:
- ABC1D23 → **ABC-1D23**
- ABC1234 → **ABC-1234**

## 📱 Interface do Usuário

### Tag de Placa
Quando uma placa é detectada:
```
┌─────────────────────────────┐
│ Placa detectada: 🇧🇷 Mercosul│
│ ABC-1D23                    │
└─────────────────────────────┘
```

Quando aguardando:
```
┌─────────────────────────────┐
│ Placa detectada:            │
│ Aguardando placa...         │
└─────────────────────────────┘
```

### Badge de Formato
- 🇧🇷 **Mercosul** - Placa padrão Mercosul
- 🇧🇷 **Antiga** - Placa padrão antigo

## 🔧 Implementação Técnica

### Arquivo: `utils/plateValidator.ts`

```typescript
class PlateValidator {
  // Valida formato exato
  static validate(text: string): PlateValidationResult
  
  // Extrai placa de texto maior
  static extractPlate(text: string): PlateValidationResult
  
  // Tenta ambos os métodos
  static findPlateInText(text: string): PlateValidationResult
}
```

### Regex Patterns

**Mercosul:**
```regex
^[A-Z]{3}[0-9][A-Z][0-9]{2}$
```

**Antiga:**
```regex
^[A-Z]{3}[0-9]{4}$
```

## 📊 Exemplos de Uso

### Placas Válidas

| Entrada | Formato | Saída |
|---------|---------|-------|
| ABC1D23 | Mercosul | ABC-1D23 ✅ |
| abc1d23 | Mercosul | ABC-1D23 ✅ |
| ABC 1D23 | Mercosul | ABC-1D23 ✅ |
| ABC1234 | Antiga | ABC-1234 ✅ |
| abc1234 | Antiga | ABC-1234 ✅ |
| ABC 1234 | Antiga | ABC-1234 ✅ |

### Placas Inválidas

| Entrada | Motivo | Resultado |
|---------|--------|-----------|
| 123ABCD | Números primeiro | ❌ Inválida |
| ABCD123 | 4 letras | ❌ Inválida |
| AB1234 | Apenas 2 letras | ❌ Inválida |
| ABC12345 | 5 números | ❌ Inválida |
| ABC@1234 | Caractere especial | ❌ Inválida |
| HELLO123 | Formato incorreto | ❌ Inválida |

## 🧪 Testes

Execute os testes do validador:

```bash
npm test -- plateValidator.test.ts
```

Testes incluem:
- ✅ Validação de placas Mercosul
- ✅ Validação de placas antigas
- ✅ Rejeição de formatos inválidos
- ✅ Limpeza de texto
- ✅ Extração de placas
- ✅ Casos reais

## 🎨 Customização

### Adicionar Novos Formatos

Para adicionar suporte a outros formatos de placa:

```typescript
// Em plateValidator.ts
private static readonly NOVO_FORMATO = /^[A-Z]{2}[0-9]{5}$/;

// No método validate()
if (this.NOVO_FORMATO.test(cleanedText)) {
  return {
    isValid: true,
    format: 'novo',
    plate: this.formatPlate(cleanedText, 'novo'),
  };
}
```

### Desabilitar Validação

Para aceitar qualquer texto (não recomendado):

```typescript
// Em app/modal.tsx
// Comente a validação:
// const validation = PlateValidator.findPlateInText(text);
// if (validation.isValid && validation.plate) {

// E use diretamente:
setRecognizedText(text);
await ocrService.saveReading(text);
```

## 📝 Logs

O app registra logs úteis:

```
✅ Placa mercosul salva: ABC-1D23
✅ Placa antigo salva: ABC-1234
⚠️ Texto detectado não é uma placa: HELLO WORLD
```

## 🚀 Benefícios

1. **Precisão** - Apenas placas válidas são salvas
2. **Limpeza** - Banco de dados sem lixo
3. **UX** - Feedback visual imediato
4. **Performance** - Validação rápida (< 1ms)
5. **Manutenção** - Fácil adicionar novos formatos

## ⚠️ Limitações

1. **OCR não é 100% preciso** - Pode confundir letras/números similares (O/0, I/1)
2. **Iluminação** - Placas sujas ou mal iluminadas podem não ser lidas
3. **Ângulo** - Melhor resultado com câmera perpendicular à placa
4. **Distância** - Placa deve estar a uma distância adequada

## 💡 Dicas de Uso

1. **Iluminação adequada** - Use em ambientes bem iluminados
2. **Estabilize a câmera** - Evite tremores
3. **Distância ideal** - 1-2 metros da placa
4. **Ângulo reto** - Câmera perpendicular à placa
5. **Placa limpa** - Limpe sujeira antes de ler

## 🔄 Atualizações Futuras

Possíveis melhorias:
- [ ] Suporte a placas de outros países
- [ ] Correção automática de OCR (O→0, I→1)
- [ ] Histórico de tentativas inválidas
- [ ] Modo de debug com visualização
- [ ] Confiança do OCR (score)
