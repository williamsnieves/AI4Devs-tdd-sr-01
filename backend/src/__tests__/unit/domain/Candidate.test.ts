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

    // Parametrized test for constructor with different data combinations
    test.each([
      {
        description: 'create candidate with default empty arrays',
        input: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        },
        expectedArrays: { education: [], workExperience: [], resumes: [] },
      },
      {
        description: 'handle undefined optional fields',
        input: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: undefined,
          address: undefined,
        },
        expectedUndefined: ['phone', 'address'],
      },
    ])(
      'should $description',
      ({ input, expectedArrays, expectedUndefined }) => {
        // Act
        const candidate = new Candidate(input);

        // Assert
        expect(candidate.firstName).toBe(input.firstName);
        expect(candidate.lastName).toBe(input.lastName);
        expect(candidate.email).toBe(input.email);

        if (expectedArrays) {
          Object.entries(expectedArrays).forEach(([key, value]) => {
            expect(candidate[key as keyof typeof candidate]).toEqual(value);
          });
        }

        if (expectedUndefined) {
          expectedUndefined.forEach((field) => {
            expect(candidate[field as keyof typeof candidate]).toBeUndefined();
          });
        }
      },
    );
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

      // Parametrized test for create error scenarios
      test.each([
        {
          description: 'handle database initialization error on create',
          error: new mockPrismaClientInitializationError('Connection failed'),
          expectedErrorMessage: 'Connection failed',
          operation: 'create',
        },
        {
          description: 'handle other database errors on create',
          error: new Error('Database connection failed'),
          expectedErrorMessage: 'Database connection failed',
          operation: 'create',
        },
      ])(
        'should $description',
        async ({ error, expectedErrorMessage, operation }) => {
          // Arrange
          const candidate = new Candidate({
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
          });

          mockPrismaClient.candidate[operation as 'create'].mockRejectedValue(
            error,
          );

          // Act & Assert
          await expect(candidate.save()).rejects.toThrow(expectedErrorMessage);
          expect(
            mockPrismaClient.candidate[operation as 'create'],
          ).toHaveBeenCalled();
        },
      );
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

      // Parametrized test for update error scenarios
      test.each([
        {
          description: 'handle database initialization error on update',
          candidateId: 1,
          error: new mockPrismaClientInitializationError('Connection failed'),
          expectedErrorMessage: 'Connection failed',
        },
        {
          description: 'handle record not found error on update',
          candidateId: 999,
          error: { code: 'P2025' },
          expectedErrorMessage:
            'No se pudo encontrar el registro del candidato con el ID proporcionado.',
        },
        {
          description: 'handle other database errors on update',
          candidateId: 1,
          error: new Error('Database connection failed'),
          expectedErrorMessage: 'Database connection failed',
        },
      ])(
        'should $description',
        async ({ candidateId, error, expectedErrorMessage }) => {
          // Arrange
          const candidate = new Candidate({
            id: candidateId,
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
          });

          mockPrismaClient.candidate.update.mockRejectedValue(error);

          // Act & Assert
          await expect(candidate.save()).rejects.toThrow(expectedErrorMessage);
          expect(mockPrismaClient.candidate.update).toHaveBeenCalled();
        },
      );
    });

    describe('Data formatting', () => {
      // Parametrized test for data formatting scenarios
      test.each([
        {
          description: 'exclude undefined fields from candidateData',
          candidateData: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: undefined,
            address: undefined,
          },
          expectedData: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
          },
          excludedFields: ['phone', 'address'],
        },
        {
          description: 'include defined fields in candidateData',
          candidateData: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Ejemplo 123',
          },
          expectedData: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '612345678',
            address: 'Calle Ejemplo 123',
          },
          excludedFields: [],
        },
      ])(
        'should $description',
        async ({ candidateData, expectedData, excludedFields }) => {
          // Arrange
          const candidate = new Candidate(candidateData);
          const mockCreatedCandidate = createMockCandidate();
          mockPrismaClient.candidate.create.mockResolvedValue(
            mockCreatedCandidate,
          );

          // Act
          await candidate.save();

          // Assert
          expect(mockPrismaClient.candidate.create).toHaveBeenCalledWith({
            data: expectedData,
          });

          // Verify excluded fields are not present
          const actualCallData =
            mockPrismaClient.candidate.create.mock.calls[0][0].data;
          excludedFields.forEach((field) => {
            expect(actualCallData).not.toHaveProperty(field);
          });
        },
      );
    });
  });
});
