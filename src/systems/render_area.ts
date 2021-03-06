import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Renderer } from '../components/renderer';
import { Area } from '../components/area';

export class RenderArea implements System<UpdateContext> {
  name = 'RenderArea';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const renderer = em.selectGlobal('area')?.get('Renderer') as Renderer;
    const ctx: CanvasRenderingContext2D = context.canvas2D;
    this.render(renderer, ctx);
  }

  private render(renderer: Renderer, ctx: CanvasRenderingContext2D) {
    const x = 0;
    const y = 0;
    const w = renderer.width;
    const h = renderer.height;

    ctx.clearRect(x, y, w, h);
    ctx.save(); // save current state
    ctx.canvas.height = h;
    ctx.canvas.width = w;
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, w, h);
    ctx.restore(); // restore original states (no rotation etc)
  }
}