const fs = require('fs');
const path = require('path');

// 读取生成的index.html文件
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 移除现代版本的脚本标签和相关的现代浏览器检测脚本
// 只保留传统版本的脚本标签（带有nomodule属性的脚本）
content = content.replace(/<script type="module" crossorigin src="\/lincs_app\/assets\/index-.*\.js"><\/script>/, '');
content = content.replace(/<script type="module">import\.meta\.url;import\("_"\)\.catch\(\(\)=>1\);\(async function\*\(\)\{\}\)\(\)\.next\(\);if\(location\.protocol!="file:"\)\{window\.__vite_is_modern_browser=true\}<\/script>/, '');
content = content.replace(/<script type="module">!function\(\)\{if\(window\.__vite_is_modern_browser\)return;console\.warn\("vite: loading legacy chunks, syntax error above and the same error below should be ignored"\);var e=document\.getElementById\("vite-legacy-polyfill"\),n=document\.createElement\("script"\);n\.src=e\.src,n\.onload=function\(\)\{System\.import\(document\.getElementById\('vite-legacy-entry'\)\.getAttribute\('data-src'\)\)\},document\.body\.appendChild\(n\)\}\(\);<\/script>/, '');

// 保存修改后的文件
fs.writeFileSync(htmlPath, content);

console.log('已修复index.html文件，只保留了传统版本的脚本标签');

