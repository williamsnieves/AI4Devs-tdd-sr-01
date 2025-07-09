import { mockPrismaClient } from '../../mocks/prisma';
import { createMockCandidate } from '../../mocks/testData';
import { setupTests, mockConsole } from '../../helpers/testSetup';

// Mock the Prisma client
const mockPrismaClientInitializationError = class extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientInitializationError';
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
  Prisma: {
    PrismaClientInitializationError: mockPrismaClientInitializationError,
  },
}));

import { Candidate } from '../../../domain/models/Candidate';

describe('Candidate Domain Model Unit Tests', () => {
  setupTests();
  mockConsole();

  describe('Constructor', () => {
    it('should create a candidate with all fields', () => {
      // Arrange
      const candidateData = {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Ejemplo 123',
        education: [{ institution: 'Universidad de Madrid' }],
        workExperience: [{ company: 'Tech Corp' }],
        resumes: [{ filePath: '/uploads/resume.pdf' }],
      };

      // Act
      const candidate = new Candidate(candidateData);

      // Assert
      expect(candidate.id).toBe(1);
      expect(candidate.firstName).toBe('Juan');
      expect(candidate.lastName).toBe('Pérez');
      expect(candidate.email).toBe('juan.perez@example.com');
      expect(candidate.phone).toBe('612345678');
      expect(candidate.address).toBe('Calle Ejemplo 123');
      expect(candidate.education).toEqual([
        { institution: 'Universidad de Madrid' },
      ]);
      expect(candidate.workExperience).toEqual([{ company: 'Tech Corp' }]);
      expect(candidate.resumes).toEqual([{ filePath: '/uploads/resume.pdf' }]);
    });

    it('should create a candidate with default empty arrays', () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
      };

      // Act
      const candidate = new Candidate(candidateData);

      // Assert
      expect(candidate.firstName).toBe('Juan');
      expect(candidate.lastName).toBe('Pérez');
      expect(candidate.email).toBe('juan.perez@example.com');
      expect(candidate.education).toEqual([]);
      expect(candidate.workExperience).toEqual([]);
      expect(candidate.resumes).toEqual([]);
    });

    it('should handle undefined optional fields', () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: undefined,
        address: undefined,
      };

      // Act
      const candidate = new Candidate(candidateData);

      // Assert
      expect(candidate.phone).toBeUndefined();
      expect(candidate.address).toBeUndefined();
    });
  });

  describe('save method', () => {
    describe('Creating new candidate', () => {
      it('should create a new candidate when no id is provided', async () => {
        // Arrange
        const candidate = new Candidate({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '612345678',
          address: 'Calle Ejemplo 123',
        });

        const mockCreatedCandidate = createMockCandidate({ id: 1 });
        mockPrismaClient.candidate.create.mockResolvedValue(
          mockCreatedCandidate,
        );

        // Act
        const result = await candidate.save();

        // Assert
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledWith({
          data: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Ejemplo 123',
          },
        });
        expect(result).toEqual(mockCreatedCandidate);
      });

      it('should handle database initialization error on create', async () => {
        // Arrange
        const candidate = new Candidate({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        });

        const initError = new mockPrismaClientInitializationError(
          'Connection failed',
        );
        mockPrismaClient.candidate.create.mockRejectedValue(initError);

        // Act & Assert
        await expect(candidate.save()).rejects.toThrow('Connection failed');
        expect(mockPrismaClient.candidate.create).toHaveBeenCalled();
      });

      it('should handle other database errors on create', async () => {
        // Arrange
        const candidate = new Candidate({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        });

        const dbError = new Error('Database connection failed');
        mockPrismaClient.candidate.create.mockRejectedValue(dbError);

        // Act & Assert
        await expect(candidate.save()).rejects.toThrow(
          'Database connection failed',
        );
        expect(mockPrismaClient.candidate.create).toHaveBeenCalled();
      });
    });

    describe('Updating existing candidate', () => {
      it('should update an existing candidate when id is provided', async () => {
        // Arrange
        const candidate = new Candidate({
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '612345678',
          address: 'Calle Ejemplo 123',
        });

        const mockUpdatedCandidate = createMockCandidate({ id: 1 });
        mockPrismaClient.candidate.update.mockResolvedValue(
          mockUpdatedCandidate,
        );

        // Act
        const result = await candidate.save();

        // Assert
        expect(mockPrismaClient.candidate.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Ejemplo 123',
          },
        });
        expect(result).toEqual(mockUpdatedCandidate);
      });

      it('should handle database initialization error on update', async () => {
        // Arrange
        const candidate = new Candidate({
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        });

        const initError = new mockPrismaClientInitializationError(
          'Connection failed',
        );
        mockPrismaClient.candidate.update.mockRejectedValue(initError);

        // Act & Assert
        await expect(candidate.save()).rejects.toThrow('Connection failed');
        expect(mockPrismaClient.candidate.update).toHaveBeenCalled();
      });

      it('should handle record not found error on update', async () => {
        // Arrange
        const candidate = new Candidate({
          id: 999,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        });

        const notFoundError = { code: 'P2025' };
        mockPrismaClient.candidate.update.mockRejectedValue(notFoundError);

        // Act & Assert
        await expect(candidate.save()).rejects.toThrow(
          'No se pudo encontrar el registro del candidato con el ID proporcionado.',
        );
        expect(mockPrismaClient.candidate.update).toHaveBeenCalled();
      });

      it('should handle other database errors on update', async () => {
        // Arrange
        const candidate = new Candidate({
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        });

        const dbError = new Error('Database connection failed');
        mockPrismaClient.candidate.update.mockRejectedValue(dbError);

        // Act & Assert
        await expect(candidate.save()).rejects.toThrow(
          'Database connection failed',
        );
        expect(mockPrismaClient.candidate.update).toHaveBeenCalled();
      });
    });

    describe('Data formatting', () => {
      it('should exclude undefined fields from candidateData', async () => {
        // Arrange
        const candidate = new Candidate({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: undefined,
          address: undefined,
        });

        const mockCreatedCandidate = createMockCandidate();
        mockPrismaClient.candidate.create.mockResolvedValue(
          mockCreatedCandidate,
        );

        // Act
        await candidate.save();

        // Assert
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledWith({
          data: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
          },
        });
        expect(
          mockPrismaClient.candidate.create.mock.calls[0][0].data,
        ).not.toHaveProperty('phone');
        expect(
          mockPrismaClient.candidate.create.mock.calls[0][0].data,
        ).not.toHaveProperty('address');
      });

      it('should include defined fields in candidateData', async () => {
        // Arrange
        const candidate = new Candidate({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '612345678',
          address: 'Calle Ejemplo 123',
        });

        const mockCreatedCandidate = createMockCandidate();
        mockPrismaClient.candidate.create.mockResolvedValue(
          mockCreatedCandidate,
        );

        // Act
        await candidate.save();

        // Assert
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledWith({
          data: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Ejemplo 123',
          },
        });
      });
    });
  });
});
