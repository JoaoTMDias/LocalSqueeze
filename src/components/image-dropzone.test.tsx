import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ImageDropzone } from "@/components/image-dropzone"

describe("ImageDropzone", () => {
  it("renders the supported image formats and native file input", () => {
    render(<ImageDropzone onFilesSelected={vi.fn()} />)

    expect(screen.getByText("Drop files here")).toBeInTheDocument()
    expect(screen.getByText(".JPG")).toBeInTheDocument()
    expect(screen.getByText(".PNG")).toBeInTheDocument()
    expect(screen.getByText(".WEBP")).toBeInTheDocument()
    expect(screen.getByText(".SVG")).toBeInTheDocument()
    expect(screen.getByLabelText("File picker")).toHaveAttribute("accept", "image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp,image/svg+xml,.svg,application/pdf,.pdf,video/mp4,.mp4")
  })
})
