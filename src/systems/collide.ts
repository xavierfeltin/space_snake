import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Collisions } from '../components/collision';

export class Collide implements System<UpdateContext> {
  name = 'Collide';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Collisions']);

    for (let [entity, componentsMap] of entities.entries()) {
        const collisions = componentsMap.get('Collisions') as Collisions;

        // solve collisions
    }
  }
}