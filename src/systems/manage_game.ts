import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { GameState } from '../components/game_state';

export class ManageGame implements System<UpdateContext> {
  name = 'ManageGame';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const gameState = em.selectGlobal('gameState')?.get('GameState') as GameState;
    const entities = em.select(['Ship']);

    if (entities.size == 0) { //only one ship
        gameState.ending();
        em.addComponents('gameState', gameState);
    }
  }
}