import imageCompression from "browser-image-compression";

type CompressOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
};

const DEFAULT_OPTIONS: CompressOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 500,
};

export async function compressImage(
  blob: Blob,
  options: CompressOptions = {},
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const file = new File([blob], "avatar.webp", { type: blob.type });

  const compressedFile = await imageCompression(file, {
    maxSizeMB: mergedOptions.maxSizeMB,
    maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/webp",
  });

  return compressedFile;
}
