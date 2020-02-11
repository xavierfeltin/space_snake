import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Collisions } from '../components/collision';
import { HasToBeDeleted } from '../components/has_to_be_deleted';
import { Score } from '../components/score';
import { Beacon } from '../components/beacon';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { RigidBody } from '../components/rigid_body';
import { Renderer } from '../components/renderer';
import { Vect2D } from '../utils/vect2D';
import { Area } from '../components/area';

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

      let idBeacon = '';
      let idShip = '';
      let scoreComponent = null;

      if (componentsMapA.get('Ship')) {
        idShip = collision.idA;
      }
      else if (componentsMapB.get('Ship')) {
        idShip = collision.idB;
      }

      if (idShip === collision.idA) {
        if (componentsMapB.get('Beacon')) {
          idBeacon = collision.idB;
          scoreComponent = componentsMapA.get('Score') as Score;
        }
      }
      else if (idShip === collision.idB) {
        if (componentsMapA.get('Beacon')) {
          idBeacon = collision.idA;
          scoreComponent = componentsMapB.get('Score') as Score;
        }
      }

      if (idBeacon && idShip) {
        this.deleteBeacon(idBeacon, em);
        this.updateScore(idShip, scoreComponent, em);
        this.spawnBeacon(em);
      }

      prevCollision.collisions.push(collision);
    }

    // Empty the new collisions
    collisions.collisions = [];
    em.addComponents('collisions', collisions);

    // Archive the solved collisions
    em.addComponents('previousCollision', prevCollision);
  }

  private deleteBeacon(idBeacon: string, em: EntityManager<UpdateContext>) {
    const hasToBeDeletedComponent = new HasToBeDeleted();
    em.addComponents(idBeacon, hasToBeDeletedComponent);
  }

  private updateScore(idShip: string, scoreComponent: Score | null, em: EntityManager<UpdateContext>) {
    if (scoreComponent) {
      scoreComponent.increment();
      em.addComponents(idShip, scoreComponent);
    }
  }

  private spawnBeacon(em: EntityManager<UpdateContext>) {
    const entities = em.select(['Area']);
    const sizeBody = 20; //in px

    for (let [entity, componentsMap] of entities.entries()) {
      const area = componentsMap.get('Area') as Area;
      let x = Math.random() * area.width;
      x = Math.max(sizeBody, x);
      x = Math.min(area.width - sizeBody, x);

      let y = Math.random() * area.height;
      y = Math.max(sizeBody, y);
      y = Math.min(area.width - sizeBody, y);

      em.addEntity([
        new Beacon(),
        new Position(new Vect2D(x, y)),
        new Velocity(new Vect2D(0, 0)),
        new RigidBody(20),
        new Renderer('(0,0,0)', 100, 100)
      ]);
    }
  }
}