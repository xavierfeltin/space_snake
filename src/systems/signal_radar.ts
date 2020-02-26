import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Position } from '../components/position';
import { Vect2D } from '../utils/vect2D';
import { Area } from '../components/area';
import { Radar } from '../components/radar';
import { MyMath } from '../utils/math';

export class SignalRadar implements System<UpdateContext> {
  name = 'SignalRadar';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['RigidBody', 'Position'], ['Ship']);
    const playerEntities = em.select(['Radar', 'Position', 'Ship']);
    const area = em.selectGlobal('area')?.get('Area') as Area;

    for (let [entity, componentsMap] of playerEntities.entries()) {
        const radar = componentsMap.get('Radar') as Radar;
        const positionShip = componentsMap.get('Position') as Position;

        if (!positionShip || !radar) {
            continue;
        }

        const beginX = positionShip?.position.x - (0.5 * radar.cellSize * radar.size);
        const beginY = positionShip?.position.y - (0.5 * radar.cellSize * radar.size);
        let radarX = beginX;
        let radarY = beginY;
        for (let i = 0; i < radar.size; i++)
        {
            for (let j = 0; j < radar.size; j++) {
                const indexCell = i*radar.size+j;
                const topLeftCorner = new Vect2D(radarX, radarY);
                const bottomRightCorner = new Vect2D(radarX + radar.cellSize, radarY + radar.cellSize);
                radar.state[indexCell] = 0;

                // Check against game objects
                for (let [entityObject, componentsMapObjects] of entities.entries()) {
                    const pos = componentsMapObjects.get('Position') as Position;
                    if (MyMath.isPointInRectangle(topLeftCorner, bottomRightCorner, pos.position)) {
                        radar.state[indexCell] = 1;
                    }
                }

                // Check against game area
                if (topLeftCorner.x < 0 || bottomRightCorner.x > area.width || topLeftCorner.y < 0 || bottomRightCorner.y > area.height) {
                    radar.state[indexCell] = 2;
                }

                radarX = radarX + radar.cellSize;
            }
            radarX = beginX;
            radarY = radarY + radar.cellSize;
        }

        em.addComponents(entity, radar);
    }
  }
}