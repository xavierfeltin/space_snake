import { IComponent } from '../ecs_engine';

export class Radar implements IComponent {
  kind = 'Radar';

  public cellSize: number;
  public width: number;
  public height: number;
  public state: number[];
  public direction: number | null;

  constructor(cellSize: number, w: number, h: number) {
    this.cellSize = cellSize;
    this.width = w;
    this.height = h;
    this.direction = null;
    this.state = new Array<number>(this.size).fill(0);
  }

  public get size(): number {
    return this.width * this.height;
  }
}