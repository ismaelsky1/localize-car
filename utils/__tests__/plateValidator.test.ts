import PlateValidator from '../plateValidator';

describe('PlateValidator', () => {
  describe('Formato Mercosul', () => {
    it('deve validar placa Mercosul válida', () => {
      const result = PlateValidator.validate('ABC1D23');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
      expect(result.plate).toBe('ABC-1D23');
    });

    it('deve validar placa Mercosul com letras minúsculas', () => {
      const result = PlateValidator.validate('abc1d23');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
      expect(result.plate).toBe('ABC-1D23');
    });

    it('deve validar placa Mercosul com espaços', () => {
      const result = PlateValidator.validate('ABC 1D23');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
      expect(result.plate).toBe('ABC-1D23');
    });

    it('deve validar placa Mercosul com hífen', () => {
      const result = PlateValidator.validate('ABC-1D23');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
      expect(result.plate).toBe('ABC-1D23');
    });
  });

  describe('Formato Antigo', () => {
    it('deve validar placa antiga válida', () => {
      const result = PlateValidator.validate('ABC1234');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('antigo');
      expect(result.plate).toBe('ABC-1234');
    });

    it('deve validar placa antiga com letras minúsculas', () => {
      const result = PlateValidator.validate('abc1234');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('antigo');
      expect(result.plate).toBe('ABC-1234');
    });

    it('deve validar placa antiga com espaços', () => {
      const result = PlateValidator.validate('ABC 1234');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('antigo');
      expect(result.plate).toBe('ABC-1234');
    });
  });

  describe('Placas Inválidas', () => {
    it('deve rejeitar texto vazio', () => {
      const result = PlateValidator.validate('');
      expect(result.isValid).toBe(false);
    });

    it('deve rejeitar placa com tamanho incorreto', () => {
      const result = PlateValidator.validate('ABC123');
      expect(result.isValid).toBe(false);
    });

    it('deve rejeitar placa com formato incorreto', () => {
      const result = PlateValidator.validate('1234ABC');
      expect(result.isValid).toBe(false);
    });

    it('deve rejeitar placa com caracteres especiais', () => {
      const result = PlateValidator.validate('ABC@1234');
      expect(result.isValid).toBe(false);
    });

    it('deve rejeitar placa Mercosul com número no lugar da letra', () => {
      const result = PlateValidator.validate('ABC1123');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Extração de Placa', () => {
    it('deve extrair placa Mercosul de texto maior', () => {
      const result = PlateValidator.extractPlate('Placa: ABC1D23 - Veículo');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
      expect(result.plate).toBe('ABC-1D23');
    });

    it('deve extrair placa antiga de texto maior', () => {
      const result = PlateValidator.extractPlate('Veículo ABC1234 registrado');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('antigo');
      expect(result.plate).toBe('ABC-1234');
    });

    it('deve retornar inválido se não encontrar placa', () => {
      const result = PlateValidator.extractPlate('Texto sem placa');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Busca em Texto', () => {
    it('deve encontrar placa em texto simples', () => {
      const result = PlateValidator.findPlateInText('ABC1D23');
      expect(result.isValid).toBe(true);
      expect(result.plate).toBe('ABC-1D23');
    });

    it('deve encontrar placa em texto complexo', () => {
      const result = PlateValidator.findPlateInText('O veículo de placa ABC1234 está estacionado');
      expect(result.isValid).toBe(true);
      expect(result.plate).toBe('ABC-1234');
    });

    it('deve priorizar validação direta', () => {
      const result = PlateValidator.findPlateInText('ABC1D23');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('mercosul');
    });
  });

  describe('Exemplos Reais', () => {
    const placasValidas = [
      'ABC1234', // Antiga
      'XYZ9876', // Antiga
      'ABC1D23', // Mercosul
      'XYZ9A87', // Mercosul
      'BRA2E19', // Mercosul
    ];

    placasValidas.forEach((placa) => {
      it(`deve validar placa real: ${placa}`, () => {
        const result = PlateValidator.validate(placa);
        expect(result.isValid).toBe(true);
      });
    });

    const placasInvalidas = [
      '123ABCD',
      'ABCD123',
      'AB1234',
      'ABC12345',
      '1234567',
      'ABCDEFG',
    ];

    placasInvalidas.forEach((placa) => {
      it(`deve rejeitar placa inválida: ${placa}`, () => {
        const result = PlateValidator.validate(placa);
        expect(result.isValid).toBe(false);
      });
    });
  });
});
