"use client";
import React, { useState } from "react";
import { uploadImage } from "../../utils/comfyui";
import Image from "next/image";
import ReactPlayer from "react-player";
import MaskEditor from "../MaskEditor/MaskEditor";
import { useIntl } from "react-intl";

type Props = {
  onFileloaded: (value: string) => void;
};

const FileUploader: React.FC<Props> = ({ onFileloaded }) => {
  const intl = useIntl();
  // 界面显示的图片，它可能会在蒙版编辑以后发生变化
  const [displaySrc, setDisplaySrc] = useState("");
  // 上传以后显示的图片，它只在上传文件时发生变化
  const [originalSrc, setOriginalSrc] = useState("");
  const [fileType, setFileType] = useState("");
  const [showMaskEditor, setShowMaskEditor] = useState(false);
  // 上传完文件以后，从服务器拿到的图片地址，是以服务器为根目录的相对地址
  const [image, setImage] = useState("");

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
          setDisplaySrc(currentImage);
          setOriginalSrc(currentImage);
          // 向表单更新图片的url
          onFileloaded(imageName);
          // 向蒙版编辑器更新图片的url
          setImage(imageName);
        }
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleImageRemove = () => {
    setDisplaySrc("");
    onFileloaded("");
    setShowMaskEditor(false);
  };

  const handleToggleMaskEditor = (e: any) => {
    e.preventDefault();
    setShowMaskEditor(!showMaskEditor);
  };

  return (
    <div
      className="flex flex-col text-md m-2 from-background rounded-xl border-4 border-dashed border-primary-500 text-primary-500 items-center justify-center"
      id="drop_zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {displaySrc && (fileType == "image/jpeg" || fileType == "image/png") ? (
        !showMaskEditor ? (
          <div className="relative flex justify-center items-center">
            <Image
              src={displaySrc}
              alt="Uploaded"
              width={400}
              height={400}
              className="rounded-xl relative"
            />
            <button
              className="absolute top-2 right-2 bg-white text-red-500 rounded-xl p-1 z-51"
              onClick={handleImageRemove}
            >
              x
            </button>
            <button
              className="absolute top-2 left-2 bg-white text-red-500 rounded-xl p-1 z-51"
              onClick={handleToggleMaskEditor}
            >
              M
            </button>
          </div>
        ) : (
          <MaskEditor
            src={displaySrc.startsWith("blob") ? displaySrc : originalSrc}
            refImage={image}
            handleImageRemove={handleImageRemove}
            handleToggleMaskEditor={handleToggleMaskEditor}
            onFileloaded={onFileloaded}
            setDisplaySrc={setDisplaySrc}
          />
        )
      ) : displaySrc && fileType == "video/mp4" ? (
        <div className="relative">
          <ReactPlayer
            url={displaySrc}
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
          <p>
            {intl.formatMessage({
              id: "components.FileUploader.description",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
