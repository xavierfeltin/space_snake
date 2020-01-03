import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Collisions } from '../components/collision';
import { RigidBody } from '../components/rigid_body';
import { Position } from '../components/position';
import { FrameTime } from '../components/frame_time';
import { Collision } from '../utils/utls';

export class DetectCollisions implements System<UpdateContext> {
  name = 'DetectCollisions';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['RigidBody', 'Position'], ['HasToBeDeleted']);
    const collisionEntity = em.selectGlobal('collisions');
    const collisions = collisionEntity.get('collisions') as Collisions;

    const frameEntity = em.selectGlobal('frame');
    const frameTime = frameEntity.get('frame') as FrameTime;

    const firstCollision: Collision = {A: '', B: '', t: -1.0};
    const currentCollision: Collision = {A: '', B: '', t: -1.0};

    for (let [entityA, componentsMap] of entities.entries()) {
        const rbA = componentsMap.get('RigidBody') as RigidBody;
        const posA = componentsMap.get('Position') as Position;

        for (let [entityB, componentsMap] of entities.entries()) {
            const rbB = componentsMap.get('RigidBody') as RigidBody;
            const posB = componentsMap.get('Position') as Position;

            // detect collisions
        }
    }

    if (firstCollision.t !== -1) {
      frameTime.time = firstCollision ? (frameTime.time + firstCollision.t) : 1.0;
      collisions.addCollision(firstCollision);
    }

    em.addComponents('collisions', collisions);
    em.addComponents('frame', frameTime);
  }
}