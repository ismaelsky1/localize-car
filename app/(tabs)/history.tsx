import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReadPlace } from '@/lib/supabase';
import ocrService from '@/services/ocrService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [readings, setReadings] = useState<ReadPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      setIsLoading(true);
      const data = await ocrService.getReadings();
      setReadings(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta leitura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await ocrService.deleteReading(id);
            if (success) {
              setReadings(readings.filter(r => r.id !== id));
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a leitura');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: ReadPlace }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          {item.place}
        </ThemedText>
        <ThemedText style={styles.itemTime}>
          {formatDate(item.created_at)}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        {isLoading && readings.length === 0 ? (
          <View style={styles.centerContent}>
            <ThemedText>Carregando histórico...</ThemedText>
          </View>
        ) : readings.length === 0 ? (
          <View style={styles.centerContent}>
            <ThemedText style={styles.emptyText}>
              Nenhuma leitura encontrada
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              As leituras aparecerão aqui após usar o scanner
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={readings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
