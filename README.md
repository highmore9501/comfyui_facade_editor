This project's function is to utilize the API file exported by comfyUI, allowing users to customize the exposable parameters, and create a more concise and user-friendly interface for comfyUI - or a "facade", if you prefer. This allows ordinary users to effortlessly utilize comfyUI without being confused by the intricate interface and numerous parameters.

## Installation and Running

Installation:

```bash
npm install
```

Running：

```bash
npm run dev
```

## Setting Environment Variables

Copy `.env.example` and rename it to `.env.local`. Replace the value of `NEXT_PUBLIC_SERVER_ADDRESS` with your actual ComfyUI server address.

## Usage

Open your browser and visit [http://localhost:3000](http://localhost:3000) to access the simplified ComfyUI interface generated based on your settings.

![user_interface](public/user_interface.png)

visit [http://localhost:3000/workflow](http://localhost:3000/workflow) to access the workflow editing and setting editor.

![workflow_editor](public/workflow_editor.png)

## Other Notes

This project does not have a backend, so after editing and setting up the workflow, clicking save will only generate a JSON file. To see the changes, copy the contents of the JSON file and paste them into `public/workflow/sdxl_img2img_setting.json`, then refresh `http://localhost:3000`.
