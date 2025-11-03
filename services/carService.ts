import { CarRegistry, supabase } from '@/lib/supabase';

class CarService {
  private tableName = 'car_registry';

  async getAllCars(): Promise<CarRegistry[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar carros:', error);
      return [];
    }
  }

  async getCarByPlate(plate: string): Promise<CarRegistry | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('plate', plate)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar carro:', error);
      return null;
    }
  }

  async createCar(car: Omit<CarRegistry, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert([car]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      return false;
    }
  }

  async updateCar(id: string, car: Partial<CarRegistry>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update(car)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      return false;
    }
  }

  async deleteCar(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      return false;
    }
  }
}

export default new CarService();
