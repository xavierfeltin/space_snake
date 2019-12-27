import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { TurnAction } from '../components/turn_action';

export class Solve implements System<UpdateContext> {
  name = 'Solve';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Ship']);

    for (let [entity, componentsMap] of entities.entries()) {
        // Get information on world seen by the ship

        // Solve environment

        // Add selected actions to component of the ship
        const rand = Math.random() * 100;
        if (rand < 20.0){
            const turnLeftComponent = new TurnAction(-5);
            em.addComponents(entity, turnLeftComponent);
        }
        else if (rand > 80.0) {
            const turnRightComponent = new TurnAction(5);
            em.addComponents(entity, turnRightComponent);
        }
        // else: go straight
    }
  }
}