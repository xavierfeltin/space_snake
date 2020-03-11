import { EntityManager, System } from '../ecs_engine';
import { UpdateContext } from '../update_context';
import { Orientation } from '../components/orientation';
import { TurnAction } from '../components/turn_action';
import { Speed } from '../components/speed';
import { Velocity } from '../components/velocity';
import { Position } from '../components/position';
import { Vect2D } from '../utils/vect2D';

export class TurnMove implements System<UpdateContext> {
  name = 'TurnMove';

  onUpdate(em: EntityManager<UpdateContext>, context: UpdateContext): void {
    const entities = em.select(['TurnAction', 'Orientation', 'Velocity', 'Speed', 'Position']);

    if (entities.size == 0) {
      for (let [entity, componentsMap] of entities.entries()) {
        const velocity = componentsMap.get('Velocity') as Velocity;
        velocity.velocity = new Vect2D(0, 0); //not moving, are we ?
        em.addComponents(entity, velocity);
      }
    } else {
      // go go go !!
      for (let [entity, componentsMap] of entities.entries()) {
        const rotation = componentsMap.get('TurnAction') as TurnAction;
        const orientation = componentsMap.get('Orientation') as Orientation;
        const speed = componentsMap.get('Speed') as Speed;
        const velocity = componentsMap.get('Velocity') as Velocity;
        const position = componentsMap.get('Position') as Position;

        const angle = this.turn(orientation.angle, rotation.angle);
        const heading = this.computeHeading(angle);
        const vel = this.computeVelocity(heading, speed.value);
        const pos = this.move(position.pos, vel);

        orientation.heading = heading;
        velocity.velocity = vel;
        position.position = pos;

        em.addComponents(entity, orientation);
        em.addComponents(entity, velocity);
        em.addComponents(entity, position);
        em.removeComponent(entity, rotation);
      }
    }
  }

  private turn(angle: number, delta: number): number {
    return (angle + delta) % 360;
  }

  private computeHeading(angle: number): Vect2D {
    const rad = angle * Math.PI / 180;
    const vx = Math.cos(rad);
    const vy = Math.sin(rad);
    return new Vect2D(vx, vy);
  }

  private computeVelocity(heading: Vect2D, speed: number): Vect2D {
    return new Vect2D(heading.x * speed, heading.y * speed);
  }

  private move(position: Vect2D, velocity: Vect2D): Vect2D {
    const time = 1.0; //no RT collisions to solve (thanks god)
    const x = position.x + velocity.x * time;
    const y = position.y + velocity.y * time;
    return new Vect2D(x, y);
  }
}