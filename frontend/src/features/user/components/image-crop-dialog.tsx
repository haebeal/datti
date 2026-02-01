"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog as AriaDialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

type ImageCropDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

async function getCroppedImageBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const outputSize = 500;
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/webp",
      0.9,
    );
  });
}

export function ImageCropDialog({
  isOpen,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
    },
    [],
  );

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imgRef.current, completedCrop);
      onCropComplete(blob);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/50",
        "flex items-center justify-center",
        "p-4",
      )}
      isDismissable
    >
      <Modal
        className={cn(
          "w-full max-w-lg",
          "bg-white",
          "rounded-lg",
          "shadow-xl",
          "outline-none",
        )}
      >
        <AriaDialog
          className={cn("p-6", "flex flex-col gap-4", "outline-none")}
        >
          <h2 className={cn("text-xl font-bold")}>画像を調整</h2>

          <div className={cn("flex justify-center")}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className={cn("max-h-[60vh]")}
              />
            </ReactCrop>
          </div>

          <div className={cn("flex justify-end gap-3")}>
            <Button
              onPress={() => onOpenChange(false)}
              colorStyle="outline"
              color="primary"
              isDisabled={isProcessing}
            >
              キャンセル
            </Button>
            <Button
              onPress={handleConfirm}
              isDisabled={isProcessing || !completedCrop}
            >
              {isProcessing ? "処理中..." : "確定"}
            </Button>
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
