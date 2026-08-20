import { describe, expect, it } from "vitest"

import { fileFormat, formatBytes, imageFormat } from "@/lib/compression"

describe("compression helpers", () => {
  it("formats byte counts for queue labels", () => {
    expect(formatBytes(0)).toBe("0 B")
    expect(formatBytes(1024)).toBe("1.0 KB")
    expect(formatBytes(1_000_000)).toBe("976.6 KB")
  })

  it("detects image formats from MIME types and extensions", () => {
    expect(imageFormat(new File([], "photo.jpg", { type: "image/jpeg" }))).toBe("jpeg")
    expect(imageFormat(new File([], "graphic.PNG"))).toBe("png")
    expect(imageFormat(new File([], "animation.webp"))).toBe("webp")
  })

  it("detects supported document and video formats", () => {
    expect(fileFormat(new File([], "document.pdf", { type: "application/pdf" }))).toBe("pdf")
    expect(fileFormat(new File([], "clip.mp4", { type: "video/mp4" }))).toBe("mp4")
  })
})
