import { IComponent } from '../ecs_engine';

export class GameState implements IComponent {
  kind = 'GameState';

  private state: number = -1;
  constructor() {
    this.running();
  }

  public running() {
    this.state = 1;
  }

  public ending() {
    this.state = 0;
  }

  public isRunning() {
      return this.state === 1;
  }

  public isEnding() {
      return this.state === 0;
  }
}