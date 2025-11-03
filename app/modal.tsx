import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import MlkitOcr from 'react-native-mlkit-ocr';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CarRegistry } from '@/lib/supabase';
import carService from '@/services/carService';
import ocrService from '@/services/ocrService';
import PlateValidator from '@/utils/plateValidator';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DetectedPlate {
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isValid: boolean;
}

export default function ModalScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [plateFormat, setPlateFormat] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPlates, setDetectedPlates] = useState<DetectedPlate[]>([]);
  const [foundCar, setFoundCar] = useState<CarRegistry | null>(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const intervalRef = useRef<any>(null);
  const recentPlatesRef = useRef<string[]>([]);

  // Animated values for Skia
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    } else {
      // Inicia a câmera automaticamente quando tiver permissão
      handleStartCamera();
    }
  }, [hasPermission]);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      // Aguarda a câmera estar pronta antes de iniciar o processamento
      const startDelay = setTimeout(() => {
        intervalRef.current = setInterval(async () => {
          await captureAndProcess();
        }, 1000); // Processa a cada 1 segundo
      }, 1500); // Aguarda 1.5 segundos para a câmera inicializar

      return () => {
        clearTimeout(startDelay);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Para o processamento quando a câmera é desativada
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isCameraActive]);

  const captureAndProcess = async () => {
    if (!camera.current || isProcessing || !isCameraActive) return;

    try {
      setIsProcessing(true);

      // Captura um snapshot da câmera
      const photo = await camera.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      // Processa o OCR
      const result: MlkitOcrResult[] = await MlkitOcr.detectFromUri(`file://${photo.path}`);

      if (result && result.length > 0) {
        const text = result.map((block) => block.text).join(' ');

        // Processa todos os blocos detectados para desenhar no canvas
        const plates: DetectedPlate[] = [];

        result.forEach((block) => {
          const validation = PlateValidator.findPlateInText(block.text);

          if (block.bounding && block.bounding.left !== undefined) {
            plates.push({
              text: block.text,
              bounds: {
                x: block.bounding.left,
                y: block.bounding.top,
                width: block.bounding.width,
                height: block.bounding.height,
              },
              isValid: validation.isValid,
            });
          }
        });

        setDetectedPlates(plates);
        overlayOpacity.value = withTiming(1, { duration: 200 });

        // Valida se é uma placa brasileira
        const validation = PlateValidator.findPlateInText(text);

        if (validation.isValid && validation.plate) {
          // Placa válida encontrada
          setRecognizedText(validation.plate);
          setPlateFormat(validation.format === 'mercosul' ? '🇧🇷 Mercosul' : '🇧🇷 Antiga');

          // Verifica se a placa já foi lida nas últimas 7 vezes
          if (isPlateRecentlyRead(validation.plate)) {
            console.log(`⏭️ Placa ${validation.plate} já foi lida recentemente (ignorando)`);
          } else {
            // Salva apenas placas válidas e não duplicadas no banco de dados
            try {
              await ocrService.saveReading(validation.plate);
              addToRecentPlates(validation.plate);
              console.log(`✅ Placa ${validation.format} salva: ${validation.plate}`);

              // Busca a placa nos registros de carros
              const carData = await carService.getCarByPlate(validation.plate);
              if (carData) {
                console.log(`🚗 Placa encontrada nos registros:`, carData);
                setFoundCar(carData);
                setShowCarModal(true);
                // Para a câmera quando encontra um carro registrado
                handleStopCamera();
              }
            } catch (error) {
              console.error('Erro ao salvar leitura:', error);
            }
          }
        } else {
          // Texto detectado mas não é uma placa válida
          setRecognizedText('Aguardando placa válida...');
          setPlateFormat('');
          console.log('⚠️ Texto detectado não é uma placa:', text);
        }
      } else {
        setDetectedPlates([]);
        overlayOpacity.value = withTiming(0, { duration: 200 });
      }
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      setDetectedPlates([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Não suportado', 'Câmera não está disponível na web');
      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera');
        return;
      }
    }

    setIsCameraActive(true);
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
    setDetectedPlates([]);
    overlayOpacity.value = 0;
    // Limpa o histórico de placas recentes ao parar a câmera
    recentPlatesRef.current = [];
  };

  const isPlateRecentlyRead = (plate: string): boolean => {
    return recentPlatesRef.current.includes(plate);
  };

  const addToRecentPlates = (plate: string) => {
    // Adiciona a placa no início do array
    recentPlatesRef.current.unshift(plate);

    // Mantém apenas as últimas 7 placas
    if (recentPlatesRef.current.length > 7) {
      recentPlatesRef.current = recentPlatesRef.current.slice(0, 7);
    }

    console.log('📋 Placas recentes:', recentPlatesRef.current);
  };

  const handleHistory = () => {
    router.push('/history');
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            <ThemedText>Solicitando permissão da câmera...</ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            <ThemedText>Câmera não disponível</ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.cameraContainer}>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={isCameraActive}
            photo={true}
          />

          {/* Skia Canvas Overlay */}
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {detectedPlates.map((plate, index) => (
              <React.Fragment key={index}>
                {/* Desenha retângulo ao redor do texto detectado */}
                <RoundedRect
                  x={plate.bounds.x}
                  y={plate.bounds.y}
                  width={plate.bounds.width}
                  height={plate.bounds.height}
                  r={8}
                  color={plate.isValid ? 'rgba(52, 199, 89, 0.3)' : 'rgba(0, 122, 255, 0.2)'}
                  style="fill"
                  opacity={overlayOpacity}
                />
                <RoundedRect
                  x={plate.bounds.x}
                  y={plate.bounds.y}
                  width={plate.bounds.width}
                  height={plate.bounds.height}
                  r={8}
                  color={plate.isValid ? '#34C759' : '#007AFF'}
                  style="stroke"
                  strokeWidth={3}
                  opacity={overlayOpacity}
                />
              </React.Fragment>
            ))}
          </Canvas>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.textTag}>
            <View style={styles.labelRow}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Placa detectada:
              </ThemedText>
              {plateFormat && <ThemedText style={styles.formatBadge}>{plateFormat}</ThemedText>}
            </View>
            <ThemedText style={styles.recognizedText} numberOfLines={2}>
              {recognizedText || 'Aguardando placa...'}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.historyButton} onPress={handleHistory}>
            <ThemedText type="defaultSemiBold" style={styles.historyButtonText}>
              Histórico
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Modal de Placa Encontrada */}
        <Modal
          visible={showCarModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCarModal(false)}
        >
          <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
            <View style={styles.modalContent}>
              <View style={styles.alertHeader}>
                <ThemedText style={styles.alertIcon}>⚠️</ThemedText>
                <ThemedText type="title" style={styles.alertTitle}>
                  PLACA ENCONTRADA!
                </ThemedText>
              </View>

              {foundCar && (
                <View style={styles.carDetails}>
                  <View style={styles.plateContainer}>
                    <ThemedText type="subtitle" style={styles.plateText}>
                      {foundCar.plate}
                    </ThemedText>
                  </View>

                  {(foundCar.brand || foundCar.model) && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Veículo:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {foundCar.brand} {foundCar.model} {foundCar.year}
                      </ThemedText>
                    </View>
                  )}

                  {foundCar.color && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Cor:</ThemedText>
                      <ThemedText style={styles.detailValue}>{foundCar.color}</ThemedText>
                    </View>
                  )}

                  {foundCar.contact_name && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Contato:</ThemedText>
                      <ThemedText style={styles.detailValue}>{foundCar.contact_name}</ThemedText>
                    </View>
                  )}

                  {foundCar.contact_phone && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Telefone:</ThemedText>
                      <ThemedText style={styles.detailValue}>{foundCar.contact_phone}</ThemedText>
                    </View>
                  )}

                  {foundCar.comments && (
                    <View style={styles.commentsContainer}>
                      <ThemedText style={styles.detailLabel}>Observações:</ThemedText>
                      <ThemedText style={styles.commentsText}>{foundCar.comments}</ThemedText>
                    </View>
                  )}
                </View>
              )}

              <Pressable
                style={styles.closeModalButton}
                onPress={() => {
                  setShowCarModal(false);
                  setFoundCar(null);
                }}
              >
                <ThemedText style={styles.closeModalButtonText}>Fechar</ThemedText>
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 50,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 12,
  },
  textTag: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
  },
  formatBadge: {
    fontSize: 10,
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recognizedText: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  historyButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF3B30',
  },
  alertIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  alertTitle: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  carDetails: {
    marginBottom: 24,
  },
  plateContainer: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  plateText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
    color: '#000',
  },
  commentsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  commentsText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
