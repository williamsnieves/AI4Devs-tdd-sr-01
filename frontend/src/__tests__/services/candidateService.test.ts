import { uploadCV, sendCandidateData } from "../../services/candidateService";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CandidateService Unit Tests", () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadCV", () => {
    it("should upload CV file successfully", async () => {
      // Arrange
      const mockFile = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      const mockResponse = {
        data: {
          filePath: "/uploads/1234567890-resume.pdf",
          fileType: "application/pdf",
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await uploadCV(mockFile);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3010/upload",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Verify FormData contains the file
      const formData = mockedAxios.post.mock.calls[0][1] as FormData;
      expect(formData.get("file")).toBe(mockFile);

      expect(result).toEqual({
        filePath: "/uploads/1234567890-resume.pdf",
        fileType: "application/pdf",
      });
    });

    it("should create FormData correctly", async () => {
      // Arrange
      const mockFile = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      const mockResponse = {
        data: {
          filePath: "/uploads/resume.pdf",
          fileType: "application/pdf",
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      await uploadCV(mockFile);

      // Assert
      const formData = mockedAxios.post.mock.calls[0][1] as FormData;
      expect(formData.get("file")).toBe(mockFile);
    });

    // Parametrized test for different file types
    test.each([
      {
        description: "handle different file types (DOCX)",
        fileName: "resume.docx",
        fileType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        expectedResult: {
          filePath: "/uploads/resume.docx",
          fileType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      },
      {
        description: "handle different file types (PDF)",
        fileName: "resume.pdf",
        fileType: "application/pdf",
        expectedResult: {
          filePath: "/uploads/resume.pdf",
          fileType: "application/pdf",
        },
      },
      {
        description: "handle different file types (TXT)",
        fileName: "resume.txt",
        fileType: "text/plain",
        expectedResult: {
          filePath: "/uploads/resume.txt",
          fileType: "text/plain",
        },
      },
    ])(
      "should $description",
      async ({ fileName, fileType, expectedResult }) => {
        // Arrange
        const mockFile = new File(["test content"], fileName, {
          type: fileType,
        });
        const mockResponse = { data: expectedResult };
        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        // Act
        const result = await uploadCV(mockFile);

        // Assert
        expect(result).toEqual(expectedResult);
      }
    );

    // Parametrized test for error scenarios
    test.each([
      {
        description: "handle upload errors",
        error: {
          response: {
            data: "File too large",
          },
        },
        expectedErrorMessage: "Error al subir el archivo:",
      },
      {
        description: "handle network errors",
        error: new Error("Network error"),
        expectedErrorMessage: "Error al subir el archivo:",
      },
      {
        description: "handle server timeout errors",
        error: {
          response: {
            data: "Request timeout",
          },
        },
        expectedErrorMessage: "Error al subir el archivo:",
      },
    ])("should $description", async ({ error, expectedErrorMessage }) => {
      // Arrange
      const mockFile = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      mockedAxios.post.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(uploadCV(mockFile)).rejects.toThrow(expectedErrorMessage);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3010/upload",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });
  });

  describe("sendCandidateData", () => {
    it("should send candidate data successfully", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "612345678",
        address: "Calle Ejemplo 123",
        educations: [
          {
            institution: "Universidad de Madrid",
            title: "Ingeniería Informática",
            startDate: "2020-09-01",
            endDate: "2024-06-30",
          },
        ],
        workExperiences: [
          {
            company: "Tech Corp",
            position: "Software Developer",
            description: "Desarrollo de aplicaciones web",
            startDate: "2023-01-15",
            endDate: "2024-01-15",
          },
        ],
        cv: {
          filePath: "/uploads/1234567890-resume.pdf",
          fileType: "application/pdf",
        },
      };

      const mockResponse = {
        data: {
          message: "Candidate created successfully",
          candidate: { id: 1, ...mockCandidateData },
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await sendCandidateData(mockCandidateData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3010/candidates",
        mockCandidateData
      );
      expect(result).toEqual({
        message: "Candidate created successfully",
        candidate: { id: 1, ...mockCandidateData },
      });
    });

    // Parametrized test for different candidate data scenarios
    test.each([
      {
        description: "send candidate data without optional fields",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
        },
      },
      {
        description: "send candidate data with empty arrays",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "612345678",
          address: "Calle Ejemplo 123",
          educations: [],
          workExperiences: [],
          cv: null,
        },
      },
      {
        description: "handle multiple educations and work experiences",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "612345678",
          address: "Calle Ejemplo 123",
          educations: [
            {
              institution: "Universidad de Madrid",
              title: "Ingeniería Informática",
              startDate: "2020-09-01",
              endDate: "2024-06-30",
            },
            {
              institution: "Universidad Politécnica",
              title: "Máster en Desarrollo Web",
              startDate: "2024-09-01",
              endDate: "2025-06-30",
            },
          ],
          workExperiences: [
            {
              company: "Tech Corp",
              position: "Junior Developer",
              description: "Desarrollo de aplicaciones web",
              startDate: "2023-01-15",
              endDate: "2023-12-31",
            },
            {
              company: "Innovation Lab",
              position: "Senior Developer",
              description: "Liderazgo de proyectos técnicos",
              startDate: "2024-01-01",
              endDate: "2024-12-31",
            },
          ],
          cv: {
            filePath: "/uploads/1234567890-resume.pdf",
            fileType: "application/pdf",
          },
        },
      },
    ])("should $description", async ({ candidateData }) => {
      // Arrange
      const mockResponse = {
        data: {
          message: "Candidate created successfully",
          candidate: { id: 1, ...candidateData },
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await sendCandidateData(candidateData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3010/candidates",
        candidateData
      );
      expect(result).toEqual({
        message: "Candidate created successfully",
        candidate: { id: 1, ...candidateData },
      });
    });

    // Parametrized test for error scenarios
    test.each([
      {
        description: "handle validation errors",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "invalid-email",
          phone: "612345678",
          address: "Calle Ejemplo 123",
        },
        error: {
          response: {
            data: "Invalid email format",
          },
        },
        expectedErrorMessage: "Error al enviar datos del candidato:",
      },
      {
        description: "handle server errors",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "612345678",
          address: "Calle Ejemplo 123",
        },
        error: {
          response: {
            data: "Internal server error",
          },
        },
        expectedErrorMessage: "Error al enviar datos del candidato:",
      },
      {
        description: "handle network errors",
        candidateData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "612345678",
          address: "Calle Ejemplo 123",
        },
        error: new Error("Network error"),
        expectedErrorMessage: "Error al enviar datos del candidato:",
      },
    ])(
      "should $description",
      async ({ candidateData, error, expectedErrorMessage }) => {
        // Arrange
        mockedAxios.post.mockRejectedValueOnce(error);

        // Act & Assert
        await expect(sendCandidateData(candidateData)).rejects.toThrow(
          expectedErrorMessage
        );
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:3010/candidates",
          candidateData
        );
      }
    );
  });
});
