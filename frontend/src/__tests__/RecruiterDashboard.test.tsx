import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RecruiterDashboard from "../components/RecruiterDashboard";

// Mock del componente para evitar problemas con assets
jest.mock("../assets/lti-logo.png", () => "test-logo.png");

describe("RecruiterDashboard Component", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("renders dashboard title correctly", () => {
    renderWithRouter(<RecruiterDashboard />);

    const titleElement = screen.getByText(/Dashboard del Reclutador/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("renders add candidate button", () => {
    renderWithRouter(<RecruiterDashboard />);

    const addButton = screen.getByText(/Añadir Nuevo Candidato/i);
    expect(addButton).toBeInTheDocument();
  });

  it("renders add candidate section title", () => {
    renderWithRouter(<RecruiterDashboard />);

    const sectionTitle = screen.getByText(/Añadir Candidato/i);
    expect(sectionTitle).toBeInTheDocument();
  });

  it("contains link to add-candidate route", () => {
    renderWithRouter(<RecruiterDashboard />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/add-candidate");
  });

  it("renders LTI logo", () => {
    renderWithRouter(<RecruiterDashboard />);

    const logo = screen.getByAltText(/LTI Logo/i);
    expect(logo).toBeInTheDocument();
  });
});
