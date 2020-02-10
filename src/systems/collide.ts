import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Collisions } from '../components/collision';
import { HasToBeDeleted } from '../components/has_to_be_deleted';

export class Collide implements System<UpdateContext> {
  name = 'Collide';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const collisionEntity = em.selectGlobal('collisions');
    const collisions = collisionEntity.get('collisions') as Collisions;

    const previousCollisionEntity = em.selectGlobal('previousCollision');
    const prevCollision = previousCollisionEntity.get('previousCollision') as Collisions;

    // solve collisions
    for (const collision of collisions.collisions)
    {
      const componentsMapA = em.getEntityComponents(collision.idA);
      const componentsMapB = em.getEntityComponents(collision.idB);

      let ship = componentsMapA.get('Ship');
      if(ship)
      {
        let idBeacon = '';
        if (componentsMapA.get('Beacon')) {
          idBeacon = collision.idA;
        }
        else if (componentsMapB.get('Beacon')) {
          ship = componentsMapB.get('Ship');
          idBeacon = collision.idB;
        }

        if (idBeacon) {
          debugger;
          const HasToBeDeletedComponent = new HasToBeDeleted();
          em.addComponents(idBeacon, HasToBeDeletedComponent);
        }
      }

      prevCollision.collisions.push(collision);
    }

    // Empty the new collisions
    collisions.collisions = [];
    em.addComponents('collisions', collisions);

    // Archive the solved collisions
    em.addComponents('previousCollision', prevCollision);
  }
}