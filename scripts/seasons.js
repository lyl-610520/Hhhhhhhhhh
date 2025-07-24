/**
 * 四季树Canvas渲染系统
 * 水彩风格的季节变化动效
 */

class SeasonsTreeRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initializeTree();
        this.animationId = null;
        this.lastFrameTime = 0;
        this.particles = [];
        this.currentSeason = this.getCurrentSeason();
    }
    
    // 设置Canvas尺寸和属性
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
        
        // 启用抗锯齿
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    // 初始化树的基本结构
    initializeTree() {
        this.tree = {
            trunk: {
                x: this.width / 2,
                y: this.height * 0.9,
                width: 8,
                height: this.height * 0.3
            },
            branches: this.generateBranches(),
            leaves: []
        };
        
        // 根据当前季节生成叶子
        this.generateLeaves();
    }
    
    // 生成树枝结构
    generateBranches() {
        const branches = [];
        const trunkTop = this.height * 0.6;
        const centerX = this.width / 2;
        
        // 主要分枝
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI - Math.PI / 2;
            const length = 40 + Math.random() * 30;
            const branch = {
                startX: centerX + (Math.random() - 0.5) * 20,
                startY: trunkTop + i * 15,
                endX: centerX + Math.cos(angle) * length,
                endY: trunkTop + i * 15 + Math.sin(angle) * length,
                width: 4 - i * 0.5,
                subBranches: []
            };
            
            // 为每个主分枝生成子分枝
            for (let j = 0; j < 3; j++) {
                const subAngle = angle + (Math.random() - 0.5) * 0.8;
                const subLength = 20 + Math.random() * 15;
                const progress = (j + 1) / 4;
                const subStartX = branch.startX + (branch.endX - branch.startX) * progress;
                const subStartY = branch.startY + (branch.endY - branch.startY) * progress;
                
                branch.subBranches.push({
                    startX: subStartX,
                    startY: subStartY,
                    endX: subStartX + Math.cos(subAngle) * subLength,
                    endY: subStartY + Math.sin(subAngle) * subLength,
                    width: 2
                });
            }
            
            branches.push(branch);
        }
        
        return branches;
    }
    
    // 生成叶子
    generateLeaves() {
        this.tree.leaves = [];
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        
        this.tree.branches.forEach(branch => {
            // 在主分枝上生成叶子
            this.addLeavesToBranch(branch, seasonConfig);
            
            // 在子分枝上生成叶子
            branch.subBranches.forEach(subBranch => {
                this.addLeavesToBranch(subBranch, seasonConfig, 0.7);
            });
        });
    }
    
    // 在分枝上添加叶子
    addLeavesToBranch(branch, seasonConfig, density = 1) {
        const leafCount = Math.floor(seasonConfig.leafDensity * density * 8);
        
        for (let i = 0; i < leafCount; i++) {
            const progress = 0.3 + (Math.random() * 0.7); // 叶子分布在枝条的后70%
            const x = branch.startX + (branch.endX - branch.startX) * progress;
            const y = branch.startY + (branch.endY - branch.startY) * progress;
            
            // 添加一些随机偏移
            const offsetX = (Math.random() - 0.5) * 15;
            const offsetY = (Math.random() - 0.5) * 15;
            
            this.tree.leaves.push({
                x: x + offsetX,
                y: y + offsetY,
                size: 3 + Math.random() * 4,
                color: this.getRandomSeasonColor(seasonConfig),
                opacity: 0.7 + Math.random() * 0.3,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    // 获取季节配置
    getSeasonConfig(season) {
        const configs = {
            spring: {
                leafDensity: 0.8,
                colors: ['#90EE90', '#98FB98', '#00FA9A', '#32CD32', '#ADFF2F'],
                trunkColor: '#8B4513',
                branchColor: '#A0522D',
                backgroundColor: 'linear-gradient(to bottom, #E6F3FF, #F0F8FF)',
                particles: { type: 'petal', color: '#FFB6C1', count: 5 }
            },
            summer: {
                leafDensity: 1.0,
                colors: ['#228B22', '#32CD32', '#006400', '#008000', '#00FF00'],
                trunkColor: '#8B4513',
                branchColor: '#A0522D',
                backgroundColor: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
                particles: { type: 'butterfly', color: '#FFD700', count: 3 }
            },
            autumn: {
                leafDensity: 0.6,
                colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500', '#DC143C'],
                trunkColor: '#8B4513',
                branchColor: '#A0522D',
                backgroundColor: 'linear-gradient(to bottom, #FFA07A, #FFEFD5)',
                particles: { type: 'falling_leaf', color: '#FF4500', count: 8 }
            },
            winter: {
                leafDensity: 0.1,
                colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
                trunkColor: '#696969',
                branchColor: '#708090',
                backgroundColor: 'linear-gradient(to bottom, #B0C4DE, #E6E6FA)',
                particles: { type: 'snowflake', color: '#FFFFFF', count: 12 }
            }
        };
        
        return configs[season] || configs.spring;
    }
    
    // 获取当前季节
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }
    
    // 获取随机季节颜色
    getRandomSeasonColor(seasonConfig) {
        const colors = seasonConfig.colors;
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 绘制背景
    drawBackground() {
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        
        // 创建渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        if (seasonConfig.backgroundColor.includes('linear-gradient')) {
            // 解析CSS渐变（简化版）
            switch (this.currentSeason) {
                case 'spring':
                    gradient.addColorStop(0, '#E6F3FF');
                    gradient.addColorStop(1, '#F0F8FF');
                    break;
                case 'summer':
                    gradient.addColorStop(0, '#87CEEB');
                    gradient.addColorStop(1, '#98FB98');
                    break;
                case 'autumn':
                    gradient.addColorStop(0, '#FFA07A');
                    gradient.addColorStop(1, '#FFEFD5');
                    break;
                case 'winter':
                    gradient.addColorStop(0, '#B0C4DE');
                    gradient.addColorStop(1, '#E6E6FA');
                    break;
            }
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // 绘制树干
    drawTrunk() {
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        const trunk = this.tree.trunk;
        
        // 水彩效果的树干
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        
        // 主树干
        this.ctx.fillStyle = seasonConfig.trunkColor;
        this.ctx.beginPath();
        this.ctx.roundRect(
            trunk.x - trunk.width / 2,
            trunk.y - trunk.height,
            trunk.width,
            trunk.height,
            [2, 2, 0, 0]
        );
        this.ctx.fill();
        
        // 添加纹理效果
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#654321';
        for (let i = 0; i < 5; i++) {
            const lineY = trunk.y - trunk.height * (0.2 + i * 0.2);
            this.ctx.fillRect(trunk.x - trunk.width / 2, lineY, trunk.width, 1);
        }
        
        this.ctx.restore();
    }
    
    // 绘制树枝
    drawBranches() {
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.strokeStyle = seasonConfig.branchColor;
        this.ctx.lineCap = 'round';
        
        this.tree.branches.forEach(branch => {
            // 绘制主分枝
            this.ctx.lineWidth = branch.width;
            this.ctx.beginPath();
            this.ctx.moveTo(branch.startX, branch.startY);
            this.ctx.lineTo(branch.endX, branch.endY);
            this.ctx.stroke();
            
            // 绘制子分枝
            branch.subBranches.forEach(subBranch => {
                this.ctx.lineWidth = subBranch.width;
                this.ctx.beginPath();
                this.ctx.moveTo(subBranch.startX, subBranch.startY);
                this.ctx.lineTo(subBranch.endX, subBranch.endY);
                this.ctx.stroke();
            });
        });
        
        this.ctx.restore();
    }
    
    // 绘制叶子
    drawLeaves(time) {
        this.ctx.save();
        
        this.tree.leaves.forEach(leaf => {
            this.ctx.save();
            
            // 添加轻微的摇摆动画
            const swayOffset = Math.sin(time * leaf.swaySpeed + leaf.sway) * 2;
            
            this.ctx.globalAlpha = leaf.opacity;
            this.ctx.fillStyle = leaf.color;
            
            // 水彩效果的叶子
            this.ctx.shadowColor = leaf.color;
            this.ctx.shadowBlur = 3;
            
            this.ctx.beginPath();
            this.ctx.arc(
                leaf.x + swayOffset,
                leaf.y,
                leaf.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }
    
    // 绘制季节粒子效果
    drawParticles(time) {
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        
        // 更新粒子
        this.updateParticles(time);
        
        this.ctx.save();
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            
            switch (particle.type) {
                case 'snowflake':
                    this.drawSnowflake(particle);
                    break;
                case 'falling_leaf':
                    this.drawFallingLeaf(particle);
                    break;
                case 'petal':
                    this.drawPetal(particle);
                    break;
                case 'butterfly':
                    this.drawButterfly(particle);
                    break;
            }
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }
    
    // 更新粒子
    updateParticles(time) {
        const seasonConfig = this.getSeasonConfig(this.currentSeason);
        
        // 添加新粒子
        if (this.particles.length < seasonConfig.particles.count && Math.random() < 0.1) {
            this.particles.push({
                type: seasonConfig.particles.type,
                x: Math.random() * this.width,
                y: -10,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                size: 2 + Math.random() * 3,
                color: seasonConfig.particles.color,
                opacity: 0.5 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
        
        // 更新现有粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            
            // 移除超出屏幕的粒子
            return particle.y < this.height + 20 && particle.x >= -20 && particle.x <= this.width + 20;
        });
    }
    
    // 绘制雪花
    drawSnowflake(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(particle.size, 0);
            this.ctx.stroke();
            this.ctx.rotate(Math.PI / 3);
        }
        
        this.ctx.restore();
    }
    
    // 绘制飘落的叶子
    drawFallingLeaf(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 绘制花瓣
    drawPetal(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, particle.size * 0.5, particle.size, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 绘制蝴蝶（简化版）
    drawButterfly(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(-particle.size * 0.3, -particle.size * 0.2, particle.size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(particle.size * 0.3, -particle.size * 0.2, particle.size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(-particle.size * 0.2, particle.size * 0.2, particle.size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(particle.size * 0.2, particle.size * 0.2, particle.size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 主渲染函数
    render(time = 0) {
        // 清空canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制各个组件
        this.drawBackground();
        this.drawTrunk();
        this.drawBranches();
        this.drawLeaves(time);
        this.drawParticles(time);
    }
    
    // 启动动画循环
    startAnimation() {
        const animate = (time) => {
            this.render(time);
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    // 停止动画
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 切换季节
    changeSeason(season) {
        if (season !== this.currentSeason) {
            this.currentSeason = season;
            this.generateLeaves();
            this.particles = []; // 清空现有粒子
        }
    }
    
    // 响应式调整
    resize() {
        this.setupCanvas();
        this.initializeTree();
    }
}

// 导出类
window.SeasonsTreeRenderer = SeasonsTreeRenderer;