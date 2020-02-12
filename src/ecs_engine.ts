import { UpdateContext } from "./update_context";
import { FrameTime } from "./components/frame_time";
import { Collisions } from "./components/collision";

let lastId = 0;
const nextId = () => `${++lastId}`;
type EntityID = string;

export type ComponentKind = string;
export interface IComponent {
    kind: ComponentKind
}

export interface System<T> {
    readonly name: string;
    onUpdate: (entityManager: EntityManager<T>, context: UpdateContext) => void;
}

export class EntityManager<T> {
  private entities = new Set<EntityID>();
  private entityComponentsMap = new Map<EntityID, Map<ComponentKind, IComponent>>();
  private actionSystems = new Map<string, System<T>>();
  private physicSystems = new Map<string, System<T>>();
  private renderingSystems = new Map<string, System<T>>();
  private stateSystems = new Map<string, System<T>>();

  public addEntity(components?: IComponent[]): EntityID {
    const id = nextId();
    this.entities.add(id);

    this.addComponents(id, ...(components || []));

    return id;
  }

  public addGlobalEntity(entityId: EntityID, components: IComponent[]): EntityID {
    if (!this.entities.has(entityId)) {
      this.entities.add(entityId);
      this.addComponents(entityId, ...(components || []));
    }
    return entityId;
  }

  public removeEntity(entity: EntityID): void {
    this.entities.delete(entity);
    this.entityComponentsMap.delete(entity);
  }

  public addComponents(entity: EntityID, ...components: IComponent[]): void {
    if (!this.entities.has(entity)) {
      throw new Error(`Unknown entity ${entity}`);
    }

    const componentsMap = this.getEntityComponents(entity);

    (components || []).forEach(c => {
      componentsMap.set(c.kind, c);
    });

    this.entityComponentsMap.set(entity, componentsMap);
  }

  public removeComponent(entity: EntityID, component: IComponent): void {
    const componentsMap = this.entityComponentsMap.get(entity)
    if(componentsMap)
    {
      componentsMap.delete(component.kind);
    }
  }

  public getEntityComponents(entity: EntityID): Map<ComponentKind, IComponent> {
    if (!this.entities.has(entity)) {
      throw new Error(`Unknown entity ${entity}`);
    }

    return this.entityComponentsMap.get(entity) || new Map<ComponentKind, IComponent>();
  }

  public select(including: ComponentKind[], excluding?: ComponentKind[]): Map<EntityID, Map<ComponentKind, IComponent>> {
    const result = new Map <EntityID, Map<ComponentKind, IComponent>> ();

    this.entityComponentsMap.forEach((componentsMap, entity) => {
      const componentKinds = Array.from(componentsMap.keys());

      if (including.some(k => componentKinds.indexOf(k) === -1)) {
        return; // missing at least one required
      }

      if (componentKinds.some(k => (excluding || []).indexOf(k) !== -1)) {
        return; // at least one forbidden
      }

      const matchingComponents = new Map(
        Array.from(componentsMap.entries()).filter(
          ([kind, _]) => including.indexOf(kind) !== -1
        )
      );

      if (matchingComponents.size > 0) {
        result.set(entity, matchingComponents);
      }
    })

    return result;
  }

  public selectGlobal(entityId: EntityID): Map<ComponentKind, IComponent> | undefined{
    //const map = new Map <EntityID, IComponent> ();
    const components = this.entityComponentsMap.get(entityId);

    /*
    if (components) {
      map.set(entityId, Array.from(components.values())[0]);
    }
    */

    return components;
  }

  public addSystem(system: System<T>, type: string): void {
    switch(type)
    {
      case 'Action':
        this.actionSystems.set(system.name, system);
        break;
      case 'Physics':
        this.physicSystems.set(system.name, system);
        break;
      case 'Rendering':
        this.renderingSystems.set(system.name, system);
        break;
      case 'State':
        this.stateSystems.set(system.name, system);
        break;
      default:
        console.log('type is not valid for system ' + system.name);
    }
    console.log('add system ' + system.name);
  }

  public removeSystem(systemName: string): void {
    if (this.actionSystems.has(systemName)) {
      this.actionSystems.delete(systemName);
    }

    if (this.physicSystems.has(systemName)) {
      this.physicSystems.delete(systemName);
    }

    if (this.renderingSystems.has(systemName)) {
      this.renderingSystems.delete(systemName);
    }

    if (this.stateSystems.has(systemName)) {
      this.stateSystems.delete(systemName);
    }
  }

  public update(context: UpdateContext): void {

    // Action engine
    for(let system of this.actionSystems.values()) {
      system.onUpdate(this, context);
    }

    // Physical engine
    let frameTime = this.selectGlobal('frame')?.get('FrameTime') as FrameTime;
    frameTime.time = 0;
    this.addComponents('frame', frameTime);

    // Reset collision history for the new frame
    const prevCollision = this.selectGlobal('previousCollision')?.get('Collisions') as Collisions;
    prevCollision.collisions = [];
    this.addComponents('previousCollision', prevCollision);

    while (frameTime.time < 1.0)
    {
      for(let system of this.physicSystems.values()) {
        system.onUpdate(this, context);
      }

      frameTime = this.selectGlobal('frame')?.get('FrameTime') as FrameTime;
    }

    // Render phase
    for(let system of this.renderingSystems.values()) {
      system.onUpdate(this, context);
    }

    // State management phase
    for(let system of this.stateSystems.values()) {
      system.onUpdate(this, context);
    }
  }
}