import { IComponent } from '../ecs_engine';
import { Vector2 } from '../utils/utls';

export class Orientation implements IComponent {
  kind = 'Orientation';

  public angle: number; //in degrees
  public heading: Vector2;
  constructor(public theta: number) {
    this.angle = theta;
    this.heading = [0, 0];
  }
}