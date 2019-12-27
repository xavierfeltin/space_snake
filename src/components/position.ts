import { IComponent } from '../ecs_engine';
import { Vector2 } from '../utils/utls';

export class Position implements IComponent {
  kind = 'Position';

  public position: Vector2;
  constructor(public pos: Vector2) {
    this.position = pos;
  }
}