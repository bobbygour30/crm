// src/components/lob/uploadUtils.js
// ============================================================
// The backend runs on Vercel, which refuses any request over 4.5 MB. Vercel rejects it
// before the app runs, so the browser only reports "Failed to fetch".
//   prepareUpload()      shrinks photos in the browser and stops oversize uploads BEFORE sending
//   uploadErrorMessage() turns network failures into a message people can act on
// ============================================================
export const MAX_REQUEST_BYTES = Math.floor(4.2 * 1024 * 1024); // 4.5 MB limit minus form overhead
const COMPRESS_ABOVE = 500 * 1024; // photos smaller than this are sent as they are
const IMAGE_MAX_SIDE = 1600;       // px — plenty for RC / Aadhaar / invoice photos
const JPEG_QUALITY = 0.72;

export class UploadTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadTooLargeError";
  }
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable image")); };
    img.src = url;
  });

/** Re-encodes a large photo as a smaller JPEG; returns the original when it can't help */
export const compressImage = async (file) => {
  if (!(file instanceof File) || !/^image\//.test(file.type) || file.type === "image/gif" || file.size <= COMPRESS_ABOVE) return file;
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // transparent PNGs get a white page, not black
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file; // e.g. HEIC photos the browser can't draw — send unchanged
  }
};

/**
 * Shrinks the photos in a FormData and checks the total size.
 * @throws UploadTooLargeError when it would still be over the server's limit
 */
export const prepareUpload = async (fd) => {
  const out = new FormData();
  let total = 0;
  const files = [];
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) {
      const f = await compressImage(value);
      out.append(key, f, f.name);
      total += f.size;
      files.push(f);
    } else {
      out.append(key, value);
      total += String(value).length;
    }
  }
  if (total > MAX_REQUEST_BYTES) {
    const biggest = files.sort((a, b) => b.size - a.size).slice(0, 3).map((f) => `${f.name} (${mb(f.size)})`).join(", ");
    throw new UploadTooLargeError(
      `The files are too large to send together (${mb(total)}; the limit is about 4 MB). Nothing was saved. ` +
      `Largest: ${biggest}. Use smaller PDFs or photos, or save now and upload the remaining files in a second save.`
    );
  }
  return out;
};

/** Message for a failed save */
export const uploadErrorMessage = (err) => {
  if (err && err.name === "UploadTooLargeError") return err.message;
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(String(err && err.message))) {
    return "Couldn't reach the server — nothing was saved. This usually means the files were too large to send together (over about 4 MB) or the internet connection dropped. Try again with smaller files, or check the connection.";
  }
  return "Error: " + (err && err.message ? err.message : String(err));
};
