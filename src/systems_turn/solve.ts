import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { TurnAction } from '../components/turn_action';
import { Inputs } from '../components/inputs';

export class TurnSolve implements System<UpdateContext> {
  name = 'TurnSolve';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const inputs = em.selectGlobal('inputs')?.get('Inputs') as Inputs;
    const entities = em.select(['Ship']);

    for (let [entity, componentsMap] of entities.entries()) {
      for (let input of inputs.inputs)
      {
        if (input === 'left') {
          const turnLeftComponent = new TurnAction(-90);
          em.addComponents(entity, turnLeftComponent);
        }
        else if (input === 'right') {
          const turnRightComponent = new TurnAction(90);
          em.addComponents(entity, turnRightComponent);
        }
        else if ((input === 'straight')) {
          const moveForwardComponent = new TurnAction(0);
          em.addComponents(entity, moveForwardComponent);
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