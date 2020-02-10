import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Orientation } from '../components/orientation';
import { Velocity } from '../components/velocity';
import { Speed } from '../components/speed';

export class Orientate implements System<UpdateContext> {
  name = 'Orientate';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['Orientation', 'Velocity', 'Speed']);

    for (let [entity, componentsMap] of entities.entries()) {
        const orientation = componentsMap.get('Orientation') as Orientation;
        const speed = componentsMap.get('Speed') as Speed;
        const vel = componentsMap.get('Velocity') as Velocity;

        const rad = orientation.angle * Math.PI / 180;
        const vx = Math.cos(rad);
        const vy = Math.sin(rad);

        orientation.heading.x = vx
        orientation.heading.y = vy;

        vel.velocity.x = vx * speed.value
        vel.velocity.y = vy * speed.value;

        em.addComponents(entity, orientation);
        em.addComponents(entity, vel);
    }
  }
}