import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CompressionQueue } from "@/components/compression-queue"
import type { QueuedFile } from "@/lib/compression"

const completeFile: QueuedFile = {
  id: "photo-1",
  name: "photo.jpg",
  format: "jpeg",
  originalSize: 1_000_000,
  compressedSize: 580_000,
  progress: 100,
  savings: 42,
  outputUrl: "blob:http://localhost/output",
  status: "complete",
}

describe("CompressionQueue", () => {
  it("renders file sizes, progress, savings, and download action", () => {
    render(<CompressionQueue files={[completeFile]} onClear={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText("photo.jpg")).toBeInTheDocument()
    expect(screen.getByText("Original: 976.6 KB")).toBeInTheDocument()
    expect(screen.getByText("-42%")).toBeInTheDocument()
    expect(screen.getByText("566.4 KB")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    expect(screen.getByRole("button", { name: "Download photo.jpg" })).toBeEnabled()
  })

  it("calls remove and exposes the clear action", () => {
    const onRemove = vi.fn()
    render(<CompressionQueue files={[completeFile]} onClear={vi.fn()} onRemove={onRemove} />)

    const removeButtons = screen.getAllByRole("button", { name: "Remove photo.jpg" })
    fireEvent.click(removeButtons[removeButtons.length - 1])

    expect(onRemove).toHaveBeenCalledWith("photo-1")
    expect(screen.getAllByRole("button", { name: "Clear all" }).length).toBeGreaterThan(0)
  })
})
