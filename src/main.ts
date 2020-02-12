import { version } from '@tensorflow/tfjs';
import { Application } from './application';
import { BasicAgent } from './agents/basic_agent';

function startGame(canvas: HTMLCanvasElement) {
  if (canvas && canvas.getContext) {

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const agent = new BasicAgent();
      const app = new Application(ctx);
      app.init();
      app.addAgent(agent);
      app.run();
    }
  }
}

function startLearning() {

}

const mainDiv = document.querySelector('#main');
const canvas = document.querySelector('canvas');
const playButton = document.getElementById("playbutton");
const learnButton = document.getElementById("learnbutton");

if (mainDiv) {
  mainDiv.textContent = `Tensorflow JS version: ${version.tfjs}`;
}

if (playButton) {
  playButton.addEventListener("click", (e:Event) => startGame(canvas));
}

if (learnButton) {
  learnButton.addEventListener("click", (e:Event) => startLearning());
}
