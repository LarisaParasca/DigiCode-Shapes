import { Ticker } from 'pixi.js';
import { GameModel } from '../models/GameModel';
import { ShapeModel, ShapeType } from '../models/ShapeModel';
import { GameView } from '../views/GameView';

const SHAPE_TYPES: ShapeType[] = ['triangle', 'square', 'pentagon', 'hexagon', 'circle', 'ellipse', 'random'];

const SPAWN_RATE_MIN  = 1;
const SPAWN_RATE_MAX  = 20;
const SPAWN_RATE_STEP = 1;
const GRAVITY_MIN     = 0;
const GRAVITY_MAX     = 2000;
const GRAVITY_STEP    = 50;

export class GameController {
  private model: GameModel;
  private view: GameView;
  private spawnTimer: number = 0;

  constructor(model: GameModel, view: GameView) {
    this.model = model;
    this.view = view;
  }

  start(): void {
    this.model.start();

    this.view.onSpawnDec   = this.onSpawnDec;
    this.view.onSpawnInc   = this.onSpawnInc;
    this.view.onGravityDec = this.onGravityDec;
    this.view.onGravityInc = this.onGravityInc;
    this.view.onAreaClick  = this.onAreaClick;
    this.view.onShapeClick = this.onShapeClick;

    this.view.addTick(this.update);
    window.addEventListener('resize', this.onResize);

    this.view.updateControls(this.model.spawnRate, this.model.gravity);
  }

  stop(): void {
    this.model.stop();
    this.view.removeTick(this.update);
    this.view.destroy();
    window.removeEventListener('resize', this.onResize);

    this.view.onSpawnDec   = null;
    this.view.onSpawnInc   = null;
    this.view.onGravityDec = null;
    this.view.onGravityInc = null;
    this.view.onAreaClick  = null;
    this.view.onShapeClick = null;
  }

  private update = (ticker: Ticker): void => {
    if (!this.model.running) return;

    const dt = ticker.deltaMS / 1000;
    const bounds = this.view.gameAreaBounds;

    this.model.step(dt);

    for (let i = this.model.shapes.length - 1; i >= 0; i--) {
      const shape = this.model.shapes[i];
      if (shape.y > bounds.y + bounds.height + shape.size) {
        this.view.removeShape(shape);
        this.model.removeShape(shape);
      }
    }

    this.view.syncShapes(this.model.shapes);
    this.view.updateStats(this.model.shapes.length, this.model.totalArea);

    this.spawnTimer += dt;
    if (this.spawnTimer >= 1 / this.model.spawnRate) {
      this.spawnTimer -= 1 / this.model.spawnRate;
      this.spawnShape();
    }
  }

  private onAreaClick = (x: number, y: number): void => {
    this.createShape(x, y);
  };

  private spawnShape(): void {
    const bounds = this.view.gameAreaBounds;
    const size = 20 + Math.floor(Math.random() * 25);
    const x = bounds.x + size + Math.random() * (bounds.width - size * 2);
    const y = bounds.y - size;
    this.createShape(x, y, size);
  }

  private createShape(x: number, y: number, size = 20 + Math.floor(Math.random() * 25)): void {
    const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    const shape = new ShapeModel(x, y, type, Math.random() * 0xffffff, size);
    this.model.addShape(shape);
    this.view.addShape(shape);
  }

  private onShapeClick = (clicked: ShapeModel): void => {
    const sameType = this.model.shapes.filter(s => s.type === clicked.type);
    if (sameType.length === 1) {
      this.view.removeShape(clicked);
      this.model.removeShape(clicked);
    } else {
      const newColor = Math.random() * 0xffffff;
      this.model.recolorType(clicked.type, newColor);
      for (const shape of sameType) {
        this.view.redrawShape(shape);
      }
    }
  };

  private onSpawnDec = (): void => {
    this.model.spawnRate = Math.max(SPAWN_RATE_MIN, this.model.spawnRate - SPAWN_RATE_STEP);
    this.view.updateControls(this.model.spawnRate, this.model.gravity);
  };

  private onSpawnInc = (): void => {
    this.model.spawnRate = Math.min(SPAWN_RATE_MAX, this.model.spawnRate + SPAWN_RATE_STEP);
    this.view.updateControls(this.model.spawnRate, this.model.gravity);
  };

  private onGravityDec = (): void => {
    this.model.gravity = Math.max(GRAVITY_MIN, this.model.gravity - GRAVITY_STEP);
    this.view.updateControls(this.model.spawnRate, this.model.gravity);
  };

  private onGravityInc = (): void => {
    this.model.gravity = Math.min(GRAVITY_MAX, this.model.gravity + GRAVITY_STEP);
    this.view.updateControls(this.model.spawnRate, this.model.gravity);
  };

  private onResize = (): void => {
    this.view.resize(window.innerWidth, window.innerHeight);
  };
}
