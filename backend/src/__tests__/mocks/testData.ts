// Test data builders for unit tests
export const createMockCandidate = (overrides = {}) => ({
  id: 1,
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '612345678',
  address: 'Calle Ejemplo 123',
  education: [],
  workExperience: [],
  resumes: [],
  ...overrides,
});

export const createMockEducation = (overrides = {}) => ({
  id: 1,
  institution: 'Universidad de Madrid',
  title: 'Ingeniería Informática',
  startDate: new Date('2020-09-01'),
  endDate: new Date('2024-06-30'),
  candidateId: 1,
  ...overrides,
});

export const createMockWorkExperience = (overrides = {}) => ({
  id: 1,
  company: 'Tech Corp',
  position: 'Software Developer',
  description: 'Desarrollo de aplicaciones web',
  startDate: new Date('2023-01-15'),
  endDate: new Date('2024-01-15'),
  candidateId: 1,
  ...overrides,
});

export const createMockResume = (overrides = {}) => ({
  id: 1,
  filePath: '/uploads/1234567890-resume.pdf',
  fileType: 'application/pdf',
  uploadDate: new Date('2024-01-01'),
  candidateId: 1,
  ...overrides,
});

export const createMockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  prisma: mockPrismaClient,
});

export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

export const createMockFile = (overrides = {}) => ({
  fieldname: 'file',
  originalname: 'test-resume.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  destination: '../uploads/',
  filename: '1234567890-test-resume.pdf',
  path: '../uploads/1234567890-test-resume.pdf',
  size: 1048576,
  ...overrides,
});

// Import the mock prisma client
import { mockPrismaClient } from './prisma';
