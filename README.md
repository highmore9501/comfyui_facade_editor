本项目的功能是使用 comfyUI 导出的 api 文件，让用户来自定义可以暴露的参数，建立一个更简洁的 comfyUI 操作界面。

## 安装与运行

安装：

```bash
npm install
```

运行：

```bash
npm run dev
```

## 使用

用浏览器打开 [http://localhost:3000](http://localhost:3000) 可访问基于设置生成的简化版的 ComfyUI 操作界面.

用浏览器打开 [http://localhost:3000/workflow](http://localhost:3000/workflow) 可访问编辑和设置工作流的界面.

## 其它

本项目没有做后端，所以实际上当编辑和设置完工作流，点击保存后，只能拿到一个 json 文件。
将该 json 文件的内容复制粘贴到`public/workflow/sdxl_img2img_setting.json`中，然后刷新`http://localhost:3000`即可看到效果。
