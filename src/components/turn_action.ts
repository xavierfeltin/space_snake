import { IComponent } from '../ecs_engine';

export class TurnAction implements IComponent {
  kind = 'TurnAction';

  public angle: number;
  constructor(public degrees: number) {
    this.angle = degrees;
  }
}