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

    it("should handle upload errors", async () => {
      // Arrange
      const mockFile = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      const mockError = {
        response: {
          data: "File too large",
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(uploadCV(mockFile)).rejects.toThrow(
        "Error al subir el archivo:"
      );
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

    it("should handle network errors", async () => {
      // Arrange
      const mockFile = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(uploadCV(mockFile)).rejects.toThrow(
        "Error al subir el archivo:"
      );
    });

    it("should handle different file types", async () => {
      // Arrange
      const mockFile = new File(["test content"], "resume.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const mockResponse = {
        data: {
          filePath: "/uploads/resume.docx",
          fileType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await uploadCV(mockFile);

      // Assert
      expect(result).toEqual({
        filePath: "/uploads/resume.docx",
        fileType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
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

    it("should handle validation errors", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "invalid-email",
        phone: "612345678",
        address: "Calle Ejemplo 123",
      };

      const mockError = {
        response: {
          data: "Invalid email format",
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(sendCandidateData(mockCandidateData)).rejects.toThrow(
        "Error al enviar datos del candidato:"
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3010/candidates",
        mockCandidateData
      );
    });

    it("should handle server errors", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "612345678",
        address: "Calle Ejemplo 123",
      };

      const mockError = {
        response: {
          data: "Internal server error",
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(sendCandidateData(mockCandidateData)).rejects.toThrow(
        "Error al enviar datos del candidato:"
      );
    });

    it("should handle network errors", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "612345678",
        address: "Calle Ejemplo 123",
      };

      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(sendCandidateData(mockCandidateData)).rejects.toThrow(
        "Error al enviar datos del candidato:"
      );
    });

    it("should send candidate data without optional fields", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
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

    it("should send candidate data with empty arrays", async () => {
      // Arrange
      const mockCandidateData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "612345678",
        address: "Calle Ejemplo 123",
        educations: [],
        workExperiences: [],
        cv: null,
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

    it("should handle multiple educations and work experiences", async () => {
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
  });
});
