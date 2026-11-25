# 雨课堂在线学习智能插件

Firefox 扩展，为雨课堂提供前台视频续播、未完成学习单元导航和 DeepSeek 问答。与雨课堂、DeepSeek 或 Mozilla 无官方关联。

- 视频需手动开始，默认静音并优先选用播放器允许的 2 倍速。仅在前台、自然播完且站点确认完成后续播。不绕过失焦暂停，不伪造学习进度。
- 「问问DS」发送题目标题、截图和文字；也可手动添加图片及追问。不自动作答或提交。

## 安装和构建

如果您是普通用户，直接去release下载最新版签名包，双击即可安装到火狐（firefox)浏览器。
不支持安卓端，请在桌面端火狐浏览器进行安装。目前主要在linux(Kubuntu)上进行测试，对于windows上firefox 浏览器的测试还在长期进行中，不过已经可以使用。

tips:自行构建版本无mozilla官方签名，安装较为繁琐，如果您不是专业用户，请不要自行构建使用！

自行构建试用：在 Firefox 打开 `about:debugging#/runtime/this-firefox`，选择「临时载入附加组件」，打开 `manifest.json`。正式安装使用 Mozilla 签名包。

无需编译。打包时将 `manifest.json` 放在 ZIP 根目录：

```sh
zip rainclass-study-assistant.zip manifest.json playback.js ds-*.js options.html options.css options.js vendor/katex.min.js vendor/KATEX-LICENSE
```

`vendor/katex.min.js` 是 [KaTeX 0.19.1](https://github.com/KaTeX/KaTeX/tree/v0.19.1) 官方 npm 发行包中的 `dist/katex.min.js`，未修改；可通过 `npm pack katex@0.19.1` 获取后核对。其许可见 `vendor/KATEX-LICENSE`。

## 使用

- 1.问答默认未启用。你需要自己在设置界面配置自己的deepseek API,API仅保存在本地。
- 2.配置完成API并启用扩展和问答功能后，雨课堂播放视频时如果播放完成会自动播放下一个没有完成学习的视频。
- 注意：如果播放被打断了（比如雨课堂发现焦点丢失）不会帮你恢复播放。换句话说，如果你要维持视频正常播放，不要在视频播放期间对电脑进行其他操作。
- 3.对于图文、讨论和作业栏目，右下角会出现一个聊天按钮，点击后展开AI助手，可以直接点击“问问DS”快捷询问这道题怎么做（章节标题和题目都会以图片方式发给它）
- 4.你可以手动输入想要发送的提示词，而且可以上传图片附件，也可以粘贴图片一起发送，不过注意目前不支持其他格式的文件。
- 5.deepseek助手会保留本次会话的上下文，但是一旦切换题目或者更换会话，上下文会全部丢失。
- 6.没有做上下文压缩功能，一般来说也用不上，不要真的让超出上下文的事情发生。
- 7.Firefox 的截图 API 要求用户可选授予「访问所有网站的数据」，因此你需要给扩展这个权限，否则没法使用deepseek快捷询问功能。
- （但是视频自动联播是不受到影响的）
- 服务端处理请参阅 [DeepSeek 隐私政策](https://www.deepseek.com/privacy)。
  

本项目采用 [MIT 许可](LICENSE)，第三方组件保留其原始许可。
