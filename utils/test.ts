import WebSocket from "ws";
import {
  uploadImage,
  checkImageExsit,
  parseName,
  handleWhitespace,
  getImages,
  saveImages,
} from "./comfyui";
import { exit } from "process";
import { randomInt, randomUUID } from "crypto";

const client_id = randomUUID();
const server_address = "192.168.31.99:8188";
const conn = new WebSocket(`ws://${server_address}/ws?clientId=${client_id}`);
const batch_size = 4;
const originalImag =
  "https://pics.dmm.co.jp/digital/video/1start021/1start021jp-19.jpg";
const prompt_string = "(loli:1.5),(flat chest:1.5),big ass,";

const image_url = uploadImage(server_address, originalImag);

const imageDir = "./output";
// 读取原图片名字，去掉后缀
const originalImagName = originalImag.split("/")[-1].split(".")[0];
// 检测目标文件夹里是否已经存在该图片，如果存在，跳过
if (checkImageExsit(imageDir, originalImagName)) {
  console.log(`${originalImagName}已经存在，跳过`);
  exit();
}

const megapixels = 1.2;
const seed = randomInt(0, 976242998978323);

const updateWorkflow = {
  "4": {
    inputs: {
      ckpt_name: "iniverseMixXLSFWNSFW_v40.safetensors",
    },
    class_type: "CheckpointLoaderSimple",
    _meta: {
      title: "Load Checkpoint",
    },
  },
  "8": {
    inputs: {
      samples: ["93", 0],
      vae: ["60", 2],
    },
    class_type: "VAEDecode",
    _meta: {
      title: "VAE Decode",
    },
  },
  "39": {
    inputs: {
      model: ["4", 0],
      clip: ["4", 1],
      lora_stack: ["40", 0],
    },
    class_type: "CR Apply LoRA Stack",
    _meta: {
      title: "💊 CR Apply LoRA Stack",
    },
  },
  "40": {
    inputs: {
      switch_1: "On",
      lora_name_1: "miho_v1.safetensors",
      model_weight_1: 1,
      clip_weight_1: 1,
      switch_2: "On",
      lora_name_2: "NcyPussy_v05.safetensors",
      model_weight_2: 1,
      clip_weight_2: 0.4,
      switch_3: "Off",
      lora_name_3: "None",
      model_weight_3: 1,
      clip_weight_3: 0.4,
    },
    class_type: "CR LoRA Stack",
    _meta: {
      title: "💊 CR LoRA Stack",
    },
  },
  "44": {
    inputs: {
      image: image_url,
      upload: "image",
    },
    class_type: "LoadImage",
    _meta: {
      title: "Load Image",
    },
  },
  "48": {
    inputs: {
      text: ["105", 0],
      clip: ["39", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  },
  "49": {
    inputs: {
      text: "tattoo,embedding:negativeXL_D, embedding:aidxlv04_neg, embedding:EasyNegativeV2, ",
      clip: ["4", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  },
  "55": {
    inputs: {
      text: ["105", 0],
      clip: ["60", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  },
  "56": {
    inputs: {
      text: "tattoo,embedding:negativeXL_D, embedding:aidxlv04_neg, embedding:EasyNegativeV2, ",
      clip: ["60", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Prompt)",
    },
  },
  "58": {
    inputs: {
      b1: 1,
      b2: 1.05,
      s1: 0.9500000000000001,
      s2: 0.9500000000000001,
      model: ["39", 0],
    },
    class_type: "FreeU",
    _meta: {
      title: "FreeU",
    },
  },
  "60": {
    inputs: {
      ckpt_name: "sd_xl_refiner_1.0.safetensors",
    },
    class_type: "CheckpointLoaderSimple",
    _meta: {
      title: "Load Checkpoint",
    },
  },
  "70": {
    inputs: {
      facedetection: "retinaface_resnet50",
      codeformer_fidelity: 0.5,
      facerestore_model: ["71", 0],
      image: ["8", 0],
    },
    class_type: "FaceRestoreCFWithModel",
    _meta: {
      title: "FaceRestoreCFWithModel",
    },
  },
  "71": {
    inputs: {
      model_name: "GFPGANv1.4.pth",
    },
    class_type: "FaceRestoreModelLoader",
    _meta: {
      title: "FaceRestoreModelLoader",
    },
  },
  "93": {
    inputs: {
      noise_seed: seed,
      steps: 50,
      cfg: 8,
      sampler_name: "dpmpp_2m_sde",
      scheduler: "karras",
      base_ratio: 0.8,
      denoise: 0.9,
      base_model: ["58", 0],
      base_positive: ["127", 0],
      base_negative: ["49", 0],
      refiner_model: ["60", 0],
      refiner_positive: ["128", 0],
      refiner_negative: ["56", 0],
      latent_image: ["123", 0],
    },
    class_type: "SeargeSDXLSampler",
    _meta: {
      title: "SDXL Sampler v1 (Searge)",
    },
  },
  "95": {
    inputs: {
      upscale_method: "nearest-exact",
      megapixels: megapixels,
      image: ["44", 0],
    },
    class_type: "ImageScaleToTotalPixels",
    _meta: {
      title: "ImageScaleToTotalPixels",
    },
  },
  "97": {
    inputs: {
      model: "wd-v1-4-moat-tagger-v2",
      threshold: 0.5,
      character_threshold: 0.85,
      replace_underscore: "censored",
      trailing_comma:
        "1girl, solo, breasts, looking_at_viewer, blue_eyes, thighhighs, navel, animal_ears, sitting, underwear, nipples, panties, small_breasts, pussy, white_panties, mosaic_censoring, white_thighhighs, animal_ear_fluff, window, stuffed_toy, stuffed_animal",
      exclude_tags: "",
      tags: "1girl, solo, long hair, looking at viewer, black hair, navel, twintails, nipples, outdoors, censored, pussy, day, mosaic censoring, loli, ground vehicle, motor vehicle, motorcycle, ",
      image: ["44", 0],
    },
    class_type: "WD14Tagger|pysssss",
    _meta: {
      title: "WD14 Tagger 🐍",
    },
  },
  "100": {
    inputs: {
      images: ["70", 0],
    },
    class_type: "PreviewImage",
    _meta: {
      title: "Preview Image",
    },
  },
  "105": {
    inputs: {
      delimiter: "",
      clean_whitespace: "true",
      text_a: ["97", 0],
      text_b: ["106", 0],
    },
    class_type: "Text Concatenate",
    _meta: {
      title: "Text Concatenate",
    },
  },
  "106": {
    inputs: {
      prompt: prompt_string,
    },
    class_type: "CR Prompt Text",
    _meta: {
      title: "positive",
    },
  },
  "122": {
    inputs: {
      pixels: ["95", 0],
      vae: ["4", 2],
    },
    class_type: "VAEEncode",
    _meta: {
      title: "VAE Encode",
    },
  },
  "123": {
    inputs: {
      amount: batch_size,
      samples: ["122", 0],
    },
    class_type: "RepeatLatentBatch",
    _meta: {
      title: "Repeat Latent Batch",
    },
  },
  "124": {
    inputs: {
      clip_vision: ["125", 0],
      image: ["44", 0],
    },
    class_type: "CLIPVisionEncode",
    _meta: {
      title: "CLIP Vision Encode",
    },
  },
  "125": {
    inputs: {
      clip_name: "clip_vision_g.safetensors",
    },
    class_type: "CLIPVisionLoader",
    _meta: {
      title: "Load CLIP Vision",
    },
  },
  "127": {
    inputs: {
      strength: 0.5,
      noise_augmentation: 0,
      conditioning: ["48", 0],
      clip_vision_output: ["124", 0],
    },
    class_type: "unCLIPConditioning",
    _meta: {
      title: "unCLIPConditioning",
    },
  },
  "128": {
    inputs: {
      strength: 0.5,
      noise_augmentation: 0,
      conditioning: ["55", 0],
      clip_vision_output: ["124", 0],
    },
    class_type: "unCLIPConditioning",
    _meta: {
      title: "unCLIPConditioning",
    },
  },
};

// 下面是确定实际生成图片的大小，种子，以及保存图片信息

const steps = updateWorkflow["93"]["inputs"]["steps"];
const cfg = updateWorkflow["93"]["inputs"]["cfg"];
const sampler_name = updateWorkflow["93"]["inputs"]["sampler_name"];
const scheduler = updateWorkflow["93"]["inputs"]["scheduler"];
const positive = updateWorkflow["106"].inputs.prompt;
const negative = updateWorkflow["49"]["inputs"]["text"];

const modelname = updateWorkflow["4"]["inputs"]["ckpt_name"];
const basemodelname = parseName(modelname);

const comment = `${handleWhitespace(
  positive
)}\nNegative prompt: ${handleWhitespace(
  negative
)}\nSteps: ${steps}, Sampler: ${sampler_name}, Scheduler: ${scheduler},  CFG Scale: ${cfg}, Seed: ${seed}, Model: ${basemodelname}, Version: ComfyUI`;

console.log(`图片的信息是：${comment}`);

// 连接api，生成并保存图片
const start_time = new Date();
const images = getImages(conn, updateWorkflow, client_id, server_address);
saveImages(images, imageDir, originalImagName);
const end_time = new Date();
console.log(`生成图片用时：${end_time.getTime() - start_time.getTime()}毫秒`);
