import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Collisions } from '../components/collision';
import { RigidBody } from '../components/rigid_body';
import { Position } from '../components/position';
import { FrameTime } from '../components/frame_time';
import { Collision } from '../utils/collision';
import { CollisionHelper } from '../utils/collision';
import { Velocity } from '../components/velocity';
import { Vect2D } from '../utils/vect2D';

export class DetectCollisions implements System<UpdateContext> {
  name = 'DetectCollisions';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['RigidBody', 'Position', 'Velocity'], ['HasToBeDeleted']);

    const collisionEntity = em.selectGlobal('collisions');
    const collisions = collisionEntity.get('collisions') as Collisions;

    const previousCollisionEntity = em.selectGlobal('previousCollision');
    const prevCollision = previousCollisionEntity.get('previousCollision') as Collisions;

    const frameEntity = em.selectGlobal('frame');
    const frameTime = frameEntity.get('frame') as FrameTime;

    let firstCollision: Collision = CollisionHelper.createEmptyCollision();
    /*
    if (prevCollision.collisions.length > 0) {
      firstCollision = prevCollision.collisions[0];
    }
    */

    for (let [entityA, componentsMapA] of entities.entries()) {
        const rbA = componentsMapA.get('RigidBody') as RigidBody;
        const posA = componentsMapA.get('Position') as Position;
        const velA = componentsMapA.get('Velocity') as Velocity;

        for (let [entityB, componentsMapB] of entities.entries()) {
          const rbB = componentsMapB.get('RigidBody') as RigidBody;
          const posB = componentsMapB.get('Position') as Position;
          const velB = componentsMapB.get('Velocity') as Velocity;

          let alreadyCollidedThisFrame = false;
          for (const prevColl of prevCollision.collisions) {
            if ((prevColl.idA === entityA && prevColl.idB === entityB)
            || (prevColl.idA === entityB && prevColl.idB === entityA)) {
              alreadyCollidedThisFrame = true;
              break;
            }
          }

          if (entityA !== entityB && !alreadyCollidedThisFrame) {
            // detect collisions
            const newCollision = CollisionHelper.detectCollision(
              entityA, entityB,
              posA.position, posB.position,
              velA.velocity, velB.velocity,
              rbA.radius, rbB.radius,
              firstCollision);

            // If the collision happens earlier than the current one we keep it
            const collisionTime = newCollision.collisionTime + frameTime.time;
            const isNewCollisionHappenedDuringThisFrame = 0.0 <= collisionTime && collisionTime < 1.0;
            const isFirstCollisionEmpty = CollisionHelper.isCollisionEmpty(firstCollision);
            const isNewCollisionHappenedBeforeFirstOne = newCollision.collisionTime < firstCollision.collisionTime;
            if (isNewCollisionHappenedDuringThisFrame && (isFirstCollisionEmpty || isNewCollisionHappenedBeforeFirstOne)) {
              firstCollision = newCollision;
            }
          }
        }
    }

    if (firstCollision.collisionTime !== -1) {
      console.log(JSON.stringify(firstCollision));
      frameTime.time = frameTime.time + firstCollision.collisionTime;
      collisions.addCollision(firstCollision);
    }
    else {
      frameTime.time = 1.0;
    }

    em.addComponents('collisions', collisions);
    em.addComponents('frame', frameTime);
  }
}