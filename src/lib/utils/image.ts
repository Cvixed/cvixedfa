'use client';

import imageCompression from 'browser-image-compression';

/**
 * Compress image for receipt upload
 * Target: max 1024px width, WebP/JPEG, ≤ 1MB
 */
export async function compressReceiptImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: 0.8,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch {
    // Fallback: try JPEG if WebP fails
    const fallbackOptions = {
      ...options,
      fileType: 'image/jpeg' as const,
    };
    return imageCompression(file, fallbackOptions);
  }
}

/**
 * Convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB before compression

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format file harus JPEG, PNG, atau WebP' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 5MB' };
  }

  return { valid: true };
}
