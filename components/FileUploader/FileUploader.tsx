"use client";
import React, { useState } from "react";
import { uploadImage } from "../../utils/comfyui";
import Image from "next/image";
import ReactPlayer from "react-player";

type Props = {
  onFileloaded: (value: string) => void;
};

const FileUploader: React.FC<Props> = ({ onFileloaded }) => {
  const [uploadedFile, setuploadedFile] = useState("");
  const [fileType, setFileType] = useState("");

  const handleDrop = async (e: any) => {
    e.preventDefault();

    if (e.dataTransfer.items) {
      for (var i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === "file") {
          const file = e.dataTransfer.items[i].getAsFile();
          setFileType(file.type);
          if (!file) return;

          const host = process.env.NEXT_PUBLIC_SERVER_ADDRESS as string;
          const imageName = await uploadImage(host, file);

          if (!imageName || imageName == "") return;
          const currentImage = URL.createObjectURL(file);
          setuploadedFile(currentImage);
          onFileloaded(imageName);
        }
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleImageRemove = () => {
    setuploadedFile("");
    onFileloaded("");
  };

  return (
    <div
      className="flex flex-col text-md m-2 from-background rounded-xl border-4 border-dashed border-primary-500 text-primary-500 items-center justify-center"
      id="drop_zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {uploadedFile && fileType == "image/jpeg" ? (
        <div className="relative">
          <Image
            src={uploadedFile}
            alt="Uploaded"
            width={400}
            height={400}
            className="rounded-xl relative"
          ></Image>
          <button
            className="absolute top-2 right-2 bg-white text-red-500 rounded-xl p-1"
            onClick={handleImageRemove}
          >
            x
          </button>
        </div>
      ) : uploadedFile && fileType == "video/mp4" ? (
        <div className="relative">
          <ReactPlayer
            url={uploadedFile}
            width={400}
            controls={true}
            playing={false}
          />
          <button
            className="absolute top-2 right-2 bg-white text-red-500 rounded-xl px-2"
            onClick={handleImageRemove}
          >
            x
          </button>
        </div>
      ) : (
        <div className="h-[250px] flex flex-col justify-center space-y-4">
          <p>上传的文件</p>
          <p>拖到到这里</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
