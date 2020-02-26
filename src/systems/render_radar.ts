import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Radar } from '../components/radar';
import { Position } from '../components/position';
import { cos } from '@tensorflow/tfjs';
import { Vect2D } from '../utils/vect2D';

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
    const x = pos.position.x;
    const y = pos.position.y;

    const beginX = (x - (0.5 * radar.cellSize * radar.size) + 0.5) | 0;
    const beginY = (y - (0.5 * radar.cellSize * radar.size) + 0.5) | 0;
    let currentX = beginX;
    let currentY = beginY;
    const color = 'rgba(178, 34, 34)';

    debugger;
    for (let i = 0; i < radar.size; i++)
    {
      for (let j = 0; j < radar.size; j++) {
        const topLeftCorrner = new Vect2D(currentX, currentY);
        this.renderCell(topLeftCorrner, radar.cellSize, color, ctx);

        //ctx.globalAlpha = 0.2;
        this.colorCell(topLeftCorrner, radar.state[i*radar.size+j], radar.cellSize, ctx);
        //ctx.globalAlpha = 1.0;

        currentX = currentX + radar.cellSize;
        ctx.restore(); // save current state
      }
      currentX = beginX;
      currentY = currentY + radar.cellSize;
    }

    ctx.restore(); // restore original states (no rotation etc)
  }

  private renderCell(pos: Vect2D, size: number, color: string, ctx: CanvasRenderingContext2D) {
    ctx.save(); // save current state

    ctx.beginPath();
    ctx.strokeStyle = color;

    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + size, pos.y);

    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y + size);

    ctx.moveTo(pos.x + size, pos.y);
    ctx.lineTo(pos.x + size, pos.y + size);

    ctx.moveTo(pos.x, pos.y + size);
    ctx.lineTo(pos.x + size, pos.y + size);

    ctx.stroke();

    ctx.restore(); // save current state
  }

  private colorCell(pos: Vect2D, state: number, size: number, ctx: CanvasRenderingContext2D) {
    if (state == 0) {
      return;
    }

    ctx.save(); // save current state

    if (state == 1) {
      ctx.fillStyle = "green";
    } else if (state == 2) {
      ctx.fillStyle = "red";
    }

    ctx.globalAlpha = 0.4;
    ctx.fillRect(pos.x, pos.y, size, size);

    ctx.restore(); // save current state
  }

  /*
  private render(radar: Radar, pos: Position, ctx: CanvasRenderingContext2D) {
    const x = pos.position.x;
    const y = pos.position.y;

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

  */
}