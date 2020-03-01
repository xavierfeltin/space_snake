import { WorldState } from "./world_state";

export abstract class Agent {
    constructor() {}
    public async abstract pickAction(worldState: WorldState, epsilon: number): Promise<string>;
}