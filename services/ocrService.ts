import { SUPABASE_CONFIG } from '@/constants/config';
import { ReadPlace, supabase } from '@/lib/supabase';

class OcrService {
  async saveReading(text: string): Promise<ReadPlace | null> {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.TABLE)
        .insert([
          {
            place: text,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar no Supabase:', error);
        return null;
      }

      console.log('✅ Leitura salva no Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao salvar leitura:', error);
      return null;
    }
  }

  async getReadings(): Promise<ReadPlace[]> {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar do Supabase:', error);
        return [];
      }

      console.log(`✅ ${data.length} leituras carregadas do Supabase`);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar leituras:', error);
      return [];
    }
  }

  async deleteReading(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(SUPABASE_CONFIG.TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar do Supabase:', error);
        return false;
      }

      console.log('✅ Leitura deletada do Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar leitura:', error);
      return false;
    }
  }
}

export default new OcrService();
