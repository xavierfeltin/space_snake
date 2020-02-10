import { IComponent } from '../ecs_engine';
import { Vect2D } from '../utils/vect2D';

export class Orientation implements IComponent {
  kind = 'Orientation';

  public angle: number; //in degrees
  public heading: Vect2D;
  constructor(public theta: number) {
    this.angle = theta;
    this.heading = new Vect2D(0, 0);
  }
}