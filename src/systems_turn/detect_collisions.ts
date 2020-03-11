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
import { Area } from '../components/area';

export class TurnDetectCollisions implements System<UpdateContext> {
  name = 'TurnDetectCollisions';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['RigidBody', 'Position', 'Velocity'], ['HasToBeDeleted']);

    const collisions = em.selectGlobal('collisions')?.get('Collisions') as Collisions;
    const prevCollision = em.selectGlobal('previousCollision')?.get('Collisions') as Collisions;
    const frameTime = em.selectGlobal('frame')?.get('FrameTime') as FrameTime;
    const area = em.selectGlobal('area')?.get('Area') as Area;

    let firstCollision: Collision = CollisionHelper.createEmptyCollision();

    for (let [entityA, componentsMapA] of entities.entries()) {
      const rbA = componentsMapA.get('RigidBody') as RigidBody;
      const posA = componentsMapA.get('Position') as Position;
      const velA = componentsMapA.get('Velocity') as Velocity;

      // Collision with other objects
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

        // detection between static elements
        if (velA.velocity.norm == 0 && velB.velocity.norm == 0) {
          break;
        }

        // detect collisions
        if (entityA !== entityB && !alreadyCollidedThisFrame) {
          let x = Math.floor(posA.position.x / 40);
          let y = Math.floor(posA.position.y / 40);
          const indexA = y * area.widthMap + x;

          x = Math.floor(posB.position.x / 40);
          y = Math.floor(posB.position.y / 40);
          const indexB = y * area.widthMap + x;

          if (indexA == indexB) {
            const collTime = 0;
            firstCollision = CollisionHelper.createCollision(entityA, entityB, posA.position, posB.position,
              velA.velocity, velB.velocity, rbA.radius, rbB.radius, collTime);
          }
        }
      }

      // Collision with area for moving objects
      if ((velA.velocity.norm > 0)
        && (posA.position.x - rbA.radius < 0.0 || posA.position.x + rbA.radius > area.width
        || posA.position.y - rbA.radius < 0.0 || posA.position.y + rbA.radius > area.height)) {
          const collision = CollisionHelper.createCollision(entityA, 'area', posA.position, new Vect2D(0,0), velA.velocity, new Vect2D(0, 0), rbA.radius, 0, 0);
          firstCollision = collision;
      }
    }

    if (firstCollision.collisionTime != -1) {
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