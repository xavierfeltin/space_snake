import { version } from '@tensorflow/tfjs';
import { Application } from './application';
import { BasicAgent } from './agents/basic_agent';

function startGame(isTurnBased: boolean, canvas: HTMLCanvasElement) {
  if (canvas && canvas.getContext) {

    if (!ctx) {
      ctx = canvas.getContext('2d');
    }

    if (ctx) {
      app.resetApplication();
      app.setCanvas(ctx);
      app.init(isTurnBased);
      app.addAgent(agent);
      app.run();
    }
  }
}

async function startLearning(isTurnBased: boolean) {
  app.setCanvas(null);
  app.resetApplication();
  app.init(isTurnBased);
  await app.train(agent);
}

const isTurnBased = true;
const mainDiv = document.querySelector('#main');
const canvas = document.querySelector('canvas');
const playButton = document.getElementById("playbutton");
const learnButton = document.getElementById("learnbutton");
let ctx: CanvasRenderingContext2D | null = null;
const agent = new BasicAgent();
let app = new Application(null);

if (mainDiv) {
  mainDiv.textContent = `Tensorflow JS version: ${version.tfjs}`;
}

if (playButton && canvas) {
  playButton.addEventListener("click", (e:Event) => startGame(isTurnBased, canvas));
}

if (learnButton) {
  learnButton.addEventListener("click", (e:Event) => startLearning(isTurnBased));
}
