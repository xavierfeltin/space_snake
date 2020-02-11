import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { TurnAction } from '../components/turn_action';
import { Inputs } from '../components/inputs';

export class Solve implements System<UpdateContext> {
  name = 'Solve';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const inputsEntity = em.selectGlobal('inputs');
    const entities = em.select(['Ship']);
    const inputs = inputsEntity.get('inputs') as Inputs;

    for (let [entity, componentsMap] of entities.entries()) {
      for (let input of inputs.inputs)
      {
        if (input === 'left') {
          const turnLeftComponent = new TurnAction(-10);
          em.addComponents(entity, turnLeftComponent);
        }
        else if (input === 'right') {
          const turnRightComponent = new TurnAction(10);
          em.addComponents(entity, turnRightComponent);
        }
      }

      // Get information on world seen by the ship
      // Solve environment
      // Add selected actions to component of the ship
      // else: go straight
    }
    inputs.reset();
    em.addComponents('inputs', inputs);
  }
}