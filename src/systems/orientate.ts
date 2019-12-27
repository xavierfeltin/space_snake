import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Orientation } from '../components/orientation';
import { Position } from '../components/position';
import { Velocity } from '../components/velocity';
import { Speed } from '../components/speed';

export class Orientate implements System<UpdateContext> {
  name = 'Orientate';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Orientation', 'Velocity', 'Speed']);

    debugger;
    for (let [entity, componentsMap] of entities.entries()) {
        const orientation = componentsMap.get('Orientation') as Orientation;
        const speed = componentsMap.get('Speed') as Speed;
        const vel = componentsMap.get('Velocity') as Velocity;

        const rad = orientation.angle * Math.PI / 180;
        const vx = Math.cos(rad);
        const vy = Math.sin(rad);


        orientation.heading = [vx, vy];

        vel.velocity = [vx * speed.value, vy * speed.value];

        em.addComponents(entity, orientation);
        em.addComponents(entity, vel);
    }
  }
}