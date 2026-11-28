import { Bucket, uniquePath } from "@upstash/blob";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

let cachedBucket = null;

export function isUpstashBlobConfigured() {
  return Boolean(process.env.UPSTASH_BLOB_TOKEN && process.env.UPSTASH_BLOB_TOKEN.trim());
}

export function getBlobBucket() {
  if (!isUpstashBlobConfigured()) return null;
  if (!cachedBucket) {
    cachedBucket = Bucket.fromEnv();
  }
  return cachedBucket;
}

function sanitizeFileName(fileName = "document.pdf") {
  const base = String(fileName)
    .replace(/[/\\]/g, "_")
    .replace(/\.\./g, "")
    .trim();
  const safe = base || "document.pdf";
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
}

function isOwnedBlobPath(blobPath, userId) {
  if (typeof blobPath !== "string" || !userId) return false;
  if (blobPath.includes("..")) return false;
  return blobPath.startsWith(`quiz-pdfs/${userId}/`);
}

export async function createSignedPdfUpload({ userId, fileName, size }) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_PDF_BYTES) {
    const err = new Error("PDF file must be non-empty and under 10 MB.");
    err.status = 400;
    err.code = "INVALID_PDF";
    throw err;
  }

  const bucket = getBlobBucket();
  if (!bucket) {
    return { configured: false };
  }

  const safeName = sanitizeFileName(fileName);
  const blobPath = uniquePath(`quiz-pdfs/${userId}/${safeName}`);
  const signed = await bucket.signedUploadUrl(blobPath, {
    contentType: "application/pdf",
    size,
    expiresIn: "5m",
  });

  return {
    configured: true,
    uploadUrl: signed.url,
    headers: signed.headers,
    blobPath,
    expiresAt: signed.expiresAt,
  };
}

export async function readPdfBase64FromBlob(blobPath, userId) {
  if (!isOwnedBlobPath(blobPath, userId)) {
    const err = new Error("Invalid PDF storage path.");
    err.status = 403;
    err.code = "FORBIDDEN_BLOB_PATH";
    throw err;
  }

  const bucket = getBlobBucket();
  if (!bucket) {
    const err = new Error("Upstash Blob storage is not configured.");
    err.status = 503;
    err.code = "BLOB_NOT_CONFIGURED";
    throw err;
  }

  const record = await bucket.get(blobPath);
  const arrayBuffer = await new Response(record.body).arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function deleteBlobSafe(blobPath, userId) {
  if (!blobPath || !isOwnedBlobPath(blobPath, userId)) return;
  const bucket = getBlobBucket();
  if (!bucket) return;
  try {
    await bucket.del(blobPath);
  } catch {
    // Non-fatal cleanup
  }
}
