# Configuração do OCR - Leitura em Tempo Real

## ✅ O que foi implementado

1. **Modal OCR com câmera em tempo real** (`app/modal.tsx`):
   - Header nativo com título "Leitor OCR" e botão voltar
   - Botão para iniciar leitura em tempo real
   - Câmera ativa que lê texto automaticamente enquanto está aberta
   - Botão "Parar Câmera" para fechar a câmera
   - Tag na parte inferior mostrando o texto lido em tempo real
   - Botão "Histórico" ao lado da tag
   - Texto é atualizado automaticamente a cada 500ms

2. **Permissões configuradas** (`app.json`):
   - Câmera (iOS e Android)
   - Plugin react-native-vision-camera configurado

3. **Dependências instaladas**:
   - `react-native-mlkit-ocr` - Para reconhecimento de texto
   - `react-native-vision-camera` - Para câmera em tempo real
   - `react-native-worklets-core` - Para processamento de frames

4. **Babel configurado** (`babel.config.js`):
   - Plugin worklets-core para processamento em tempo real
   - Plugin reanimated para animações

## 🚀 Como usar

### Para testar no Android:

```bash
# Rebuild do app nativo (necessário após adicionar plugins nativos)
npx expo prebuild --clean
npx expo run:android
```

### Para testar no iOS:

```bash
# Rebuild do app nativo
npx expo prebuild --clean
npx expo run:ios
```

## 📱 Funcionalidades

1. **Iniciar Leitura em Tempo Real**: Abre a câmera e começa a ler texto automaticamente
2. **Parar Câmera**: Fecha a câmera e mantém o último texto lido
3. **Texto Lido**: Exibe o texto reconhecido em tempo real na tag inferior
4. **Histórico**: Botão preparado para implementação futura

## ⚠️ Importante

- O OCR **não funciona na web**, apenas em dispositivos móveis (Android/iOS)
- É necessário fazer **rebuild completo** do app nativo após as mudanças
- O texto é atualizado automaticamente enquanto a câmera está ativa
- O processamento ocorre a cada 500ms para não sobrecarregar o dispositivo

## 🔧 Como funciona

1. Usuário toca em "Iniciar Leitura em Tempo Real"
2. Câmera abre e começa a processar frames
3. A cada 500ms, um frame é enviado para o MLKit OCR
4. Texto detectado é exibido automaticamente na tag inferior
5. Usuário pode parar a câmera a qualquer momento

## 🎯 Próximos passos (opcional)

Se quiser implementar o histórico:
1. Usar AsyncStorage para salvar as leituras
2. Criar uma nova tela para exibir o histórico
3. Adicionar timestamp e possibilidade de copiar texto
4. Adicionar filtro de confiança para melhorar precisão
