import { IComponent } from '../ecs_engine';

export class Radar implements IComponent {
  kind = 'Radar';

  public radius: number;
  public layers: number;
  public sections: number;
  public state: number[];

  constructor(r: number, l: number, s: number) {
    this.radius = r;
    this.layers = l;
    this.sections = s;
    this.state = new Array<number>(this.radius * this.layers).fill(0);
  }
}