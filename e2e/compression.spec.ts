import { expect, test } from "@playwright/test"

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
)

test.describe("LocalSqueeze compression workflow", () => {
  test("compresses a PNG in the production browser build", async ({ page }) => {
    const progressValues: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") throw new Error(message.text())
    })

    await page.goto("/")
    const filePicker = page.getByLabel("File picker")
    await expect(filePicker).toBeAttached()
    await expect(page.getByText("Drop files here")).toBeVisible()

    await filePicker.setInputFiles({
      name: "smoke.png",
      mimeType: "image/png",
      buffer: onePixelPng,
    })

    await expect(page.locator("p.truncate", { hasText: "smoke.png" })).toBeVisible()
    await expect.poll(async () => {
      const text = await page.locator("body").innerText()
      const match = text.match(/(\d+)%/)
      if (match) progressValues.push(match[1])
      return text.includes("Complete")
    }, { timeout: 30_000 }).toBe(true)

    await expect(page.getByRole("button", { name: "Download smoke.png" })).toBeEnabled()
    expect(progressValues.length).toBeGreaterThan(0)
  })

  test("keeps advanced settings optional and exposes scale choices", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Advanced settings")).toBeVisible()
    await expect(page.getByText("80%")).toHaveCount(0)

    await page.getByRole("button", { name: "Advanced settings" }).click()
    await expect(page.getByText("80%")).toBeVisible()
    await page.getByLabel("Dimension scaling").click()
    await expect(page.getByRole("option", { name: "75%" })).toBeVisible()
    await expect(page.getByRole("option", { name: "50%" })).toBeVisible()
  })
})
