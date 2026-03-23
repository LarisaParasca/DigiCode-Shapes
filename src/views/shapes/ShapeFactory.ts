import { Graphics } from 'pixi.js';
import { ShapeType } from '../../models/ShapeModel';

function drawRegularPolygon(g: Graphics, sides: number, radius: number): Graphics {
  const points: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return g.poly(points);
}

export class ShapeFactory {
  static drawInto(g: Graphics, type: ShapeType, size: number, color: number, vertices?: ReadonlyArray<number>): void {
    g.clear();
    switch (type) {
      case 'triangle': drawRegularPolygon(g, 3, size).fill(color); break;
      case 'square':   drawRegularPolygon(g, 4, size).fill(color); break;
      case 'pentagon': drawRegularPolygon(g, 5, size).fill(color); break;
      case 'hexagon':  drawRegularPolygon(g, 6, size).fill(color); break;
      case 'circle':   g.circle(0, 0, size).fill(color); break;
      case 'ellipse':  g.ellipse(0, 0, size * 1.5, size * 0.7).fill(color); break;
      // vertices are generated once at ShapeModel construction — redraws reuse them
      case 'random':   g.poly(vertices as number[]).fill(color); break;
    }
  }

}
