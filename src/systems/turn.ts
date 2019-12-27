import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Orientation } from '../components/orientation';
import { TurnAction } from '../components/turn_action';

export class Turn implements System<UpdateContext> {
  name = 'Turn';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['TurnAction', 'Orientation']);

    for (let [entity, componentsMap] of entities.entries()) {
      const rotation = componentsMap.get('TurnAction') as TurnAction;
      const orientation = componentsMap.get('Orientation') as Orientation;

      orientation.angle += rotation.angle;

      em.addComponents(entity, orientation);
      em.removeComponent(entity, rotation);
    }
  }
}