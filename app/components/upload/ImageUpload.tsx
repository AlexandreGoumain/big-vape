"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onRemove = () => {
    onChange("");
  };

  if (value) {
    return (
      <div className="relative w-full h-60 rounded-md overflow-hidden border">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Image
          fill
          className="object-cover"
          alt="Product image"
          src={value}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <UploadDropzone
        endpoint="productImage"
        onClientUploadComplete={(res) => {
          if (res?.[0]?.url) {
            onChange(res[0].url);
          }
          setIsUploading(false);
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`Erreur d'upload: ${error.message}`);
          setIsUploading(false);
        }}
        onUploadBegin={() => {
          setIsUploading(true);
        }}
        disabled={disabled || isUploading}
        config={{ mode: "auto" }}
      />
    </div>
  );
}
