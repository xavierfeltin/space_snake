import { EntityManager, System, IComponent } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Position } from '../components/position';
import { Vect2D } from '../utils/vect2D';
import { Area } from '../components/area';
import { Radar } from '../components/radar';
import { MyMath } from '../utils/math';
import { Orientation } from '../components/orientation';

export class SignalRadar implements System<UpdateContext> {
  name = 'SignalRadar';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['RigidBody', 'Position'], ['Ship']);
    const playerEntities = em.select(['Radar', 'Position', 'Ship', 'Orientation']);
    const area = em.selectGlobal('area')?.get('Area') as Area;

    for (let [entity, componentsMap] of playerEntities.entries()) {
        const radar = componentsMap.get('Radar') as Radar;
        const positionShip = componentsMap.get('Position') as Position;
        const orientationShip = componentsMap.get('Orientation') as Orientation;

        if (!positionShip || !radar) {
            continue;
        }

        radar.state = this.computeRadar(radar, positionShip, area, entities);
        radar.direction = this.computeBeaconDirection(positionShip, orientationShip, entities);

        em.addComponents(entity, radar);
    }
  }

  private computeRadar(radar: Radar, positionShip: Position, area: Area, entities:  Map<string, Map<string, IComponent>>) : number[]{
    const beginX = 0; //positionShip?.position.x - (0.5 * radar.cellSize * radar.size);
    const beginY = 0; //positionShip?.position.y - (0.5 * radar.cellSize * radar.size);
    let radarX = beginX;
    let radarY = beginY;

    const newState = [...area.cartography];

    for (let [entityObject, componentsMapObjects] of entities.entries()) {
      const pos = componentsMapObjects.get('Position') as Position;
      const x = Math.floor(pos.position.x / 40);
      const y = Math.floor(pos.position.y / 40);
      newState[y * area.widthMap + x] = 1;
    }

    const x = Math.floor(positionShip.position.x / 40);
    const y = Math.floor(positionShip.position.y / 40);
    newState[y * area.widthMap + x] = 2;

    /*
    for (let i = 0; i < radar.height; i++)
    {
        for (let j = 0; j < radar.width; j++) {
            const indexCell = i * radar.width + j;
            const topLeftCorner = new Vect2D(radarX, radarY);
            const bottomRightCorner = new Vect2D(radarX + radar.cellSize, radarY + radar.cellSize);
            newState[indexCell] = 0;

            // Check against game objects
            for (let [entityObject, componentsMapObjects] of entities.entries()) {
                const pos = componentsMapObjects.get('Position') as Position;
                if (MyMath.isPointInRectangle(topLeftCorner, bottomRightCorner, pos.position)) {
                    newState[indexCell] = 1;
                }
            }

            // Check against game area
            if (area.cartography[indexCell] == -1) {
              newState[indexCell] = area.cartography[indexCell];
            }

            //if (topLeftCorner.x < 0 || bottomRightCorner.x > area.width || topLeftCorner.y < 0 || bottomRightCorner.y > area.height) {
            //    newState[indexCell] = -1;
            //}

            radarX = radarX + radar.cellSize;
        }
        radarX = beginX;
        radarY = radarY + radar.cellSize;
    }
    */

    return newState;
  }

  private computeBeaconDirection(posShip: Position, orientationShip: Orientation, entities:  Map<string, Map<string, IComponent>>): number {

    let direction = -1;
    // Check against game objects
    for (let [entityObject, componentsMapObjects] of entities.entries()) {
        const pos = componentsMapObjects.get('Position') as Position;
        direction = MyMath.getCardinalDirection(posShip.position, orientationShip.heading, pos.position);
        break; // take the firs tone
    }

    return direction;
  }
}