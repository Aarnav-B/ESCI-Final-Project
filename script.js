const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
  });
}

class MazeDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }

  reset() {
    this.cols = 10;
    this.rows = 7;
    this.cellSize = Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows);
    this.offsetX = (this.canvas.width - this.cols * this.cellSize) / 2;
    this.offsetY = (this.canvas.height - this.rows * this.cellSize) / 2;
    this.tick = 0;

    this.walkable = new Set([
      '0,3','1,3','2,3','3,3','4,3','5,3','6,3','7,3','8,3','9,3',
      '2,2','2,1','5,2','5,1','7,2','7,1',
      '3,4','3,5','6,4','6,5'
    ]);

    this.start = { x: 0, y: 3 };
    this.end = { x: 9, y: 3 };
    this.intensity = new Map();
    this.trail = new Map();
    this.order = [
      '0,3','1,3','2,3','2,2','2,1','3,3','4,3','5,3','5,2','5,1','6,3','7,3','7,2','7,1','8,3','9,3',
      '3,4','3,5','6,4','6,5'
    ];
    this.animate();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  drawCell(x, y, alpha, isTrail = false) {
    const size = this.cellSize;
    const px = this.offsetX + x * size;
    const py = this.offsetY + y * size;
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = isTrail ? `rgba(141, 156, 147, ${alpha})` : `rgba(198, 255, 111, ${alpha})`;
    ctx.shadowColor = isTrail ? 'rgba(120, 130, 125, 0.15)' : 'rgba(200, 255, 115, 0.65)';
    ctx.shadowBlur = isTrail ? 0 : 14;
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 4, size - 8, size - 8, 10);
    ctx.fill();
    ctx.restore();
  }

  drawBase() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.fillStyle = 'rgba(223, 240, 230, 0.04)';
    this.walkable.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      const size = this.cellSize;
      const px = this.offsetX + x * size;
      const py = this.offsetY + y * size;
      ctx.beginPath();
      ctx.roundRect(px + 7, py + 7, size - 14, size - 14, 10);
      ctx.fill();
    });
    ctx.restore();

    this.drawFood(this.start.x, this.start.y, 'Start');
    this.drawFood(this.end.x, this.end.y, 'Food');
  }

  drawFood(x, y, label) {
    const size = this.cellSize;
    const px = this.offsetX + x * size + size / 2;
    const py = this.offsetY + y * size + size / 2;
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(140, 230, 177, 0.95)';
    ctx.shadowColor = 'rgba(140, 230, 177, 0.55)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(232, 242, 237, 0.85)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(label, px - 16, py - 16);
    ctx.restore();
  }

  updateState() {
    this.tick += 1;

    const exploreLength = Math.min(this.order.length, Math.floor(this.tick / 10));
    for (let i = 0; i < exploreLength; i += 1) {
      const key = this.order[i];
      this.intensity.set(key, 0.95);
      this.trail.set(key, Math.min(0.9, (this.trail.get(key) || 0) + 0.02));
    }

    const deadEnds = ['2,2','2,1','5,2','5,1','7,2','7,1','3,4','3,5','6,4','6,5'];
    if (this.tick > 130) {
      deadEnds.forEach((key) => {
        const current = this.intensity.get(key) || 0;
        this.intensity.set(key, Math.max(0, current - 0.025));
      });
    }

    const finalPath = ['0,3','1,3','2,3','3,3','4,3','5,3','6,3','7,3','8,3','9,3'];
    if (this.tick > 155) {
      finalPath.forEach((key) => {
        const current = this.intensity.get(key) || 0;
        this.intensity.set(key, Math.min(1, current + 0.02));
      });
    }

    if (this.tick > 260) {
      this.tick = 110;
    }
  }

  render() {
    this.drawBase();

    this.trail.forEach((alpha, key) => {
      const [x, y] = key.split(',').map(Number);
      this.drawCell(x, y, Math.min(0.45, alpha), true);
    });

    this.intensity.forEach((alpha, key) => {
      if (alpha <= 0.01) return;
      const [x, y] = key.split(',').map(Number);
      this.drawCell(x, y, alpha, false);
    });

    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(228, 239, 233, 0.74)';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Exploration first, pruning later, shortest useful route remains.', 20, 28);
    ctx.restore();
  }

  animate() {
    this.updateState();
    this.render();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.animate());
  }
}

class NetworkDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }

  reset() {
    this.tick = 0;
    this.nodes = [
      { x: 110, y: 175, label: 'Central' },
      { x: 70, y: 95, label: 'A' },
      { x: 190, y: 82, label: 'B' },
      { x: 280, y: 120, label: 'C' },
      { x: 350, y: 80, label: 'D' },
      { x: 435, y: 128, label: 'E' },
      { x: 210, y: 195, label: 'F' },
      { x: 300, y: 210, label: 'G' },
      { x: 392, y: 220, label: 'H' },
      { x: 150, y: 285, label: 'I' },
      { x: 255, y: 300, label: 'J' },
      { x: 365, y: 300, label: 'K' }
    ];

    this.edges = [
      [0,1],[0,2],[0,6],[0,9],
      [1,2],[1,6],[2,3],[2,6],[2,7],
      [3,4],[3,6],[3,7],[3,8],
      [4,5],[4,8],[5,8],[5,11],
      [6,7],[6,9],[6,10],
      [7,8],[7,10],[7,11],
      [8,11],[9,10],[10,11]
    ];

    this.edgeWeight = new Map();
    this.strengthSequence = [
      [0,1],[0,2],[2,3],[3,4],[4,5],[3,7],[7,8],[8,11],[7,10],[10,9],[9,0],[6,7],[0,6]
    ];

    this.animate();
  }

  edgeKey(a, b) {
    return `${Math.min(a, b)}-${Math.max(a, b)}`;
  }

  updateState() {
    this.tick += 1;
    const visible = Math.min(this.strengthSequence.length, Math.floor(this.tick / 16));

    this.edges.forEach(([a, b]) => {
      const key = this.edgeKey(a, b);
      const already = this.edgeWeight.get(key) || 0.1;
      this.edgeWeight.set(key, Math.max(0.08, already - 0.003));
    });

    for (let i = 0; i < visible; i += 1) {
      const [a, b] = this.strengthSequence[i];
      const key = this.edgeKey(a, b);
      const current = this.edgeWeight.get(key) || 0.1;
      this.edgeWeight.set(key, Math.min(1, current + 0.045));
    }

    if (this.tick > 300) {
      this.tick = 90;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.fillStyle = 'rgba(228, 239, 233, 0.74)';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Dense exploration gradually resolves into a stronger, efficient network.', 20, 28);
    ctx.restore();

    this.edges.forEach(([a, b]) => {
      const n1 = this.nodes[a];
      const n2 = this.nodes[b];
      const w = this.edgeWeight.get(this.edgeKey(a, b)) || 0.08;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(120, 150, 140, ${0.12 + w * 0.7})`;
      ctx.lineWidth = 1 + w * 7;
      ctx.shadowColor = `rgba(200, 255, 115, ${w * 0.28})`;
      ctx.shadowBlur = w > 0.3 ? 12 : 0;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
      ctx.restore();
    });

    this.nodes.forEach((node, index) => {
      ctx.save();
      const radius = index === 0 ? 12 : 8;
      ctx.fillStyle = index === 0 ? 'rgba(140, 230, 177, 1)' : 'rgba(205, 255, 120, 0.95)';
      ctx.shadowColor = 'rgba(200, 255, 115, 0.55)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(236, 245, 239, 0.82)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(node.label, node.x + 10, node.y - 10);
      ctx.restore();
    });
  }

  animate() {
    this.updateState();
    this.render();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.animate());
  }
}

const mazeCanvas = document.getElementById('mazeCanvas');
const networkCanvas = document.getElementById('networkCanvas');

let mazeDemo;
let networkDemo;

if (mazeCanvas) {
  mazeDemo = new MazeDemo(mazeCanvas);
  document.getElementById('resetMaze')?.addEventListener('click', () => mazeDemo.reset());
}

if (networkCanvas) {
  networkDemo = new NetworkDemo(networkCanvas);
  document.getElementById('resetNetwork')?.addEventListener('click', () => networkDemo.reset());
}
