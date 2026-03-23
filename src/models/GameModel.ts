import { ShapeModel, ShapeType } from './ShapeModel';

export class GameModel {
  private _running: boolean = false;
  gravity: number   = 600; // px/s²
  spawnRate: number = 1;   // shapes/sec

  private _shapes: ShapeModel[] = [];
  get shapes(): ReadonlyArray<ShapeModel> { return this._shapes; }

  get running(): boolean { return this._running; }

  start(): void { this._running = true; }
  stop(): void  { this._running = false; }

  get totalArea(): number {
    return this._shapes.reduce((sum, s) => sum + s.area, 0);
  }

  step(dt: number): void {
    for (const shape of this._shapes) {
      shape.update(dt, this.gravity);
    }
  }

  addShape(shape: ShapeModel): void {
    this._shapes.push(shape);
  }

  removeShape(shape: ShapeModel): void {
    const index = this._shapes.indexOf(shape);
    if (index !== -1) this._shapes.splice(index, 1);
  }

  recolorType(type: ShapeType, color: number): void {
    for (const shape of this._shapes) {
      if (shape.type === type) shape.color = color;
    }
  }
}
