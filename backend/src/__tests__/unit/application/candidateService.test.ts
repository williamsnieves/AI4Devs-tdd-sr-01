import { addCandidate } from '../../../application/services/candidateService';
import { validateCandidateData } from '../../../application/validator';
import { Candidate } from '../../../domain/models/Candidate';
import { Education } from '../../../domain/models/Education';
import { WorkExperience } from '../../../domain/models/WorkExperience';
import { Resume } from '../../../domain/models/Resume';
import { mockPrismaClient } from '../../mocks/prisma';
import {
  createMockCandidate,
  createMockEducation,
  createMockWorkExperience,
  createMockResume,
} from '../../mocks/testData';
import { setupTests, mockConsole } from '../../helpers/testSetup';

// Mock all dependencies
jest.mock('../../../application/validator');
jest.mock('../../../domain/models/Candidate');
jest.mock('../../../domain/models/Education');
jest.mock('../../../domain/models/WorkExperience');
jest.mock('../../../domain/models/Resume');

const mockValidateCandidateData = validateCandidateData as jest.MockedFunction<
  typeof validateCandidateData
>;
const mockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const mockEducation = Education as jest.MockedClass<typeof Education>;
const mockWorkExperience = WorkExperience as jest.MockedClass<
  typeof WorkExperience
>;
const mockResume = Resume as jest.MockedClass<typeof Resume>;

describe('CandidateService Unit Tests', () => {
  setupTests();
  mockConsole();

  describe('addCandidate', () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '612345678',
      address: 'Calle Ejemplo 123',
      educations: [
        {
          institution: 'Universidad de Madrid',
          title: 'Ingeniería Informática',
          startDate: '2020-09-01',
          endDate: '2024-06-30',
        },
      ],
      workExperiences: [
        {
          company: 'Tech Corp',
          position: 'Software Developer',
          description: 'Desarrollo de aplicaciones web',
          startDate: '2023-01-15',
          endDate: '2024-01-15',
        },
      ],
      cv: {
        filePath: '/uploads/1234567890-resume.pdf',
        fileType: 'application/pdf',
      },
    };

    beforeEach(() => {
      // Reset mocks
      mockValidateCandidateData.mockReset();
      mockCandidate.mockReset();
      mockEducation.mockReset();
      mockWorkExperience.mockReset();
      mockResume.mockReset();
    });

    it('should successfully add a candidate with all data', async () => {
      // Arrange
      const mockSavedCandidate = createMockCandidate({ id: 1 });
      const mockCandidateInstance = {
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
        education: [],
        workExperience: [],
        resumes: [],
      };
      const mockEducationInstance = {
        save: jest.fn().mockResolvedValue(createMockEducation()),
      };
      const mockWorkExperienceInstance = {
        save: jest.fn().mockResolvedValue(createMockWorkExperience()),
      };
      const mockResumeInstance = {
        save: jest.fn().mockResolvedValue(createMockResume()),
      };

      mockValidateCandidateData.mockImplementation(() => {}); // No validation errors
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);
      mockEducation.mockImplementation(() => mockEducationInstance as any);
      mockWorkExperience.mockImplementation(
        () => mockWorkExperienceInstance as any,
      );
      mockResume.mockImplementation(() => mockResumeInstance as any);

      // Act
      const result = await addCandidate(mockCandidateData);

      // Assert
      expect(mockValidateCandidateData).toHaveBeenCalledWith(mockCandidateData);
      expect(mockCandidate).toHaveBeenCalledWith(mockCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
      expect(mockEducation).toHaveBeenCalledWith(
        mockCandidateData.educations[0],
      );
      expect(mockEducationInstance.save).toHaveBeenCalled();
      expect(mockWorkExperience).toHaveBeenCalledWith(
        mockCandidateData.workExperiences[0],
      );
      expect(mockWorkExperienceInstance.save).toHaveBeenCalled();
      expect(mockResume).toHaveBeenCalledWith(mockCandidateData.cv);
      expect(mockResumeInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationError = new Error('Invalid email');
      mockValidateCandidateData.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(addCandidate(mockCandidateData)).rejects.toThrow(
        'Invalid email',
      );
      expect(mockValidateCandidateData).toHaveBeenCalledWith(mockCandidateData);
      expect(mockCandidate).not.toHaveBeenCalled();
    });

    it('should handle database unique constraint error', async () => {
      // Arrange
      const mockCandidateInstance = {
        save: jest.fn().mockRejectedValue({ code: 'P2002' }),
        education: [],
        workExperience: [],
        resumes: [],
      };

      mockValidateCandidateData.mockImplementation(() => {});
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);

      // Act & Assert
      await expect(addCandidate(mockCandidateData)).rejects.toThrow(
        'The email already exists in the database',
      );
      expect(mockCandidateInstance.save).toHaveBeenCalled();
    });

    it('should handle other database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      const mockCandidateInstance = {
        save: jest.fn().mockRejectedValue(dbError),
        education: [],
        workExperience: [],
        resumes: [],
      };

      mockValidateCandidateData.mockImplementation(() => {});
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);

      // Act & Assert
      await expect(addCandidate(mockCandidateData)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockCandidateInstance.save).toHaveBeenCalled();
    });

    it('should add candidate without education and work experience', async () => {
      // Arrange
      const candidateDataWithoutEducation = {
        ...mockCandidateData,
        educations: undefined,
        workExperiences: undefined,
        cv: undefined,
      };
      const mockSavedCandidate = createMockCandidate({ id: 1 });
      const mockCandidateInstance = {
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
        education: [],
        workExperience: [],
        resumes: [],
      };

      mockValidateCandidateData.mockImplementation(() => {});
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);

      // Act
      const result = await addCandidate(candidateDataWithoutEducation);

      // Assert
      expect(mockValidateCandidateData).toHaveBeenCalledWith(
        candidateDataWithoutEducation,
      );
      expect(mockCandidate).toHaveBeenCalledWith(candidateDataWithoutEducation);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
      expect(mockEducation).not.toHaveBeenCalled();
      expect(mockWorkExperience).not.toHaveBeenCalled();
      expect(mockResume).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('should add candidate with empty CV object', async () => {
      // Arrange
      const candidateDataWithEmptyCV = {
        ...mockCandidateData,
        cv: {},
      };
      const mockSavedCandidate = createMockCandidate({ id: 1 });
      const mockCandidateInstance = {
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
        education: [],
        workExperience: [],
        resumes: [],
      };

      mockValidateCandidateData.mockImplementation(() => {});
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);

      // Act
      const result = await addCandidate(candidateDataWithEmptyCV);

      // Assert
      expect(mockResume).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('should set candidateId on education and work experience models', async () => {
      // Arrange
      const mockSavedCandidate = createMockCandidate({ id: 123 });
      const mockCandidateInstance = {
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
        education: [],
        workExperience: [],
        resumes: [],
      };
      const mockEducationInstance = {
        save: jest.fn().mockResolvedValue(createMockEducation()),
        candidateId: undefined,
      };
      const mockWorkExperienceInstance = {
        save: jest.fn().mockResolvedValue(createMockWorkExperience()),
        candidateId: undefined,
      };

      mockValidateCandidateData.mockImplementation(() => {});
      mockCandidate.mockImplementation(() => mockCandidateInstance as any);
      mockEducation.mockImplementation(() => mockEducationInstance as any);
      mockWorkExperience.mockImplementation(
        () => mockWorkExperienceInstance as any,
      );

      // Act
      await addCandidate(mockCandidateData);

      // Assert
      expect(mockEducationInstance.candidateId).toBe(123);
      expect(mockWorkExperienceInstance.candidateId).toBe(123);
    });
  });
});
