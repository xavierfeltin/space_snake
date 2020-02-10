import { IComponent } from '../ecs_engine';
import { Vect2D } from '../utils/vect2D';

export class Velocity implements IComponent {
  kind = 'Velocity';

  public velocity: Vect2D;
  constructor(public vel: Vect2D) {
    this.velocity = vel;
  }
}