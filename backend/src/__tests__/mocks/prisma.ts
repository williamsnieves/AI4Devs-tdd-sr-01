export const mockPrismaClient = {
  candidate: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  education: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  resume: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

export const resetMocks = () => {
  Object.values(mockPrismaClient).forEach((model) => {
    if (typeof model === 'object') {
      Object.values(model).forEach((method) => {
        if (jest.isMockFunction(method)) {
          method.mockClear();
        }
      });
    } else if (jest.isMockFunction(model)) {
      model.mockClear();
    }
  });
};

// Mock Prisma Client constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
  Prisma: {
    PrismaClientInitializationError: class extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'PrismaClientInitializationError';
      }
    },
  },
}));
