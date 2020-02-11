import { IComponent } from '../ecs_engine';

export class Score implements IComponent {
  kind = 'Score';

  public score: number;

  constructor() {
    this.score = 0;
  }

  public increment(): void {
    this.score ++;
  }

  public decrease(): void {
    this.score--;
    this.score = Math.max(0, this.score);
  }
}