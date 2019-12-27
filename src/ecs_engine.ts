let lastId = 0;
const nextId = () => `${++lastId}`;
type EntityID = string;

export type ComponentKind = string;
export interface IComponent {
    kind: ComponentKind
}

export interface System<T> {
    readonly name: string;
    onUpdate: (entityManager: EntityManager<T>, context: T) => void
}

export class EntityManager<T> {
  private entities = new Set<EntityID>();
  private entityComponentsMap = new Map<EntityID, Map<ComponentKind, IComponent>>();
  private systems = new Map<string, System<T>>();

  public addEntity(components?: IComponent[]): EntityID {
    const id = nextId();
    this.entities.add(id);

    this.addComponents(id, ...(components || []));

    return id;
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

  public addSystem(system: System<T>): void {
    this.systems.set(system.name, system);
    console.log('add system ' + system.name);
  }

  public removeSystem(systemName: string): void {
    this.systems.delete(systemName);
  }

  public update(context: T): void {
    for(let system of this.systems.values()) {
      system.onUpdate(this, context);
    }
  }
}