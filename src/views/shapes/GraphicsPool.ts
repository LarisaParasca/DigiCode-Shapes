import { Graphics } from 'pixi.js';
import { ShapeModel } from '../../models/ShapeModel';
import { ShapeFactory } from './ShapeFactory';

export class GraphicsPool {
  private dormant: Graphics[] = [];

  acquire(model: ShapeModel): Graphics {
    const g = this.dormant.pop() ?? new Graphics();
    ShapeFactory.drawInto(g, model.type, model.size, model.color, model.vertices);
    g.x = model.x;
    g.y = model.y;
    g.visible = true;
    return g;
  }

  release(g: Graphics): void {
    g.removeAllListeners(); // prevent listener accumulation on reused objects
    g.clear();
    g.visible = false;
    this.dormant.push(g);
  }

}
