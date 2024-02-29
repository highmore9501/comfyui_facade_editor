"use client";
import React, { useState } from "react";
import { uploadImage } from "../../utils/comfyui";

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

          const host = `${process.env.SERVER_ADDRESS}:8188`;
          console.log(host);
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

  return (
    <div
      className="text-3xl p-2 from-background rounded-xl border-4 border-dashed border-primary-500 text-primary-500 text-center"
      id="drop_zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      拖图片到这里
      {image && <img src={image} alt="Uploaded" />}
    </div>
  );
};

export default ImageUpload;
