"use client";
import React, { useState } from "react";
import { uploadImage } from "../../utils/comfyui";
import Image from "next/image";

type UploadImageProps = {
  onImageUpload: (value: string) => void;
};

const ImageUpload = ({ onImageUpload }: UploadImageProps) => {
  const [image, setImage] = useState("");

  const handleDrop = async (e: any) => {
    e.preventDefault();

    if (e.dataTransfer.items) {
      for (var i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === "file") {
          const file = e.dataTransfer.items[i].getAsFile();

          if (!file) return;

          const host = process.env.NEXT_PUBLIC_SERVER_ADDRESS as string;
          const imageName = await uploadImage(host, file);

          if (!imageName || imageName == "") return;
          const currentImage = URL.createObjectURL(file);
          setImage(currentImage);
          onImageUpload(imageName);
        }
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleImageRemove = () => {
    setImage("");
    onImageUpload("");
  };

  return (
    <div
      className="text-md m-2 from-background rounded-xl border-4 border-dashed border-primary-500 text-primary-500 text-center items-center justify-center"
      id="drop_zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {image ? (
        <div className="relative">
          <Image
            src={image}
            alt="Uploaded"
            width={500}
            height={500}
            className="rounded-xl"
          />
          <button
            className="absolute top-2 right-2 bg-white text-red-500 rounded-xl p-1"
            onClick={handleImageRemove}
          >
            x
          </button>
        </div>
      ) : (
        <div className="h-[250px] flex flex-col justify-center space-y-4">
          <p>要上传的图片文件</p>
          <p>拖到到这里</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
