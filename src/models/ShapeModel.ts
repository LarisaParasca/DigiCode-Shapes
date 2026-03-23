export type ShapeType = 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle' | 'ellipse' | 'random';

const polyArea = (n: number, r: number): number => (n * r * r * Math.sin((2 * Math.PI) / n)) / 2;

function shoelaceArea(pts: ReadonlyArray<number>): number {
  let area = 0;
  const n = pts.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i * 2] * pts[j * 2 + 1];
    area -= pts[j * 2] * pts[i * 2 + 1];
  }
  return Math.abs(area) / 2;
}

export class ShapeModel {
  x: number;
  y: number;
  vy: number = 0;
  readonly type: ShapeType;
  color: number;
  readonly size: number;
  readonly vertices?: ReadonlyArray<number>;

  constructor(x: number, y: number, type: ShapeType, color: number, size: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = size;

    if (type === 'random') {
      const sides = 6 + Math.floor(Math.random() * 4);
      const pts: number[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const r = size * (0.5 + Math.random() * 0.5);
        pts.push(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      this.vertices = pts;
    }
  }

  update(dt: number, gravity: number): void {
    this.vy += gravity * dt;
    this.y  += this.vy * dt;
  }

  get area(): number {
    const r = this.size;
    switch (this.type) {
      case 'triangle': return polyArea(3, r);
      case 'square':   return polyArea(4, r);
      case 'pentagon': return polyArea(5, r);
      case 'hexagon':  return polyArea(6, r);
      case 'circle':   return Math.PI * r * r;
      case 'ellipse':  return Math.PI * (r * 1.5) * (r * 0.7);
      case 'random':   return shoelaceArea(this.vertices!);
    }
  }
}
