import { IComponent } from '../ecs_engine';

export class Renderer implements IComponent {
  kind = 'Renderer';

  public color: string;
  public width: number;
  public height: number;

  constructor(color: string, w: number, h: number) {
    this.color = color;
    this.width = w;
    this.height = h;
  }
}