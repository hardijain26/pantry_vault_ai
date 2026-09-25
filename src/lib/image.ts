/**
 * Shrink a photo or screenshot so it uploads fast and stays under the server's
 * size limit, while keeping bill text readable. Long order screenshots keep
 * their height (up to 4000 px) so every line stays legible.
 */
export async function prepareImage(file: File): Promise<{ base64: string; mimeType: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't open that image. Try a JPG or PNG."));
      el.src = url;
    });

    const scale = Math.min(1, 1400 / img.naturalWidth, 4000 / img.naturalHeight);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process the image.");
    ctx.fillStyle = "#ffffff"; // transparent PNG screenshots -> white, not black
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    let quality = 0.85;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    // Keep the upload under ~2.5 MB of base64.
    while (dataUrl.length > 2_500_000 && quality > 0.4) {
      quality -= 0.15;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    return { base64: dataUrl.split(",")[1], mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
