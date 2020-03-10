import { IComponent } from '../ecs_engine';

export class GameState implements IComponent {
  kind = 'GameState';

  private state: number = -1;
  private success: boolean = false;

  constructor() {
    this.running();
  }

  public running() {
    this.state = 1;
  }

  public ending(isSuccess: boolean) {
    this.state = 0;
    this.success = isSuccess;
  }

  public isRunning() {
      return this.state === 1;
  }

  public isEnding() {
      return this.state === 0;
  }

  public isSuccess() {
    return this.success;
  }
}