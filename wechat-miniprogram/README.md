# 微信小程序Web-View壳子项目

这是一个基于微信小程序 `web-view` 组件的壳子项目，用于快速将现有的Web项目部署到微信小程序中。

## 项目结构

```
wechat-miniprogram/
├── app.js              # 小程序全局逻辑
├── app.json            # 小程序全局配置
├── pages/
│   └── index/
│       ├── index.js    # 首页逻辑
│       ├── index.json  # 首页配置
│       ├── index.wxml  # 首页结构
│       └── index.wxss  # 首页样式
└── project.config.json # 项目配置文件
```

## 快速开始

### 1. 配置Web项目域名

在使用之前，您需要将您的Web项目域名配置到微信小程序的业务域名中：

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发管理」→「开发设置」→「业务域名」
3. 下载校验文件 `MP_verify_xxxx.txt`
4. 将校验文件上传到您的Web服务器根目录
5. 添加您的Web项目域名（必须是已备案的HTTPS域名）

### 2. 修改配置文件

#### 2.1 修改Web项目地址

在 `pages/index/index.js` 和 `pages/index/index.wxml` 中修改Web项目地址：

```javascript
// pages/index/index.js
Page({
  data: {
    webViewSrc: 'https://您的域名/' // 修改为您的Web项目地址
  }
  // ...
})
```

```html
<!-- pages/index/index.wxml -->
<web-view src="https://您的域名/" bindmessage="onWebViewMessage" bindload="onWebViewLoad" binderror="onWebViewError"></web-view>
```

#### 2.2 修改小程序配置

在 `project.config.json` 中修改小程序信息：

```json
{
  "appid": "您的小程序AppID",
  "projectname": "您的小程序名称"
  // ...
}
```

在 `app.json` 中修改小程序全局配置：

```json
{
  "window": {
    "navigationBarTitleText": "您的小程序标题"
  }
  // ...
}
```

### 3. 导入项目

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 点击「导入项目」
4. 选择本项目目录
5. 填写您的小程序AppID
6. 点击「导入」

### 4. 预览与发布

1. 点击「预览」按钮，使用手机扫码查看效果
2. 确认无误后，点击「上传」按钮提交审核
3. 审核通过后，在微信公众平台发布小程序

## Web项目构建

在部署之前，您需要先构建您的Web项目：

```bash
# 回到Web项目根目录
cd ..

# 安装依赖
npm install

# 构建项目
npm run build
```

构建完成后，将 `dist` 目录下的文件部署到您的Web服务器上。

## 注意事项

1. **域名要求**：
   - 必须使用已备案的HTTPS域名
   - 必须在微信公众平台配置业务域名
   - 必须将微信的校验文件放置在服务器根目录

2. **兼容性**：
   - 确保您的Web项目在微信内置浏览器中兼容良好
   - 避免使用微信不支持的Web API

3. **性能优化**：
   - 优化Web项目的加载速度，减少白屏时间
   - 合理使用缓存，提高页面加载效率

4. **审核要求**：
   - 微信对 `web-view` 的使用有严格的审核要求
   - 禁止单纯作为网页入口，建议添加一些小程序原生功能
   - 禁止加载违法违规内容

5. **交互限制**：
   - `web-view` 中无法直接调用微信小程序的API
   - 可以通过 `postMessage` 实现Web页面与小程序之间的通信

## Web页面与小程序通信

### 从Web页面发送消息到小程序

在您的Web页面中添加以下代码：

```javascript
// 发送消息到小程序
function sendMessageToMiniProgram(message) {
  wx.miniProgram.postMessage({
    data: message
  });
}

// 示例：发送用户登录状态
sendMessageToMiniProgram({
  type: 'userLogin',
  userId: '123456'
});
```

### 在小程序中接收消息

在 `pages/index/index.js` 中：

```javascript
onWebViewMessage: function(e) {
  const message = e.detail.data;
  console.log('收到Web页面消息：', message);
  
  // 处理不同类型的消息
  if (message.type === 'userLogin') {
    // 处理用户登录逻辑
    console.log('用户登录ID：', message.userId);
  }
}
```

## 常见问题

### Q: 为什么 `web-view` 无法加载我的页面？
A: 请检查以下几点：
1. 您的域名是否已备案
2. 您的页面是否使用HTTPS协议
3. 您的域名是否已添加到微信小程序的业务域名中
4. 微信的校验文件是否已正确放置在服务器根目录

### Q: 为什么小程序审核不通过？
A: 可能的原因：
1. 单纯作为网页入口，没有小程序原生功能
2. 加载了违法违规内容
3. 没有正确配置业务域名
4. 用户体验不佳（如加载速度过慢）

### Q: 如何提高页面加载速度？
A: 建议：
1. 优化Web项目的资源大小
2. 使用CDN加速
3. 启用浏览器缓存
4. 实现懒加载

## 技术支持

如果您在使用过程中遇到问题，可以参考：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [微信开发者工具帮助中心](https://developers.weixin.qq.com/miniprogram/dev/devtools/)

## 许可证

MIT