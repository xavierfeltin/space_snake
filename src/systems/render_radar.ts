import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Radar } from '../components/radar';
import { Position } from '../components/position';
import { cos } from '@tensorflow/tfjs';

export class RenderRadar implements System<UpdateContext> {
  name = 'RenderRadar';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Radar', 'Position']);

    const ctx: CanvasRenderingContext2D = context.canvas2D;

    for (let [entity, componentsMap] of entities.entries()) {
      const radar = componentsMap.get('Radar') as Radar;
      const pos = componentsMap.get('Position') as Position;
      this.render(radar, pos, ctx);
    }
  }

  private render(radar: Radar, pos: Position, ctx: CanvasRenderingContext2D) {
    const x = pos.position[0];
    const y = pos.position[1];

    const angleMainSection = Math.ceil(360 / radar.sections);
    const distBtwLayers = Math.ceil(radar.radius / radar.layers);

    ctx.save(); // save current state

    const color = 'rgba(178, 34, 34)';

    let currentDist = 0;
    for (let i = 0; i < radar.layers; i++)
    {
      const newDist = Math.min(currentDist + distBtwLayers, radar.radius);
      currentDist = newDist;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.arc(x, y, currentDist, 0, Math.PI * 2);
      ctx.stroke();
    }

    let currentAngle = 0;
    for (let i = 0; i < radar.sections; i++)
    {
      const newAngle = Math.min(currentAngle + angleMainSection, 360);
      currentAngle = newAngle;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(newAngle * Math.PI / 180) * radar.radius, y + Math.sin(newAngle * Math.PI / 180) * radar.radius);
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    ctx.restore(); // restore original states (no rotation etc)
  }
}