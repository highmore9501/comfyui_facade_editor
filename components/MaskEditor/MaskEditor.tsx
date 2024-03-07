import React from "react";
import { hexToRgb } from "@/utils/mask";
import {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";

interface MaskEditorProps {
  src: string;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement>;
  maskOpacity?: number;
  maskColor?: string;
  maskBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";
  handleImageRemove: (e: any) => void;
  handleToggleMaskEditor: (e: any) => void;
}

const MaskEditorDefaults = {
  className: "",
  maskOpacity: 0.75,
  maskColor: "#23272d",
  maskBlendMode: "normal",
};

const MaskEditor: React.FC<MaskEditorProps> = (props: MaskEditorProps) => {
  const src = props.src;
  const [cursorSize, setCursorSize] = React.useState(10);
  const maskColor = props.maskColor ?? MaskEditorDefaults.maskColor;
  const maskBlendMode = props.maskBlendMode ?? MaskEditorDefaults.maskBlendMode;
  const maskOpacity = props.maskOpacity ?? MaskEditorDefaults.maskOpacity;

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const maskCanvas = useRef<HTMLCanvasElement | null>(null);
  const cursorCanvas = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [maskContext, setMaskContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [cursorContext, setCursorContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<{ x: number; y: number }>({
    x: 256,
    y: 256,
  });

  useLayoutEffect(() => {
    if (canvas.current && !context) {
      const ctx = (canvas.current as HTMLCanvasElement).getContext("2d");
      setContext(ctx);
    }
  }, [canvas]);

  useLayoutEffect(() => {
    if (maskCanvas.current && !context) {
      const ctx = (maskCanvas.current as HTMLCanvasElement).getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size.x, size.y);
      }
      setMaskContext(ctx);
    }
  }, [maskCanvas]);

  useLayoutEffect(() => {
    if (cursorCanvas.current && !context) {
      const ctx = (cursorCanvas.current as HTMLCanvasElement).getContext("2d");
      setCursorContext(ctx);
    }
  }, [cursorCanvas]);

  useEffect(() => {
    if (src && context) {
      const img = new Image();
      img.onload = (evt) => {
        setSize({ x: img.width, y: img.height });
        context?.drawImage(img, 0, 0);
      };
      img.src = src;
    }
  }, [src, context, size]);

  // Pass mask canvas up
  useLayoutEffect(() => {
    if (props.canvasRef && maskCanvas.current) {
      props.canvasRef.current = maskCanvas.current;
    }
  }, [maskCanvas]);

  useEffect(() => {
    const listener = (evt: MouseEvent) => {
      if (cursorContext) {
        cursorContext.clearRect(0, 0, size.x, size.y);

        cursorContext.beginPath();
        cursorContext.fillStyle = `${maskColor}88`;
        cursorContext.strokeStyle = maskColor;
        cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        cursorContext.fill();
        cursorContext.stroke();
      }
      if (maskContext && evt.buttons > 0) {
        maskContext.beginPath();
        maskContext.fillStyle =
          evt.buttons > 1 || evt.shiftKey ? "#ffffff" : maskColor;
        maskContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        maskContext.fill();
      }
    };

    const scrollListener = (evt: WheelEvent) => {
      evt.preventDefault();
      if (cursorContext) {
        setCursorSize(Math.max(0, cursorSize + (evt.deltaY > 0 ? 1 : -1)));

        cursorContext.clearRect(0, 0, size.x, size.y);

        cursorContext.beginPath();
        cursorContext.fillStyle = `${maskColor}88`;
        cursorContext.strokeStyle = maskColor;
        cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        cursorContext.fill();
        cursorContext.stroke();

        evt.stopPropagation();
        evt.preventDefault();
      }
    };

    cursorCanvas.current?.addEventListener("mousemove", listener);
    cursorCanvas.current?.addEventListener("wheel", scrollListener);

    return () => {
      cursorCanvas.current?.removeEventListener("mousemove", listener);
      cursorCanvas.current?.removeEventListener("wheel", scrollListener);
    };
  }, [cursorContext, maskContext, cursorCanvas, cursorSize, maskColor, size]);

  const replaceMaskColor = useCallback(
    (hexColor: string, invert: boolean) => {
      const imageData = maskContext?.getImageData(0, 0, size.x, size.y);
      const color = hexToRgb(hexColor);
      if (imageData && color) {
        for (var i = 0; i < imageData?.data.length; i += 4) {
          const pixelColor =
            (imageData.data[i] === 255) != invert ? [255, 255, 255] : color;
          imageData.data[i] = pixelColor[0];
          imageData.data[i + 1] = pixelColor[1];
          imageData.data[i + 2] = pixelColor[2];
          imageData.data[i + 3] = imageData.data[i + 3];
        }
        maskContext?.putImageData(imageData, 0, 0);
      }
    },
    [maskContext]
  );
  useEffect(() => replaceMaskColor(maskColor, false), [maskColor]);

  // 点击时撤销上次画笔生成的mask
  const handleCancel = (e: any) => {
    e.preventDefault();
    if (maskContext) {
      maskContext.clearRect(0, 0, size.x, size.y);
    }
  };

  // 点击时保存mask
  const handleSave = (e: any) => {
    e.preventDefault();
    if (maskCanvas.current && maskContext) {
      const mask = maskCanvas.current.toDataURL("image/png");
      // 这里已经生成了base64格式的mask，然后需要把它上传到comfyUI服务器，拿到返回的mask的url，同时填充到form里对应的位置
      console.log(mask);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-90 bg-black react-mask-editor-outer">
      <div
        className="react-mask-editor-inner"
        style={{
          width: size.x,
          height: size.y,
        }}
      >
        <canvas
          ref={canvas}
          style={{
            width: size.x,
            height: size.y,
          }}
          width={size.x}
          height={size.y}
          className="react-mask-editor-base-canvas"
        />
        <canvas
          ref={maskCanvas}
          width={size.x}
          height={size.y}
          style={{
            width: size.x,
            height: size.y,
            opacity: maskOpacity,
            mixBlendMode: maskBlendMode as any,
          }}
          className="react-mask-editor-mask-canvas"
        />
        <canvas
          ref={cursorCanvas}
          width={size.x}
          height={size.y}
          style={{
            width: size.x,
            height: size.y,
          }}
          className="react-mask-editor-cursor-canvas"
        />
        <button
          className="absolute top-2 right-2 bg-opacity-60 bg-white text-red-500 rounded-xl p-1 z-51"
          onClick={props.handleImageRemove}
        >
          x
        </button>
        <button
          className="absolute top-2 left-2 bg-opacity-60 bg-white text-red-500 rounded-xl p-1 z-51"
          onClick={props.handleToggleMaskEditor}
        >
          M
        </button>
        <button
          className="absolute top-12 left-2 bg-opacity-60 bg-white text-red-500 rounded-xl p-1 z-51"
          onClick={handleCancel}
        >
          C
        </button>
        <button
          className="absolute top-18 left-2 bg-opacity-60 bg-white text-red-500 rounded-xl p-1 z-51"
          onClick={handleSave}
        >
          S
        </button>
      </div>
    </div>
  );
};

export default MaskEditor;
