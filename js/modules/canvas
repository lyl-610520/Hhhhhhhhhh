// js/modules/canvas.js
import p5 from 'p5';
import { getTheme } from './theme.js';

export function initCanvas() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas) return;

  const sketch = (p) => {
    let treeSvg, flowerSvg;
    const stars = [];
    const month = new Date().getMonth();
    const hours = new Date().getHours();
    const theme = getTheme(); // 从theme.js获取

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      // 加载四季树SVG（根据月份）
      treeSvg = month < 3 ? 'assets/images/tree_spring.svg' :
                month < 6 ? 'assets/images/tree_summer.svg' :
                month < 9 ? 'assets/images/tree_autumn.svg' : 'assets/images/tree_winter.svg';
      // 加载花朵SVG（根据阳光值）
      const state = JSON.parse(localStorage.getItem('state') || '{}');
      const sunshine = state.sunshine || 0;
      flowerSvg = sunshine < 101 ? 'assets/images/flower_seed.svg' :
                  sunshine < 251 ? 'assets/images/flower_sprout.svg' :
                  sunshine < 501 ? 'assets/images/flower_sapling.svg' :
                  sunshine < 1001 ? 'assets/images/flower_bud.svg' : 'assets/images/flower_bloom.svg';

      // 夜空星星（20:00–04:00）
      if (hours >= 20 || hours < 4) {
        for (let i = 0; i < 1000; i++) {
          stars.push({
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(1, 3),
            alpha: p.random(0.5, 1)
          });
        }
      }
    };

    p.draw = () => {
      p.background(theme === 'dark' ? '#2b2a4c' : '#f8e1e9');
      // 绘制四季树（背景）
      p.image(p.loadImage(treeSvg), 0, 0, p.width / 4, p.height / 4);
      // 绘制夜空（20:00–04:00）
      if (hours >= 20 || hours < 4) {
        stars.forEach(star => {
          p.fill(255, 255, 255, star.alpha * 255);
          p.noStroke();
          p.ellipse(star.x, star.y, star.size);
          star.alpha = p.sin(p.frameCount * 0.01 + star.x) * 0.5 + 0.5; // 闪烁
        });
        // 流星（随机）
        if (p.random() < 0.01) {
          p.stroke(255);
          p.line(p.random(p.width), 0, p.random(p.width), 50);
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  new p5(sketch, canvas);
}
