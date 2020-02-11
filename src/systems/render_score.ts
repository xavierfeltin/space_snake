import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Score } from '../components/score';

export class RenderScore implements System<UpdateContext> {
  name = 'RenderScore';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Score']);

    debugger;

    for (let [entity, componentsMap] of entities.entries()) {
      const score = componentsMap.get('Score') as Score;
      const ctx: CanvasRenderingContext2D = context.canvas2D;
      this.render(score, ctx);
    }
  }

  private render(score: Score, ctx: CanvasRenderingContext2D) {
    const x = 5;
    const y = 25;

    ctx.save(); // save current state

    ctx.fillStyle = "white";
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score.score,x , y);

    ctx.restore(); // restore original states (no rotation etc)
  }
}