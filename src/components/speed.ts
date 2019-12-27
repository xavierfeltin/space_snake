import { IComponent } from '../ecs_engine';

export class Speed implements IComponent {
  kind = 'Speed';

  public value: number;
  constructor(speed: number) {
    this.value = speed;
  }
}