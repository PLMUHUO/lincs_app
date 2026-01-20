const fs = require('fs');
const path = require('path');

// 读取生成的index.html文件
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 只移除script标签中的type="module"属性，不删除整个脚本标签
content = content.replace(/<script type="module"/g, '<script');

// 保存修改后的文件
fs.writeFileSync(htmlPath, content);

console.log('已修复index.html文件，移除了type="module"属性');
