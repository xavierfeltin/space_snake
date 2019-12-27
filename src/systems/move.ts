import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';

export class Move implements System<UpdateContext> {
  name = 'Move';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Position', 'Velocity']);

    for (let [entity, componentsMap] of entities.entries()) {
      const pos = componentsMap.get('Position') as Position;
      const vel = componentsMap.get('Velocity') as Velocity;

      pos.position = [
        pos.position[0] + vel.velocity[0],
        pos.position[1] + vel.velocity[1]
      ];

      em.addComponents(entity, pos);
    }
  }
}