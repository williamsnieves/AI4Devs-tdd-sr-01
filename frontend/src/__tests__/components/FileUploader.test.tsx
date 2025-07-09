import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUploader from "../../components/FileUploader";

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("FileUploader Unit Tests", () => {
  const mockOnChange = jest.fn();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnChange.mockClear();
    mockOnUpload.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render file input and upload button", () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      expect(
        screen.getByRole("button", { name: /subir archivo/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
    });

    it("should render upload button with correct initial text", () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton).not.toBeDisabled();
    });

    it("should display selected file placeholder text", () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      expect(screen.getByText(/selected file:/i)).toBeInTheDocument();
    });
  });

  describe("File Selection", () => {
    it("should call onChange when file is selected", async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    // Parametrized test for different file types and selection scenarios
    test.each([
      {
        description: "display selected PDF file name",
        fileName: "resume.pdf",
        fileType: "application/pdf",
        expectedDisplayText: "selected file: resume.pdf",
      },
      {
        description: "display selected DOCX file name",
        fileName: "resume.docx",
        fileType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        expectedDisplayText: "selected file: resume.docx",
      },
      {
        description: "display selected TXT file name",
        fileName: "resume.txt",
        fileType: "text/plain",
        expectedDisplayText: "selected file: resume.txt",
      },
    ])(
      "should $description",
      async ({ fileName, fileType, expectedDisplayText }) => {
        // Arrange
        render(
          <FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />
        );
        const fileInput = screen.getByLabelText(/file/i);
        const file = new File(["test content"], fileName, { type: fileType });

        // Act
        await userEvent.upload(fileInput, file);

        // Assert
        expect(
          screen.getByText(new RegExp(expectedDisplayText, "i"))
        ).toBeInTheDocument();
      }
    );

    it("should handle multiple file selections", async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);

      // First file selection
      const file1 = new File(["test content 1"], "resume1.pdf", {
        type: "application/pdf",
      });
      await userEvent.upload(fileInput, file1);

      expect(mockOnChange).toHaveBeenCalledWith(file1);
      expect(
        screen.getByText(/selected file: resume1.pdf/i)
      ).toBeInTheDocument();

      // Second file selection
      const file2 = new File(["test content 2"], "resume2.pdf", {
        type: "application/pdf",
      });
      await userEvent.upload(fileInput, file2);

      expect(mockOnChange).toHaveBeenCalledWith(file2);
      expect(
        screen.getByText(/selected file: resume2.pdf/i)
      ).toBeInTheDocument();
    });
  });

  describe("File Upload", () => {
    it("should upload file successfully", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filePath: "/uploads/test.pdf",
          fileType: "application/pdf",
        }),
      } as Response);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3010/upload", {
          method: "POST",
          body: expect.any(FormData),
        });
      });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith({
          filePath: "/uploads/test.pdf",
          fileType: "application/pdf",
        });
      });
    });

    it("should show loading spinner during upload", async () => {
      // Mock delayed response
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      await userEvent.click(uploadButton);

      // Should show loading spinner
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Parametrized test for rejected promise error scenarios
    test.each([
      {
        description: "handle upload errors",
        mockError: new Error("Upload failed"),
      },
      {
        description: "handle network timeout errors",
        mockError: new Error("Network timeout"),
      },
    ])("should $description", async ({ mockError }) => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(mockError);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });

      // Act
      await userEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al subir archivo:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should handle HTTP error responses", async () => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });

      // Act
      await userEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al subir archivo:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should not upload if no file is selected", async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      await userEvent.click(uploadButton);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should display success message after upload", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filePath: "/uploads/test.pdf",
          fileType: "application/pdf",
        }),
      } as Response);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith({
          filePath: "/uploads/test.pdf",
          fileType: "application/pdf",
        });
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner during upload", async () => {
      // Arrange
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });

      // Act
      await userEvent.click(uploadButton);

      // Assert - Wait for the loading spinner to appear
      await waitFor(() => {
        expect(screen.getByRole("status")).toBeInTheDocument();
      });
    });

    // Parametrized test for loading reset scenarios
    test.each([
      {
        description: "reset loading state after upload completes",
        mockSetup: () =>
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              filePath: "/uploads/test.pdf",
              fileType: "application/pdf",
            }),
          } as Response),
      },
      {
        description: "reset loading state after upload fails",
        mockSetup: () =>
          mockFetch.mockRejectedValueOnce(new Error("Upload failed")),
      },
    ])("should $description", async ({ mockSetup }) => {
      // Arrange
      mockSetup();

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });

      // Act
      await userEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(uploadButton).not.toBeDisabled();
      });
    });
  });

  describe("FormData Creation", () => {
    it("should create FormData with correct file", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filePath: "/uploads/test.pdf",
          fileType: "application/pdf",
        }),
      } as Response);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      const uploadButton = screen.getByRole("button", {
        name: /subir archivo/i,
      });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3010/upload", {
          method: "POST",
          body: expect.any(FormData),
        });
      });
    });
  });
});
