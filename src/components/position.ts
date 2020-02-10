import { IComponent } from '../ecs_engine';
import { Vect2D } from '../utils/vect2D';

export class Position implements IComponent {
  kind = 'Position';

  public position: Vect2D;
  constructor(public pos: Vect2D) {
    this.position = pos;
  }
}