# 雨课堂在线学习智能插件

Firefox 扩展，为雨课堂提供前台视频续播、未完成学习单元导航和 DeepSeek 问答。与雨课堂、DeepSeek 或 Mozilla 无官方关联。

- 视频需手动开始，默认静音并优先选用播放器允许的 2 倍速。仅在前台、自然播完且站点确认完成后续播。不绕过失焦暂停，不伪造学习进度。
- 「问问DS」发送题目标题、截图和文字；也可手动添加图片及追问。不自动作答或提交。

## 安装和构建

开发试用：在 Firefox 打开 `about:debugging#/runtime/this-firefox`，选择「临时载入附加组件」，打开 `manifest.json`。正式安装使用 Mozilla 签名包。

无需编译。打包时将 `manifest.json` 放在 ZIP 根目录：

```sh
zip rainclass-study-assistant.zip manifest.json playback.js ds-*.js options.html options.css options.js vendor/katex.min.js vendor/KATEX-LICENSE
```

`vendor/katex.min.js` 是 [KaTeX 0.19.1](https://github.com/KaTeX/KaTeX/tree/v0.19.1) 官方 npm 发行包中的 `dist/katex.min.js`，未修改；可通过 `npm pack katex@0.19.1` 获取后核对。其许可见 `vendor/KATEX-LICENSE`。

## 隐私

- 问答默认未启用。API 密钥保存在本地 Firefox 配置，不同步；仅作为认证凭据发送至 `api.deepseek.com`。可在扩展设置删除密钥并停用问答。
- 仅主动发送问答时，题目截图、文字、手动添加的附件及当前会话历史会按需发给 DeepSeek。回复和会话历史保存在页面内存中，不写入本地历史。服务端处理请参阅 [DeepSeek 隐私政策](https://www.deepseek.com/privacy)。
- Firefox 的截图 API 要求用户可选授予「访问所有网站的数据」。扩展仅在受支持的雨课堂页面、主动点击「问问DS」时截取选定题目范围。拒绝授权不影响视频功能。不含遥测。

本项目采用 [MIT 许可](LICENSE)，第三方组件保留其原始许可。
