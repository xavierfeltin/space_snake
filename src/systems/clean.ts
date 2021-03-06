import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';

export class Clean implements System<UpdateContext> {
  name = 'Clean';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['HasToBeDeleted']);

    for (let [entity, componentsMap] of entities.entries()) {
      em.removeEntity(entity);
    }
  }
}