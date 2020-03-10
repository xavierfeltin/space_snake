import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { GameState } from '../components/game_state';

export class ManageGame implements System<UpdateContext> {
  name = 'ManageGame';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const gameState = em.selectGlobal('gameState')?.get('GameState') as GameState;
    const entitiesShip = em.select(['Ship']);
    const entitiesBeacons = em.select(['Beacon']);

    // Player is dead
    if (entitiesShip.size == 0) { //only one ship
      gameState.ending(false);
      em.addComponents('gameState', gameState);
    }
    else if (entitiesBeacons.size == 0) { //get all beacons
      gameState.ending(true);
      em.addComponents('gameState', gameState);
    }
  }
}