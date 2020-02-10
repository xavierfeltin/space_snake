import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { FrameTime } from '../components/frame_time';
import { frame } from '@tensorflow/tfjs';

export class Move implements System<UpdateContext> {
  name = 'Move';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Position', 'Velocity']);

    const frameEntity = em.selectGlobal('frame');
    const frameTime = frameEntity.get('frame') as FrameTime;
    const time = frameTime.time;

    for (let [entity, componentsMap] of entities.entries()) {
      const pos = componentsMap.get('Position') as Position;
      const vel = componentsMap.get('Velocity') as Velocity;

      pos.position.x = pos.position.x + vel.velocity.x * time;
      pos.position.y = pos.position.y + vel.velocity.y * time;

      em.addComponents(entity, pos);
    }
  }
}