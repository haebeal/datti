import imageCompression from "browser-image-compression";

type CompressOptions = {
	maxSizeMB?: number;
	maxWidthOrHeight?: number;
};

const DEFAULT_OPTIONS: Required<CompressOptions> = {
	maxSizeMB: 1,
	maxWidthOrHeight: 500,
};

export async function compressImage(
	blob: Blob,
	options: CompressOptions = {},
): Promise<File> {
	const merged = { ...DEFAULT_OPTIONS, ...options };
	const file = new File([blob], "avatar.webp", { type: blob.type });
	return imageCompression(file, {
		maxSizeMB: merged.maxSizeMB,
		maxWidthOrHeight: merged.maxWidthOrHeight,
		useWebWorker: true,
		fileType: "image/webp",
	});
}
