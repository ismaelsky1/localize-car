/**
 * Valida se o texto é uma placa de veículo brasileira
 * Formatos aceitos:
 * - Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
 * - Antigo: ABC1234 (3 letras, 4 números)
 */

export interface PlateValidationResult {
  isValid: boolean;
  format?: 'mercosul' | 'antigo';
  plate?: string;
}

export class PlateValidator {
  // Regex para placa Mercosul: ABC1D23
  private static readonly MERCOSUL_PATTERN = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  // Regex para placa antiga: ABC1234
  private static readonly ANTIGO_PATTERN = /^[A-Z]{3}[0-9]{4}$/;

  /**
   * Limpa o texto removendo espaços e caracteres especiais
   */
  private static cleanText(text: string): string {
    return text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Remove tudo que não é letra ou número
      .trim();
  }

  /**
   * Valida se o texto é uma placa válida
   */
  static validate(text: string): PlateValidationResult {
    if (!text || text.trim().length === 0) {
      return { isValid: false };
    }

    const cleanedText = this.cleanText(text);

    // Verifica se tem o tamanho correto (7 caracteres)
    if (cleanedText.length !== 7) {
      return { isValid: false };
    }

    // Testa formato Mercosul
    if (this.MERCOSUL_PATTERN.test(cleanedText)) {
      return {
        isValid: true,
        format: 'mercosul',
        plate: this.formatPlate(cleanedText, 'mercosul'),
      };
    }

    // Testa formato antigo
    if (this.ANTIGO_PATTERN.test(cleanedText)) {
      return {
        isValid: true,
        format: 'antigo',
        plate: this.formatPlate(cleanedText, 'antigo'),
      };
    }

    return { isValid: false };
  }

  /**
   * Formata a placa sem hífen (para compatibilidade com banco de dados)
   * Mercosul: ABC1D23
   * Antigo: ABC1234
   */
  private static formatPlate(plate: string, format: 'mercosul' | 'antigo'): string {
    return plate; // Retorna sem hífen para ambos os formatos
  }

  /**
   * Tenta extrair uma placa de um texto maior
   * Útil quando o OCR captura texto adicional
   */
  static extractPlate(text: string): PlateValidationResult {
    const cleanedText = this.cleanText(text);

    // Tenta encontrar padrão Mercosul no texto
    const mercosulMatch = cleanedText.match(/[A-Z]{3}[0-9][A-Z][0-9]{2}/);
    if (mercosulMatch) {
      return {
        isValid: true,
        format: 'mercosul',
        plate: this.formatPlate(mercosulMatch[0], 'mercosul'),
      };
    }

    // Tenta encontrar padrão antigo no texto
    const antigoMatch = cleanedText.match(/[A-Z]{3}[0-9]{4}/);
    if (antigoMatch) {
      return {
        isValid: true,
        format: 'antigo',
        plate: this.formatPlate(antigoMatch[0], 'antigo'),
      };
    }

    return { isValid: false };
  }

  /**
   * Valida múltiplas linhas de texto e retorna a primeira placa válida
   */
  static findPlateInText(text: string): PlateValidationResult {
    // Primeiro tenta validação direta
    const directValidation = this.validate(text);
    if (directValidation.isValid) {
      return directValidation;
    }

    // Se não funcionar, tenta extrair do texto
    return this.extractPlate(text);
  }
}

export default PlateValidator;
