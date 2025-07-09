import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddCandidateForm from "../../components/AddCandidateForm";

// Mock fetch
global.fetch = jest.fn();

// Mock FileUploader component
jest.mock("../../components/FileUploader", () => {
  return function MockFileUploader({ onChange, onUpload }: any) {
    return (
      <div data-testid="file-uploader">
        <input
          type="file"
          data-testid="file-input"
          onChange={(e) => onChange(e.target.files?.[0])}
        />
        <button
          data-testid="upload-button"
          onClick={() =>
            onUpload({ filePath: "/test/path", fileType: "application/pdf" })
          }
        >
          Upload
        </button>
      </div>
    );
  };
});

// Mock react-datepicker
jest.mock("react-datepicker", () => {
  return function MockDatePicker({
    onChange,
    selected,
    dateFormat,
    placeholderText,
    ...props
  }: any) {
    return (
      <input
        type="date"
        data-testid="date-picker"
        value={selected ? selected.toISOString().split("T")[0] : ""}
        onChange={(e) => onChange(new Date(e.target.value))}
        placeholder={placeholderText}
        {...props}
      />
    );
  };
});

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("AddCandidateForm Unit Tests", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render all required form fields", () => {
      render(<AddCandidateForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /enviar/i })
      ).toBeInTheDocument();
    });

    it("should render page title", () => {
      render(<AddCandidateForm />);

      expect(screen.getByText(/agregar candidato/i)).toBeInTheDocument();
    });

    it("should render education section with add button", () => {
      render(<AddCandidateForm />);

      expect(screen.getByText(/educación/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /añadir educación/i })
      ).toBeInTheDocument();
    });

    it("should render work experience section with add button", () => {
      render(<AddCandidateForm />);

      expect(screen.getByText(/experiencia laboral/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /añadir experiencia laboral/i })
      ).toBeInTheDocument();
    });

    it("should render file uploader component", () => {
      render(<AddCandidateForm />);

      expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    });
  });

  describe("Form Input Handling", () => {
    it("should update candidate basic information", () => {
      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(
        /nombre/i
      ) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(
        /apellido/i
      ) as HTMLInputElement;
      const emailInput = screen.getByLabelText(
        /correo electrónico/i
      ) as HTMLInputElement;

      fireEvent.change(firstNameInput, { target: { value: "Juan" } });
      fireEvent.change(lastNameInput, { target: { value: "Pérez" } });
      fireEvent.change(emailInput, {
        target: { value: "juan.perez@example.com" },
      });

      expect(firstNameInput.value).toBe("Juan");
      expect(lastNameInput.value).toBe("Pérez");
      expect(emailInput.value).toBe("juan.perez@example.com");
    });

    it("should update optional fields", () => {
      render(<AddCandidateForm />);

      const phoneInput = screen.getByLabelText(/teléfono/i) as HTMLInputElement;
      const addressInput = screen.getByLabelText(
        /dirección/i
      ) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: "612345678" } });
      fireEvent.change(addressInput, {
        target: { value: "Calle Ejemplo 123" },
      });

      expect(phoneInput.value).toBe("612345678");
      expect(addressInput.value).toBe("Calle Ejemplo 123");
    });
  });

  describe("Dynamic Sections", () => {
    describe("Education Section", () => {
      it("should add education entry when add button is clicked", () => {
        render(<AddCandidateForm />);

        const addEducationBtn = screen.getByRole("button", {
          name: /añadir educación/i,
        });
        fireEvent.click(addEducationBtn);

        // Should render education fields after clicking
        expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/título/i)).toBeInTheDocument();
      });
    });

    describe("Work Experience Section", () => {
      it("should add work experience entry when add button is clicked", () => {
        render(<AddCandidateForm />);

        const addExperienceBtn = screen.getByRole("button", {
          name: /añadir experiencia laboral/i,
        });
        fireEvent.click(addExperienceBtn);

        // Should render work experience fields after clicking
        expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/puesto/i)).toBeInTheDocument();
        expect(screen.getAllByTestId("date-picker")).toHaveLength(2); // Check for date fields
      });
    });
  });

  describe("File Upload Integration", () => {
    it("should handle file upload", () => {
      render(<AddCandidateForm />);

      const uploadButton = screen.getByTestId("upload-button");
      fireEvent.click(uploadButton);

      // File upload component should be rendered
      expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        status: 201,
        ok: true,
        json: async () => ({ message: "Success" }),
      } as Response);

      render(<AddCandidateForm />);

      // Fill required fields
      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);

      fireEvent.change(firstNameInput, { target: { value: "Juan" } });
      fireEvent.change(lastNameInput, { target: { value: "Pérez" } });
      fireEvent.change(emailInput, {
        target: { value: "juan.perez@example.com" },
      });

      // Submit form
      const submitBtn = screen.getByRole("button", { name: /enviar/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3010/candidates",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: expect.stringContaining("Juan"),
          }
        );
      });
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<AddCandidateForm />);

      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);

      fireEvent.change(firstNameInput, { target: { value: "Juan" } });
      fireEvent.change(lastNameInput, { target: { value: "Pérez" } });
      fireEvent.change(emailInput, {
        target: { value: "juan.perez@example.com" },
      });

      const submitBtn = screen.getByRole("button", { name: /enviar/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/error al añadir candidato/i)
        ).toBeInTheDocument();
      });
    });
  });
});
