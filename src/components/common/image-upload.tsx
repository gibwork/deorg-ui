"use client";

import React, { useState, useCallback, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import Link from "next/link";
import { AxiosProgressEvent } from "axios";
import { ImageUp, X } from "lucide-react";
import { Icons } from "../icons";

interface ImageUploadProps {
  onUploadComplete: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  // FileList is immutable, so we need to create a new one
  const dataTransfer = new DataTransfer();

  // Add newly uploaded images
  Array.from(event.target.files!).forEach((image) =>
    dataTransfer.items.add(image)
  );

  const files = dataTransfer.files;
  const displayUrl = URL.createObjectURL(event.target.files![0]!);

  return { files, displayUrl };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percentage = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setProgress(percentage);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const image = event.target.files[0];
      const { files, displayUrl } = getImageData(event);
      setSelectedImage(displayUrl);
    }
  };

  const removeSelectedImage = () => {
    setLoading(false);
    setUploadedImagePath(null);
    setSelectedImage(null);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = [...selectedImages, ...acceptedFiles].slice(
        0,
        maxFiles
      );
      setSelectedImages(newImages);
      onUploadComplete(newImages);
    },
    [selectedImages, maxFiles, onUploadComplete]
  );
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize,
    maxFiles: maxFiles - selectedImages.length,
    noClick: true, // Disable click on the root element
  });

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    onUploadComplete(newImages);
  };

  return (
    <div className="space-y-3 h-full">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className="border-2 border-dashed  rounded-lg p-4 text-center"
        >
          <input
            disabled={selectedImages.length >= maxFiles}
            {...getInputProps()}
          />
          <ImageUp className="mx-auto mb-2" size={24} />
          <p className="text-sm text-gray-600 mb-2">
            Drag & drop images here, or click the button below to select files
          </p>
          <Button
            type="button"
            onClick={open}
            disabled={selectedImages.length >= maxFiles}
            className="mx-auto h-8"
          >
            Select Files
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
          </p>
        </div>

        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Selected image ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-24 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5"
                  onClick={() => removeImage(index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
