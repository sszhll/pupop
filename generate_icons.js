const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// 创建不同尺寸的图标
const sizes = [16, 48, 128];

async function generateIcons() {
    const svg = fs.readFileSync('icons/icon.svg', 'utf8');
    
    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // 创建临时的 data URL
        const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        const img = await loadImage(dataUrl);
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, size, size);
        
        // 保存为 PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`icons/icon${size}.png`, buffer);
    }
}

generateIcons().catch(console.error); 