import { EntityManager } from "./ecs_engine";
import { UpdateContext } from "./update_context";
import { Move } from "./systems/move";
import { Ship } from "./components/ship";
import { Beacon } from "./components/beacon";
import { Area } from "./components/area";
import { Position } from "./components/position";
import { Velocity } from "./components/velocity";
import { Orientation } from "./components/orientation";
import { RenderArea } from "./systems/render_area";
import { Renderer } from "./components/renderer";
import { RenderShip } from "./systems/render_ship";
import { RenderBeacon } from "./systems/render_beacon";
import { Orientate } from "./systems/orientate";
import { Solve } from "./systems/solve";
import { Turn } from "./systems/turn";
import { Speed } from "./components/speed";
import { Radar } from "./components/radar";
import { RenderRadar } from "./systems/render_radar";
import { RigidBody } from "./components/rigid_body";
import { Collisions } from "./components/collision";
import { DetectCollisions } from "./systems/detect_collisions";
import { Collide } from "./systems/collide";
import { FrameTime } from "./components/frame_time";
import { Vect2D } from "./utils/vect2D";
import { Clean } from "./systems/clean";
import { RenderScore } from "./systems/render_score";
import { Score } from "./components/score";
import { Inputs } from "./components/inputs";
import { GameState } from "./components/game_state";
import { ManageGame } from "./systems/manage_game";
import { WorldState } from "./agents/world_state";
import { Agent } from "./agents/agent";
import { SignalRadar } from "./systems/signal_radar";
import { MyMath } from "./utils/math";
import * as tf from "@tensorflow/tfjs";

let gApplication: Application;

export class Application {
    private em: EntityManager<UpdateContext>;
    private canvas2D: CanvasRenderingContext2D | null;

    // animation variables
    private startTime: number;
    private now: number;
    private delta: number;
    private then: number;
    private interval: number;
    private fps: number;
    private sizeRadar: number;

    // agent
    private agent: Agent | null = null;

    // training
    public trainMeans: number[] = [];
    public trainLosses: number[] = [];

    public constructor(canvas: CanvasRenderingContext2D | null) {
        // global context
        this.startTime = 0;
        this.now = 0;
        this.delta = 0;
        this.then = 0;
        this.fps = 30;
        this.interval = 1000 / this.fps;
        this.sizeRadar = 5;
        this.em = new EntityManager<UpdateContext>();
        this.canvas2D = null;
        gApplication = this;
    }

    public setCanvas(ctx:  CanvasRenderingContext2D | null) {
        this.canvas2D = ctx;
    }

    public init(): void {
        if (this.canvas2D) {
            this.canvas2D.clearRect(0, 0, 1200, 800);
        }

        this.em.clearAll();
        this.em.addSystem(new Solve(), 'Action');

        this.em.addSystem(new Turn(), 'Physics');
        this.em.addSystem(new Orientate(), 'Physics');
        this.em.addSystem(new DetectCollisions(), 'Physics');
        this.em.addSystem(new Move(), 'Physics');
        this.em.addSystem(new Collide(), 'Physics');
        this.em.addSystem(new Clean(), 'Physics');
        this.em.addSystem(new SignalRadar(), 'Physics');

        if (this.canvas2D) {
            this.em.addSystem(new RenderArea(), 'Rendering');
            this.em.addSystem(new RenderBeacon(), 'Rendering');
            this.em.addSystem(new RenderShip(), 'Rendering');
            this.em.addSystem(new RenderRadar(), 'Rendering');
            this.em.addSystem(new RenderScore(), 'Rendering');
        }

        this.em.addSystem(new ManageGame, 'State');

        // Main player
        this.em.addEntity([
            new Ship(),
            new Speed(7),
            new Position(new Vect2D(600, 400)),
            new Velocity(new Vect2D(1, 0)),
            new Orientation(0),
            new Radar(40, this.sizeRadar),
            new RigidBody(20), //20 is the radius of the rigid body
            new Score()
        ]);

        // these ones will be static
        this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(50 + Math.random()*1100, 50 + Math.random()*700)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        // Global entities
        this.em.addGlobalEntity('frame', [new FrameTime]);
        this.em.addGlobalEntity('collisions', [new Collisions]);
        this.em.addGlobalEntity('previousCollision', [new Collisions]);
         this.em.addGlobalEntity('inputs', [new Inputs]);
        this.em.addGlobalEntity('area', [
            new Area(1200, 800),
            new Position(new Vect2D(0, 0)),
            new Renderer('(0,0,0)', 1200, 800)
        ]);
        this.em.addGlobalEntity('gameState', [new GameState]);
    }

    public addAgent(newAgent: Agent) {
        this.agent = newAgent;
    }

    public getWorldState(): WorldState {
        return this.buildWorldState();
    }

    public step(action: string): number {
        let game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
        if (game.isRunning()) {

            let entities = this.em.select(['Score']);
            let prevScore: number = 0;
            for (let [entity, componentsMap] of entities.entries()) {
                let s = componentsMap.get('Score') as Score;
                prevScore = s.score;
            }

            entities = this.em.select(['Position', 'Radar', 'Ship']);
            let posShip = new Position(new Vect2D(0,0));
            let prevRadarDir: number | null = null;
            for (let [entity, componentsMap] of entities.entries()) {
                let p = componentsMap.get('Position') as Position;
                posShip.position.x = p.position.x;
                posShip.position.y = p.position.y;

                let r = componentsMap.get('Radar') as Radar;
                prevRadarDir = r.direction;
            }

            entities = this.em.select(['Position', 'Beacon']);
            let posBeacon = new Position(new Vect2D(0,0));
            for (let [entity, componentsMap] of entities.entries()) {
                posBeacon = componentsMap.get('Position') as Position;
            }

            const prevPos = posShip.position;
            const prevDistance = posShip.position.distance2(posBeacon.position);

            const inputs = this.em.selectGlobal('inputs')?.get('Inputs') as Inputs;
            inputs.addInput(action);
            this.em.addComponents('inputs', inputs);

            this.em.update({
                deltaTime: 1.0,
                time: 0.0,
                canvas2D: this.canvas2D
            });

            entities = this.em.select(['Score']);
            let score: number = 0;
            for (let [entity, componentsMap] of entities.entries()) {
                let s = componentsMap.get('Score') as Score;
                score = s.score;
            }

            entities = this.em.select(['Position', 'Radar', 'Ship']);
            posShip = new Position(new Vect2D(0,0));
            let newRadarDir: number | null = null
            for (let [entity, componentsMap] of entities.entries()) {
                let p = componentsMap.get('Position') as Position;
                posShip.position.x = p.position.x;
                posShip.position.y = p.position.y;

                let r = componentsMap.get('Radar') as Radar;
                newRadarDir = r.direction;
            }

            entities = this.em.select(['Position', 'Beacon']);
            posBeacon = new Position(new Vect2D(0,0));
            for (let [entity, componentsMap] of entities.entries()) {
                posBeacon = componentsMap.get('Position') as Position;
            }

            const newPos = posShip.position;
            const traveledDistance = prevPos.distance(newPos);
            let rewardTravel = traveledDistance / 7;

            const newDistance = posShip.position.distance2(posBeacon.position);
            let rewardDistance = -1; // do not follow objective
            if (newDistance < prevDistance) {
                rewardDistance = 1;
            }

            let rewardOrientation = -1; // do not follow objective
            if ((prevRadarDir != null && newRadarDir != null) && (Math.abs(newRadarDir) < Math.abs(prevRadarDir) || ((prevRadarDir == 0) && (newRadarDir == 0)))) {
                rewardOrientation = 1;
            }

            let rewardScore = 0;
            if ((score - prevScore) > 0) {
                rewardScore = 10;
            }

            return rewardDistance + /*rewardTravel*/ + rewardOrientation + rewardScore; //used as recompense
            //return (score.score - prevScore.score) * 10; //used as recompense
        }
        else {
            return -10; //ship is dead
        }
    }

    /*
    public runWithoutFrames(nbTurns: number): number {
        let game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
        let currentTurn = 0;
        while (game.isRunning() && currentTurn < nbTurns) {

            const worldState = this.buildWorldState();
            this.getAgentAction(worldState);

            this.em.update({
                deltaTime: 1.0,
                time: 0.0,
                canvas2D: this.canvas2D
            });

            game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
            currentTurn++;
        }

        const entities = this.em.select(['Score']);
        let score: Score = new Score();
        for (let [entity, componentsMap] of entities.entries()) {
            score = componentsMap.get('Score') as Score;
        }
        return score.score;
    }
    */

    public run(): void {
        this.startTime = Date.now();
        this.now = this.startTime;

        if (!this.agent) {
            document.addEventListener('keydown', this.registerHumanAction, false);
        }

        window.requestAnimationFrame(() => this.animate());
    }

    public async train(agent: Agent) {
        this.trainMeans = [];
        this.trainLosses = [];

        let eps = 1.0;
        // Used to store the experiences
        let states: number[][] = [];
        let rewards: number[] = [];
        let reward_mean: number[] = [];
        let next_states: number[][] = [];
        let actions: number[][] = [];

        // Get the current state of the lidar
        let st = this.buildWorldState();
        let st2;

        for (let epi=0; epi < 200; epi++){
            let reward = null;
            let step = 0;
            let deadStep = null;
            let score = 0;
            while (step < 1000 && (reward == null || reward != -10)){
                // pick an action
                let act = agent.pickAction(st, eps);

                const directions = ['left', 'right', 'straignt'];
                reward = this.step(directions[act]);

                if (reward == -10 && deadStep == null) {
                    deadStep = step;
                }
                else if (reward == 10) {
                    score++;
                }

                st2 = this.buildWorldState();

                let mask = [0, 0, 0];
                mask[act] = 1;

                // Randomly insert the new transition tuple
                let index = Math.floor(Math.random() * states.length);
                states.splice(index, 0, st.state);
                rewards.splice(index, 0, reward);
                reward_mean.splice(index, 0, reward)
                next_states.splice(index, 0, st2.state);
                actions.splice(index, 0, mask);

                // Be sure to keep the size of the dataset under 10000 transitions
                if (states.length > 10000){
                    states = states.slice(1, states.length);
                    rewards = rewards.slice(1, rewards.length);
                    reward_mean = reward_mean.slice(1, reward_mean.length);
                    next_states = next_states.slice(1, next_states.length);
                    actions = actions.slice(1, actions.length);
                }

                st = st2;
                step += 1;
            }
            console.log('game score: ' + score + ', dead at step: ' + deadStep);

            // Decrease epsilon
            eps = Math.max(0.1, eps*0.99);

            // Train model every 5 episodes
            if (epi % 5 == 0 && epi >= 5){
                const meanReward = MyMath.mean(reward_mean);
                const meanLoss = agent.train_model(states, actions, rewards, next_states);
                this.trainMeans.push(meanReward || -100);
                this.trainLosses.push(meanLoss || -100);

                console.log("---------------");
                console.log("rewards mean", meanReward);
                console.log("losses mean", meanLoss);
                console.log("episode", epi);

                const trainingDiv = document.querySelector('#training');
                if (trainingDiv) {
                    trainingDiv.textContent = `Episode ${epi}: Mean R ${meanReward} - Mean L ${meanLoss}`;
                }

                await tf.nextFrame();
            }

            // Shuffle the env
            this.resetApplication();
            this.init();
        }

        console.log('Congrats ! training terminated');
    }

    private registerHumanAction(e: KeyboardEvent) {

        const inputs = gApplication.em.selectGlobal('inputs')?.get('Inputs') as Inputs;
        if (e.keyCode === 37) {
            inputs.addInput('left');
        }
        else if (e.keyCode === 39) {
            inputs.addInput('right');
        }
        else {
            inputs.addInput('straight');
        }
        gApplication.em.addComponents('inputs', inputs);
    }

    private getAgentAction(worldState: WorldState): void {
        if (this.agent) {
            const inputs = this.em.selectGlobal('inputs')?.get('Inputs') as Inputs;
            const act = this.agent.pickAction(worldState, 0.0);

            const actions = ['left', 'right', 'straight'];
            inputs.addInput(actions[act]);
            this.em.addComponents('inputs', inputs);
        }
    }

    private buildWorldState(): WorldState {
        let worldState = new WorldState();

        const game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
        if (game.isRunning())
        {
            const entities = this.em.select(['Radar', 'Position']);
            for (let [entity, componentsMap] of entities.entries()) {
                let radar = componentsMap.get('Radar') as Radar;
                let position = componentsMap.get('Position') as Position;
                worldState.state = [...radar.state, radar.direction || 0];
            }
        } else {
            const nbRadarCells = this.sizeRadar * this.sizeRadar;
            worldState.state = Array<number>(nbRadarCells + 1).fill(-1);
        }

        return worldState;
    }

    private animate(): void {
        const game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
        if (game.isRunning()) {
            window.requestAnimationFrame(() => this.animate());

            this.now = Date.now();
            this.delta = this.now - this.then;

            if (this.delta > this.interval) {

                if (this.agent) {
                    const worldState = this.buildWorldState();
                    this.getAgentAction(worldState);
                }

                // update time stuffs
                // From: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
                this.then = this.now - (this.delta % this.interval);

                this.em.update({
                    deltaTime: this.interval,
                    time: 0.0,
                    canvas2D: this.canvas2D
                });
            }
        }
    }

    public resetApplication() {
        this.startTime = 0;
        this.now = 0;
        this.delta = 0;
        this.then = 0;
        this.fps = 30;
        this.interval = 1000 / this.fps;
    }
}