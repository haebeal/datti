"use client";

import { useState, useRef } from "react";
import { cn } from "@/utils/cn";
import { ImageCropDialog } from "./image-crop-dialog";
import { compressImage } from "../lib/compress-image";
import { uploadAvatar } from "../actions/uploadAvatar";

type AvatarPickerProps = {
  currentAvatar: string;
  onAvatarChange: (url: string) => void;
  name: string;
  id: string;
};

export function AvatarPicker({
  currentAvatar,
  onAvatarChange,
  name,
  id,
}: AvatarPickerProps) {
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("JPG、PNG、WebP形式のみ対応しています");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsDialogOpen(true);
    };
    reader.readAsDataURL(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setIsUploading(true);
    setError(null);

    try {
      const compressedFile = await compressImage(blob);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const result = await uploadAvatar(formData);

      if (result.success) {
        setPreviewUrl(result.url);
        onAvatarChange(result.url);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setError("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2")}>
      <input type="hidden" name={name} id={id} value={previewUrl} />

      <div className={cn("flex items-center gap-4")}>
        <div
          className={cn(
            "w-20 h-20",
            "rounded-full",
            "overflow-hidden",
            "bg-gray-200",
            "flex items-center justify-center",
          )}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="アバター"
              className={cn("w-full h-full object-cover")}
            />
          ) : (
            <span className={cn("text-gray-400 text-2xl")}>?</span>
          )}
        </div>

        <div className={cn("flex flex-col gap-2")}>
          <label
            className={cn(
              "px-4 py-2",
              "bg-gray-100 hover:bg-gray-200",
              "rounded-md",
              "cursor-pointer",
              "text-sm font-medium",
              "transition-colors",
              isUploading && "opacity-50 cursor-not-allowed",
            )}
          >
            {isUploading ? "アップロード中..." : "画像を選択"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isUploading}
              className={cn("sr-only")}
            />
          </label>
        </div>
      </div>

      {error && <p className={cn("text-sm text-red-500")}>{error}</p>}

      {imageSrc && (
        <ImageCropDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          imageSrc={imageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
