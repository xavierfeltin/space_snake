import { WorldState } from "./world_state";

export abstract class Agent {
    constructor() {}
    public abstract exploit(world: WorldState): string;
}