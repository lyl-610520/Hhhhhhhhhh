/**
 * 花朵SVG生成器
 * 生成精美的花朵SVG图形，对应不同成长阶段
 */

class FlowerSVGGenerator {
    constructor() {
        // 花朵成长阶段配置
        this.stages = {
            seed: {
                name: '种子',
                colors: ['#8b4513', '#a0522d', '#d2b48c'],
                svgContent: this.generateSeedSVG.bind(this)
            },
            sprout: {
                name: '出芽',
                colors: ['#90ee90', '#98fb98', '#00fa9a'],
                svgContent: this.generateSproutSVG.bind(this)
            },
            sapling: {
                name: '小苗',
                colors: ['#228b22', '#32cd32', '#006400'],
                svgContent: this.generateSaplingSVG.bind(this)
            },
            bud: {
                name: '花骨朵',
                colors: ['#ff69b4', '#ff1493', '#dc143c'],
                svgContent: this.generateBudSVG.bind(this)
            },
            bloom: {
                name: '开花',
                colors: ['#ff6347', '#ff4500', '#ffd700'],
                svgContent: this.generateBloomSVG.bind(this)
            }
        };
    }
    
    // 生成种子SVG
    generateSeedSVG() {
        return `
            <defs>
                <radialGradient id="seedGradient" cx="0.3" cy="0.3" r="0.7">
                    <stop offset="0%" style="stop-color:#d2b48c;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#a0522d;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b4513;stop-opacity:1" />
                </radialGradient>
                <filter id="seedShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
                </filter>
            </defs>
            <ellipse cx="40" cy="50" rx="12" ry="8" fill="url(#seedGradient)" filter="url(#seedShadow)"/>
            <ellipse cx="40" cy="50" rx="8" ry="5" fill="rgba(255,255,255,0.2)"/>
        `;
    }
    
    // 生成出芽SVG
    generateSproutSVG() {
        return `
            <defs>
                <linearGradient id="sproutGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#90ee90;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#98fb98;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00fa9a;stop-opacity:1" />
                </linearGradient>
                <radialGradient id="soilGradient" cx="0.5" cy="0.5" r="0.6">
                    <stop offset="0%" style="stop-color:#8b4513;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
                </radialGradient>
                <filter id="sproutShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.15)"/>
                </filter>
            </defs>
            <!-- 土壤 -->
            <ellipse cx="40" cy="65" rx="20" ry="6" fill="url(#soilGradient)"/>
            <!-- 茎干 -->
            <rect x="38" y="45" width="4" height="20" fill="#228b22" filter="url(#sproutShadow)"/>
            <!-- 叶子 -->
            <ellipse cx="35" cy="50" rx="6" ry="3" fill="url(#sproutGradient)" transform="rotate(-30 35 50)" filter="url(#sproutShadow)"/>
            <ellipse cx="45" cy="52" rx="5" ry="2.5" fill="url(#sproutGradient)" transform="rotate(25 45 52)" filter="url(#sproutShadow)"/>
        `;
    }
    
    // 生成小苗SVG
    generateSaplingSVG() {
        return `
            <defs>
                <linearGradient id="saplingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#32cd32;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#228b22;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#006400;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#228b22;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#32cd32;stop-opacity:1" />
                </linearGradient>
                <filter id="saplingGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- 土壤 -->
            <ellipse cx="40" cy="65" rx="22" ry="8" fill="#8b4513"/>
            <!-- 主茎 -->
            <rect x="37" y="30" width="6" height="35" fill="url(#stemGradient)" rx="3"/>
            <!-- 叶子们 -->
            <ellipse cx="30" cy="35" rx="8" ry="4" fill="url(#saplingGradient)" transform="rotate(-45 30 35)" filter="url(#saplingGlow)"/>
            <ellipse cx="50" cy="38" rx="7" ry="3.5" fill="url(#saplingGradient)" transform="rotate(30 50 38)" filter="url(#saplingGlow)"/>
            <ellipse cx="28" cy="45" rx="6" ry="3" fill="url(#saplingGradient)" transform="rotate(-60 28 45)" filter="url(#saplingGlow)"/>
            <ellipse cx="52" cy="48" rx="6" ry="3" fill="url(#saplingGradient)" transform="rotate(45 52 48)" filter="url(#saplingGlow)"/>
            <ellipse cx="32" cy="55" rx="5" ry="2.5" fill="url(#saplingGradient)" transform="rotate(-30 32 55)" filter="url(#saplingGlow)"/>
            <ellipse cx="48" cy="58" rx="5" ry="2.5" fill="url(#saplingGradient)" transform="rotate(20 48 58)" filter="url(#saplingGlow)"/>
        `;
    }
    
    // 生成花骨朵SVG
    generateBudSVG() {
        return `
            <defs>
                <radialGradient id="budGradient" cx="0.3" cy="0.3" r="0.8">
                    <stop offset="0%" style="stop-color:#ff69b4;stop-opacity:1" />
                    <stop offset="40%" style="stop-color:#ff1493;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#dc143c;stop-opacity:1" />
                </radialGradient>
                <linearGradient id="budStemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#228b22;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#32cd32;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="budLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#90ee90;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#228b22;stop-opacity:1" />
                </linearGradient>
                <filter id="budShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
                </filter>
            </defs>
            <!-- 土壤 -->
            <ellipse cx="40" cy="70" rx="25" ry="8" fill="#8b4513"/>
            <!-- 主茎 -->
            <rect x="36" y="25" width="8" height="45" fill="url(#budStemGradient)" rx="4"/>
            <!-- 叶子 -->
            <ellipse cx="25" cy="40" rx="10" ry="5" fill="url(#budLeafGradient)" transform="rotate(-50 25 40)" filter="url(#budShadow)"/>
            <ellipse cx="55" cy="45" rx="9" ry="4.5" fill="url(#budLeafGradient)" transform="rotate(40 55 45)" filter="url(#budShadow)"/>
            <ellipse cx="22" cy="55" rx="8" ry="4" fill="url(#budLeafGradient)" transform="rotate(-40 22 55)" filter="url(#budShadow)"/>
            <ellipse cx="58" cy="60" rx="7" ry="3.5" fill="url(#budLeafGradient)" transform="rotate(30 58 60)" filter="url(#budShadow)"/>
            <!-- 花骨朵 -->
            <ellipse cx="40" cy="20" rx="8" ry="12" fill="url(#budGradient)" filter="url(#budShadow)"/>
            <!-- 花瓣轮廓 -->
            <path d="M 35 15 Q 40 8 45 15" stroke="#ff1493" stroke-width="1" fill="none" opacity="0.6"/>
            <path d="M 33 20 Q 40 10 47 20" stroke="#ff1493" stroke-width="1" fill="none" opacity="0.4"/>
        `;
    }
    
    // 生成盛开花朵SVG
    generateBloomSVG() {
        return `
            <defs>
                <radialGradient id="petalGradient" cx="0.3" cy="0.3" r="0.8">
                    <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                    <stop offset="40%" style="stop-color:#ff6347;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ff4500;stop-opacity:1" />
                </radialGradient>
                <radialGradient id="centerGradient" cx="0.5" cy="0.5" r="0.6">
                    <stop offset="0%" style="stop-color:#fff8dc;stop-opacity:1" />
                    <stop offset="60%" style="stop-color:#ffd700;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
                </radialGradient>
                <linearGradient id="bloomStemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#228b22;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#32cd32;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="bloomLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#90ee90;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#228b22;stop-opacity:1" />
                </linearGradient>
                <filter id="bloomGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <filter id="bloomShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
                </filter>
            </defs>
            <!-- 土壤 -->
            <ellipse cx="40" cy="72" rx="28" ry="8" fill="#8b4513"/>
            <!-- 主茎 -->
            <rect x="35" y="30" width="10" height="42" fill="url(#bloomStemGradient)" rx="5"/>
            <!-- 叶子 -->
            <ellipse cx="20" cy="45" rx="12" ry="6" fill="url(#bloomLeafGradient)" transform="rotate(-55 20 45)" filter="url(#bloomShadow)"/>
            <ellipse cx="60" cy="50" rx="11" ry="5.5" fill="url(#bloomLeafGradient)" transform="rotate(45 60 50)" filter="url(#bloomShadow)"/>
            <ellipse cx="18" cy="60" rx="10" ry="5" fill="url(#bloomLeafGradient)" transform="rotate(-45 18 60)" filter="url(#bloomShadow)"/>
            <ellipse cx="62" cy="65" rx="9" ry="4.5" fill="url(#bloomLeafGradient)" transform="rotate(35 62 65)" filter="url(#bloomShadow)"/>
            
            <!-- 花瓣 (8片) -->
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(0 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(45 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(90 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(135 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(180 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(225 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(270 40 20)" filter="url(#bloomGlow)"/>
            <ellipse cx="40" cy="15" rx="6" ry="12" fill="url(#petalGradient)" transform="rotate(315 40 20)" filter="url(#bloomGlow)"/>
            
            <!-- 花心 -->
            <circle cx="40" cy="20" r="5" fill="url(#centerGradient)" filter="url(#bloomShadow)"/>
            
            <!-- 花蕊 -->
            <circle cx="37" cy="18" r="1" fill="#ff8c00" opacity="0.8"/>
            <circle cx="43" cy="18" r="1" fill="#ff8c00" opacity="0.8"/>
            <circle cx="40" cy="16" r="1" fill="#ff8c00" opacity="0.8"/>
            <circle cx="40" cy="22" r="1" fill="#ff8c00" opacity="0.8"/>
            <circle cx="38" cy="22" r="0.8" fill="#ffa500" opacity="0.6"/>
            <circle cx="42" cy="22" r="0.8" fill="#ffa500" opacity="0.6"/>
        `;
    }
    
    // 根据等级生成花朵SVG
    generateFlowerSVG(level, theme = 'light') {
        const stageNames = ['seed', 'sprout', 'sapling', 'bud', 'bloom'];
        const stageName = stageNames[Math.min(level, stageNames.length - 1)];
        const stage = this.stages[stageName];
        
        if (!stage) {
            return this.generateSeedSVG();
        }
        
        // 根据主题调整颜色
        let svgContent = stage.svgContent();
        
        if (theme === 'dark') {
            // 深色主题下调整颜色
            svgContent = svgContent.replace(/#8b4513/g, '#a0522d');
            svgContent = svgContent.replace(/#654321/g, '#8b4513');
            // 增加发光效果
            svgContent = svgContent.replace(/opacity="0\.([0-9])"/g, 'opacity="0.$1"');
        }
        
        return `
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                ${svgContent}
            </svg>
        `;
    }
    
    // 获取花朵阶段名称
    getStageName(level, language = 'zh') {
        const stageNames = ['seed', 'sprout', 'sapling', 'bud', 'bloom'];
        const stageName = stageNames[Math.min(level, stageNames.length - 1)];
        
        if (language === 'en') {
            const englishNames = {
                seed: 'Seed',
                sprout: 'Sprout',
                sapling: 'Sapling',
                bud: 'Bud',
                bloom: 'Bloom'
            };
            return englishNames[stageName] || 'Seed';
        }
        
        return this.stages[stageName]?.name || '种子';
    }
    
    // 获取花朵颜色主题
    getStageColors(level) {
        const stageNames = ['seed', 'sprout', 'sapling', 'bud', 'bloom'];
        const stageName = stageNames[Math.min(level, stageNames.length - 1)];
        return this.stages[stageName]?.colors || this.stages.seed.colors;
    }
    
    // 生成动画效果的花朵（用于特殊时刻）
    generateAnimatedFlowerSVG(level, animation = 'glow') {
        let baseSVG = this.generateFlowerSVG(level);
        
        // 添加动画定义
        const animationDefs = {
            glow: `
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            `,
            pulse: `
                <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="1.5s" repeatCount="indefinite"/>
            `,
            sparkle: `
                <animate attributeName="fill-opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite"/>
            `
        };
        
        if (animationDefs[animation]) {
            baseSVG = baseSVG.replace('</svg>', `
                <g>
                    ${animationDefs[animation]}
                </g>
                </svg>
            `);
        }
        
        return baseSVG;
    }
}

// 导出到全局
window.FlowerSVGGenerator = FlowerSVGGenerator;