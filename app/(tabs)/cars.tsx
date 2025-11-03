import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CarRegistry } from '@/lib/supabase';
import carService from '@/services/carService';
import PlateValidator from '@/utils/plateValidator';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CarsScreen() {
  const [cars, setCars] = useState<CarRegistry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<CarRegistry | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    comments: '',
  });

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setIsLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os registros');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars();
    setRefreshing(false);
  };

  const openModal = (car?: CarRegistry) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        plate: car.plate,
        brand: car.brand || '',
        model: car.model || '',
        year: car.year?.toString() || '',
        color: car.color || '',
        contact_name: car.contact_name || '',
        contact_phone: car.contact_phone || '',
        contact_email: car.contact_email || '',
        comments: car.comments || '',
      });
    } else {
      setEditingCar(null);
      setFormData({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        comments: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCar(null);
  };

  const handleSave = async () => {
    if (!formData.plate.trim()) {
      Alert.alert('Erro', 'Placa é obrigatória');
      return;
    }

    // Valida a placa usando o PlateValidator
    const validation = PlateValidator.validate(formData.plate);
    if (!validation.isValid) {
      Alert.alert(
        'Placa Inválida',
        'Por favor, insira uma placa válida.\nFormatos aceitos:\n• Mercosul: ABC1D23\n• Antiga: ABC1234'
      );
      return;
    }

    const carData = {
      plate: validation.plate!, // Usa a placa formatada pelo validador
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      color: formData.color || undefined,
      contact_name: formData.contact_name || undefined,
      contact_phone: formData.contact_phone || undefined,
      contact_email: formData.contact_email || undefined,
      comments: formData.comments || undefined,
    };

    let success = false;
    if (editingCar) {
      success = await carService.updateCar(editingCar.id, carData);
    } else {
      success = await carService.createCar(carData);
    }

    if (success) {
      Alert.alert('Sucesso', editingCar ? 'Registro atualizado' : 'Registro criado');
      closeModal();
      loadCars();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o registro');
    }
  };

  const handleDelete = (car: CarRegistry) => {
    Alert.alert('Confirmar exclusão', `Deseja excluir o registro da placa ${car.plate}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const success = await carService.deleteCar(car.id);
          if (success) {
            setCars(cars.filter((c) => c.id !== car.id));
          } else {
            Alert.alert('Erro', 'Não foi possível excluir o registro');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: CarRegistry }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold" style={styles.plate}>
          {item.plate}
        </ThemedText>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <ThemedText style={styles.deleteIcon}>🗑️</ThemedText>
        </TouchableOpacity>
      </View>
      {(item.brand || item.model) && (
        <ThemedText style={styles.carInfo}>
          {item.brand} {item.model} {item.year}
        </ThemedText>
      )}
      {item.color && <ThemedText style={styles.detail}>Cor: {item.color}</ThemedText>}
      {item.contact_name && (
        <ThemedText style={styles.detail}>Contato: {item.contact_name}</ThemedText>
      )}
      {item.contact_phone && <ThemedText style={styles.detail}>📞 {item.contact_phone}</ThemedText>}
      {item.comments && (
        <ThemedText style={styles.comments} numberOfLines={2}>
          {item.comments}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Registros de Carros</ThemedText>
          <Pressable style={styles.addButton} onPress={() => openModal()}>
            <ThemedText style={styles.addButtonText}>+ Adicionar</ThemedText>
          </Pressable>
        </View>

      {isLoading && cars.length === 0 ? (
        <View style={styles.centerContent}>
          <ThemedText>Carregando registros...</ThemedText>
        </View>
      ) : cars.length === 0 ? (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyText}>Nenhum registro encontrado</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Toque em "+ Adicionar" para criar um registro
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingCar ? 'Editar Registro' : 'Novo Registro'}
              </ThemedText>
              <TouchableOpacity onPress={closeModal}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <ThemedText style={styles.label}>Placa *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.plate}
                onChangeText={(text) => setFormData({ ...formData, plate: text })}
                placeholder="ABC1D23"
                maxLength={7}
                autoCapitalize="characters"
                editable={!editingCar}
              />

              <ThemedText style={styles.label}>Marca</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Ex: Toyota"
              />

              <ThemedText style={styles.label}>Modelo</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="Ex: Corolla"
              />

              <ThemedText style={styles.label}>Ano</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(text) => setFormData({ ...formData, year: text })}
                placeholder="Ex: 2020"
                keyboardType="numeric"
                maxLength={4}
              />

              <ThemedText style={styles.label}>Cor</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
                placeholder="Ex: Preto"
              />

              <ThemedText style={styles.label}>Nome do Contato</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.contact_name}
                onChangeText={(text) => setFormData({ ...formData, contact_name: text })}
                placeholder="Nome completo"
              />

              <ThemedText style={styles.label}>Telefone</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.contact_phone}
                onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />

              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.contact_email}
                onChangeText={(text) => setFormData({ ...formData, contact_email: text })}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <ThemedText style={styles.label}>Comentários</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.comments}
                onChangeText={(text) => setFormData({ ...formData, comments: text })}
                placeholder="Observações adicionais"
                multiline
                numberOfLines={4}
              />

              <Pressable style={styles.saveButton} onPress={handleSave}>
                <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
              </Pressable>
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plate: {
    fontSize: 20,
    color: '#007AFF',
  },
  deleteIcon: {
    fontSize: 20,
  },
  carInfo: {
    fontSize: 16,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  comments: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
