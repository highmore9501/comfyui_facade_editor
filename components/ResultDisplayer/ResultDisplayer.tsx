import React from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { MdFileDownload } from "react-icons/md";
import { useState } from "react";

type Props = {
  results: Blob[];
  status: string;
};

const ResultDisplayer: React.FC<Props> = ({ results, status }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const handleImageClick = (index: number) => {
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null); // 如果点击的是已经放大的图片，那么清除选中的图片索引
    } else {
      setSelectedImageIndex(index); // 否则，设置选中的图片索引为点击的图片的索引
    }
  };
  return (
    <div className="min-h-[400px] m-2 p-2 justify-center items-center rounded-2xl border-4 border-dashed border-primary-500">
      {results.length > 0 && (
        <div className="flex flex-warp gap-4">
          {results.map((blob, index) => {
            const resultType = blob.type;
            const url = URL.createObjectURL(blob);
            if (resultType == "image/png" || !resultType) {
              if (selectedImageIndex === null || selectedImageIndex === index) {
                return (
                  <div
                    key={index}
                    className="rounded-xl mx-1 relative "
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      key={index}
                      src={url}
                      alt="result"
                      width={300}
                      height={300}
                      className="rounded-xl mx-1 auto-dimensions"
                    />
                    <a
                      href={url}
                      download={`result_${index}.png`}
                      className="absolute bottom-2 right-2 opacity-75"
                    >
                      <MdFileDownload size={40} color="#cf0000" />
                    </a>
                  </div>
                );
              } else {
                return null;
              }
            } else if (resultType == "video/h264-mp4") {
              return (
                <ReactPlayer
                  key={index}
                  url={url}
                  width={400}
                  controls={true}
                  playing={false}
                  className="rounded-xl mx-1"
                />
              );
            }
          })}
        </div>
      )}
      {results.length == 0 && (
        <div className="mt-auto text-center">
          {status.split("|").map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultDisplayer;
