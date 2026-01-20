const fs = require('fs');
const path = require('path');

// 读取生成的index.html文件
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 移除script标签中的type="module"属性
content = content.replace(/<script type="module"/g, '<script');

// 将脚本标签从head移到body末尾，确保在DOM元素加载后执行
const scriptMatch = content.match(/<script crossorigin src="[^"]+"><\/script>/);
if (scriptMatch) {
    const scriptTag = scriptMatch[0];
    // 从head中移除脚本标签
    content = content.replace(scriptTag, '');
    // 在body末尾添加脚本标签
    content = content.replace('</body>', `${scriptTag}\n</body>`);
}

// 保存修改后的文件
fs.writeFileSync(htmlPath, content);

console.log('已修复index.html文件，移除了type="module"属性并调整了脚本执行顺序');
