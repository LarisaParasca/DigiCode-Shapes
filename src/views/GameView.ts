import { Application, Container, Graphics, Ticker } from 'pixi.js';
import { ShapeModel } from '../models/ShapeModel';
import { GraphicsPool } from './shapes/GraphicsPool';
import { ShapeFactory } from './shapes/ShapeFactory';

const PADDING = 120;

export class GameView {
  private readonly app: Application;
  private readonly stage: Container;
  private readonly _gameArea: Graphics; 

  onShapeClick:   ((model: ShapeModel) => void) | null = null;
  onAreaClick:    ((x: number, y: number) => void) | null = null;
  onSpawnDec:     (() => void) | null = null;
  onSpawnInc:     (() => void) | null = null;
  onGravityDec:   (() => void) | null = null;
  onGravityInc:   (() => void) | null = null;

  private pool = new GraphicsPool();
  private shapeGraphics = new Map<ShapeModel, Graphics>();

  private readonly _onSpawnDecClick   = (): void => this.onSpawnDec?.();
  private readonly _onSpawnIncClick   = (): void => this.onSpawnInc?.();
  private readonly _onGravityDecClick = (): void => this.onGravityDec?.();
  private readonly _onGravityIncClick = (): void => this.onGravityInc?.();

  private statShapes  = document.getElementById('stat-shapes')  as HTMLInputElement;
  private statArea    = document.getElementById('stat-area')    as HTMLInputElement;
  private ctrlSpawn   = document.getElementById('ctrl-spawn')   as HTMLInputElement;
  private ctrlGravity = document.getElementById('ctrl-gravity') as HTMLInputElement;

  constructor(app: Application) {
    this.app = app;
    this.stage = app.stage;

    this._gameArea = new Graphics();
    this._gameArea.eventMode = 'static';
    this.stage.addChild(this._gameArea);

    this.drawGameArea();
    this.bindEvents();
  }

  private bindEvents(): void {
    document.getElementById('spawn-dec')!  .addEventListener('click', this._onSpawnDecClick);
    document.getElementById('spawn-inc')!  .addEventListener('click', this._onSpawnIncClick);
    document.getElementById('gravity-dec')!.addEventListener('click', this._onGravityDecClick);
    document.getElementById('gravity-inc')!.addEventListener('click', this._onGravityIncClick);

    this._gameArea.on('pointertap', (e) => {
      const { x, y } = e.global;
      this.onAreaClick?.(x, y);
    });
  }

  destroy(): void {
    document.getElementById('spawn-dec')!  .removeEventListener('click', this._onSpawnDecClick);
    document.getElementById('spawn-inc')!  .removeEventListener('click', this._onSpawnIncClick);
    document.getElementById('gravity-dec')!.removeEventListener('click', this._onGravityDecClick);
    document.getElementById('gravity-inc')!.removeEventListener('click', this._onGravityIncClick);
  }

  addTick(fn: (ticker: Ticker) => void, context?: object): void {
    this.app.ticker.add(fn, context);
  }

  removeTick(fn: (ticker: Ticker) => void, context?: object): void {
    this.app.ticker.remove(fn, context);
  }

  get gameAreaBounds() {
    const { width, height } = this.app.screen;
    return { x: PADDING, y: PADDING, width: width - PADDING * 2, height: height - PADDING * 2 };
  }

  addShape(model: ShapeModel): void {
    const g = this.pool.acquire(model);
    g.eventMode = 'static';
    g.cursor = 'pointer';
    g.on('pointertap', (e) => {
      e.stopPropagation();
      this.onShapeClick?.(model);
    });
    this.stage.addChild(g);
    this.shapeGraphics.set(model, g);
  }

  redrawShape(model: ShapeModel): void {
    const g = this.shapeGraphics.get(model);
    if (g) ShapeFactory.drawInto(g, model.type, model.size, model.color, model.vertices);
  }

  removeShape(model: ShapeModel): void {
    const g = this.shapeGraphics.get(model);
    if (g) {
      this.stage.removeChild(g);
      this.pool.release(g);
      this.shapeGraphics.delete(model);
    }
  }

  syncShapes(shapes: ReadonlyArray<ShapeModel>): void {
    for (const model of shapes) {
      const g = this.shapeGraphics.get(model);
      if (g) {
        g.x = model.x;
        g.y = model.y;
      }
    }
  }

  private drawGameArea(): void {
    const { width, height } = this.app.screen;
    this._gameArea.clear();
    this._gameArea
      .rect(PADDING, PADDING, width - PADDING * 2, height - PADDING * 2)
      .fill({ color: 0x2a2a4a })
      .stroke({ color: 0x6666cc, width: 2 });
  }

  updateStats(shapeCount: number, totalArea: number): void {
    this.statShapes.value = String(shapeCount);
    this.statArea.value   = `${Math.round(totalArea)} px²`;
  }

  updateControls(spawnRate: number, gravity: number): void {
    this.ctrlSpawn.value   = `${spawnRate} / sec`;
    this.ctrlGravity.value = `${gravity} px/s²`;
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.drawGameArea();
  }
}
