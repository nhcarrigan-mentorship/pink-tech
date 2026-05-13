import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

type Options = RenderOptions & {
  route?: string;
};

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...renderOptions }: Options = {},
) {
  return render(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>,
    renderOptions,
  );
}
