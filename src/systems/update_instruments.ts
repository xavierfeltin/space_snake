import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Position } from '../components/position';
import { Radar } from '../components/radar';

export class UpdateInstruments implements System<UpdateContext> {
  name = 'UpdateInstruments';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Position', 'Radar']);

    for (let [entity, componentsMap] of entities.entries()) {
      const pos = componentsMap.get('Position') as Position;
      const rad = componentsMap.get('Radar') as Radar;

      rad.center = [
        pos.position[0],
        pos.position[1]
      ];

      em.addComponents(entity, rad);
    }
  }
}