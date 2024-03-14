本项目的功能是使用 comfyUI 导出的 api 文件，让用户来自定义可以暴露的参数，建立一个更简洁的 comfyUI 操作界面--或者说`门面`,使得普通使用者可以简单的使用 comfyui 而不被复杂界面和参数给弄得晕头转向。

## 安装与运行

安装：

```bash
npm install
```

运行：

```bash
npm run dev
```

## 设置环境变量

将`.env.example`文件复制一份，命名为`.env.local`，并将`NEXT_PUBLIC_SERVER_ADDRESS`的值替换为实际的 ComfyUI 服务器地址。

## 使用

用浏览器打开 [http://localhost:3000](http://localhost:3000) 可访问基于设置生成的简化版的 ComfyUI 操作界面.

![工作流使用界面](public/user_interface.png)

用浏览器打开 [http://localhost:3000/workflow](http://localhost:3000/workflow) 可访问编辑和设置工作流的界面.

![工作流编辑界面](public/workflow_editor.png)

## 其它

本项目没有做后端，所以实际上当编辑和设置完工作流，点击保存后，只能拿到一个 json 文件。
将该 json 文件的内容复制粘贴到`public/workflow/sdxl_img2img_setting.json`中，然后刷新`http://localhost:3000`即可看到效果。
