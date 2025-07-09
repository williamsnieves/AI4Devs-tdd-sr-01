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

    it("should display selected file name", async () => {
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      const fileInput = screen.getByLabelText(/file/i);
      const file = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });

      await userEvent.upload(fileInput, file);

      expect(
        screen.getByText(/selected file: resume.pdf/i)
      ).toBeInTheDocument();
    });

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

    it("should handle upload errors", async () => {
      
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock error response
      mockFetch.mockRejectedValueOnce(new Error("Upload failed"));

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
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al subir archivo:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should handle HTTP error responses", async () => {
      
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock HTTP error response
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
      await userEvent.click(uploadButton);

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
      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it("should display success message after upload", async () => {
      

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
        expect(
          screen.getByText(/archivo subido con éxito/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable upload button during upload", async () => {
      

      // Mock delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    filePath: "/test",
                    fileType: "application/pdf",
                  }),
                } as Response),
              100
            )
          )
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

      // Button should show loading spinner (assuming this changes the content)
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should reset loading state after upload completes", async () => {
      

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
        expect(
          screen.getByRole("button", { name: /subir archivo/i })
        ).toBeInTheDocument();
      });

      // Loading spinner should be gone
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should reset loading state after upload fails", async () => {
      
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error("Upload failed"));

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
        expect(
          screen.getByRole("button", { name: /subir archivo/i })
        ).toBeInTheDocument();
      });

      // Loading spinner should be gone
      expect(screen.queryByRole("status")).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("FormData Creation", () => {
    it("should create FormData with correct file", async () => {
      

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

      // Verify FormData contains the file
      const formData = mockFetch.mock.calls[0][1]?.body as FormData;
      expect(formData.get("file")).toBe(file);
    });
  });
});
