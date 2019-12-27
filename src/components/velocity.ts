import { IComponent } from '../ecs_engine';
import { Vector2 } from '../utils/utls';

export class Velocity implements IComponent {
  kind = 'Velocity';

  public velocity: Vector2;
  constructor(public vel: Vector2) {
    this.velocity = vel;
  }
}