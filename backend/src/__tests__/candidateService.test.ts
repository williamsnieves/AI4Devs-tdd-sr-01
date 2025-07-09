import { validateCandidateData } from '../application/validator';

describe('CandidateService Tests', () => {
  
  describe('validateCandidateData', () => {
    
    it('should validate correct candidate data without throwing', () => {
      const validCandidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Ejemplo 123'
      };

      expect(() => {
        validateCandidateData(validCandidateData);
      }).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      const invalidCandidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'invalid-email',
        phone: '612345678',
        address: 'Calle Ejemplo 123'
      };

      expect(() => {
        validateCandidateData(invalidCandidateData);
      }).toThrow('Invalid email');
    });

    it('should throw error for invalid name', () => {
      const invalidCandidateData = {
        firstName: '123',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Ejemplo 123'
      };

      expect(() => {
        validateCandidateData(invalidCandidateData);
      }).toThrow('Invalid name');
    });

    it('should throw error for short name', () => {
      const invalidCandidateData = {
        firstName: 'J',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Ejemplo 123'
      };

      expect(() => {
        validateCandidateData(invalidCandidateData);
      }).toThrow('Invalid name');
    });

    it('should throw error for invalid phone', () => {
      const invalidCandidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '12345',
        address: 'Calle Ejemplo 123'
      };

      expect(() => {
        validateCandidateData(invalidCandidateData);
      }).toThrow('Invalid phone');
    });

    it('should allow editing existing candidate without mandatory fields', () => {
      const candidateDataWithId = {
        id: 1,
        firstName: 'Juan'
      };

      expect(() => {
        validateCandidateData(candidateDataWithId);
      }).not.toThrow();
    });

  });

}); 