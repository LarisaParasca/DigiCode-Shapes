import { Application } from 'pixi.js';
import { GameModel } from './models/GameModel';
import { GameView } from './views/GameView';
import { GameController } from './controllers/GameController';

const app = new Application();

await app.init({
  resizeTo: window,
  background: 0x1a1a2e,
});

document.body.appendChild(app.canvas);

const model = new GameModel();
const view = new GameView(app);
const controller = new GameController(model, view);

controller.start();
