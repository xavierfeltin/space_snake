import { IComponent } from '../ecs_engine';

export class Area implements IComponent {
  kind = 'Area';

  public width: number;
  public height: number;
  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
}