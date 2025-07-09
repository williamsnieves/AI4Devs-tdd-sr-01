import { resetMocks } from '../mocks/prisma';

// Global test setup
export const setupTests = () => {
  // Reset all mocks before each test
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });
};

// Mock console methods to avoid noise in tests
export const mockConsole = () => {
  const originalConsole = console;

  beforeAll(() => {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });
};

// Helper to wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to test async errors
export const expectAsyncError = async (
  fn: () => Promise<any>,
  expectedError: string,
) => {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    expect((error as Error).message).toBe(expectedError);
  }
};
