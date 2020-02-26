import { IComponent } from '../ecs_engine';

export class Radar implements IComponent {
  kind = 'Radar';

  public cellSize: number;
  public size: number;
  public state: number[];

  constructor(cellSize: number, s: number) {
    this.cellSize = cellSize;
    this.size = s;
    this.state = new Array<number>(this.size * this.size).fill(0);
  }
}