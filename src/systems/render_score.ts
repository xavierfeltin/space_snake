import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Score } from '../components/score';
import { GameState } from '../components/game_state';

export class RenderScore implements System<UpdateContext> {
  name = 'RenderScore';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    let game = em.selectGlobal('gameState')?.get('GameState') as GameState;        

    const entities = em.select(['Score']);
    for (let [entity, componentsMap] of entities.entries()) {
      const score = componentsMap.get('Score') as Score;
      const ctx: CanvasRenderingContext2D = context.canvas2D;
      this.render(score, game.isRunning(), ctx);
    }
  }

  private render(score: Score, gameRunning: boolean, ctx: CanvasRenderingContext2D) {
    const x = 5;
    const y = 25;

    ctx.save(); // save current state

    ctx.fillStyle = "white";
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';

    if (gameRunning) {
      ctx.fillText('Score: ' + score.score,x , y);
    } else {
      ctx.fillText('Game Over',x , y);
    }
    
    ctx.restore(); // restore original states (no rotation etc)
  }
}