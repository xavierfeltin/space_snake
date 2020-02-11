import { version } from '@tensorflow/tfjs';
import { Application } from './application';

const mainDiv = document.querySelector('#main');
const canvas = document.querySelector('canvas');

if (mainDiv) {
  mainDiv.textContent = `Tensorflow JS version: ${version.tfjs}`;
}

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const app = new Application(ctx);
    app.run();
  }
}