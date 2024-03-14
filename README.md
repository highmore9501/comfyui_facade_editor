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

visit [http://localhost:3000/workflow](http://localhost:3000/workflow) to access the facade_editor.

![facade_editor](public/workflow_editor.png)

## Edit the Facade and Settings

1. Editing the Facade
       In the facade editor, you can paste the comfyUI workflow you want to edit into the editing box on the left. On the right, you can set the simplified facade name, function description, abbreviation, and parameters exposed to users. Parameter settings include parameter name, parameter type, parameter description, parameter default value, etc.

2. Save the Setting File
       After completing all the settings, click the save button, and you will get a JSON file. Rename this file to `<slug>_settings.json` and place it in the `public/workflows` folder.

3. Apply the Setting File
       In the `public/workflows` folder, there is a `comfyUIWorkFlows.json` file, which is used to launch all setting files. Add the information you obtained in the previous step to this file, and you can use the facade you just edited on the simple user interface.

### Example

You have obtained a comfyUI workflow (API format), edited it in the facade editor, and saved it as `my_workflow_settings.json`. Then, place it in the `public/workflows` folder. Next, open the `comfyUIWorkFlows.json` file and add the following content:

```json
{
  "slug": "my_workflow",
  "name": "My Workflow"
}
```

Now you can use the `My Workflow` you just edited on the simple user interface.
