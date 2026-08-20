import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompressionControls } from "@/components/compression-controls";
import { LocaleProvider } from "@/lib/i18n";

describe("CompressionControls", () => {
  it("shows the selected quality and exposes a slider thumb", () => {
    const onQualityChange = vi.fn();
    render(
      <LocaleProvider>
        <CompressionControls
          quality={80}
          scale={100}
          onQualityChange={onQualityChange}
          onScaleChange={vi.fn()}
        />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getAllByText("Advanced settings")[0]);
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="slider-thumb"]'),
    ).toBeInTheDocument();
  });

  it("renders balanced as the default preset", () => {
    render(
      <LocaleProvider>
        <CompressionControls
          quality={80}
          scale={100}
          onQualityChange={vi.fn()}
          onScaleChange={vi.fn()}
        />
      </LocaleProvider>,
    );

    expect(screen.getAllByRole("tab", { name: "Balanced" })[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
