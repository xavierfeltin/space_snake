import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Radar } from '../components/radar';

export class RenderRadar implements System<UpdateContext> {
  name = 'RenderRadar';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Radar']);

    const ctx: CanvasRenderingContext2D = context.canvas2D;

    for (let [entity, componentsMap] of entities.entries()) {
      const radar = componentsMap.get('Radar') as Radar;
      this.render(radar, ctx);
    }
  }

  private render(radar: Radar, ctx: CanvasRenderingContext2D) {
    const x = radar.center[0];
    const y = radar.center[1];

    ctx.save(); // save current state

    const color = 'rgba(178, 34, 34)';

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(x, y, radar.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore(); // restore original states (no rotation etc)
  }
}