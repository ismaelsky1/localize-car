import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🚗 Localize Car</ThemedText>
      </ThemedView>

      <ThemedView style={styles.descriptionContainer}>
        <ThemedText>
          Leitor de placas de veículos em tempo real usando OCR. Reconhece placas brasileiras Mercosul e Antiga.
        </ThemedText>
      </ThemedView>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/modal')}>
        <ThemedText style={styles.buttonText}>📸 Iniciar Leitura</ThemedText>
      </Pressable>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">✨ Funcionalidades</ThemedText>
        <ThemedText>✅ Detecção automática de placas</ThemedText>
        <ThemedText>✅ Validação de formatos brasileiros</ThemedText>
        <ThemedText>✅ Histórico sincronizado na nuvem</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
