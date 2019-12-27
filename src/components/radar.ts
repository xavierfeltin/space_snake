import { IComponent } from '../ecs_engine';
import { Vector2 } from '../utils/utls';

export class Radar implements IComponent {
  kind = 'Radar';

  public radius: number;
  public layers: number;
  public sections: number;
  public state: number[];
  public center: Vector2;

  constructor(r: number, l: number, s: number, c: Vector2) {
    this.radius = r;
    this.layers = l;
    this.sections = s;
    this.center = c;
    this.state = new Array<number>(this.radius * this.layers).fill(0);
  }
}