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

let gApplication: Application;

export class Application {
    private em: EntityManager<UpdateContext>;
    private canvas2D: CanvasRenderingContext2D;

    // animation variables
    private startTime: number;
    private now: number;
    private delta: number;
    private then: number;
    private interval: number;
    private fps: number;

    // agent
    private agent: Agent | null = null;

    public constructor(canvas: CanvasRenderingContext2D) {
        // global context
        this.canvas2D = canvas;
        this.startTime = 0;
        this.now = 0;
        this.delta = 0;
        this.then = 0;
        this.fps = 30;
        this.interval = 1000 / this.fps;
        this.em = new EntityManager<UpdateContext>();
        gApplication = this;

    }

    public init(): void {
        this.canvas2D.clearRect(0, 0, 1200, 800);

        this.em = new EntityManager<UpdateContext>();
        this.em.addSystem(new Solve(), 'Action');

        this.em.addSystem(new Turn(), 'Physics');
        this.em.addSystem(new Orientate(), 'Physics');
        this.em.addSystem(new DetectCollisions(), 'Physics');
        this.em.addSystem(new Move(), 'Physics');
        this.em.addSystem(new Collide(), 'Physics');
        this.em.addSystem(new Clean(), 'Physics');
        this.em.addSystem(new SignalRadar(), 'Physics');

        this.em.addSystem(new RenderArea(), 'Rendering');
        this.em.addSystem(new RenderBeacon(), 'Rendering');
        this.em.addSystem(new RenderShip(), 'Rendering');
        this.em.addSystem(new RenderRadar(), 'Rendering');
        this.em.addSystem(new RenderScore(), 'Rendering');

        this.em.addSystem(new ManageGame, 'State');

        // this one will move
        this.em.addEntity([
            new Ship(),
            new Speed(10),
            new Position(new Vect2D(400, 400)),
            new Velocity(new Vect2D(1, 0)),
            new Orientation(0),
            new Radar(40, 5),
            new RigidBody(20), //20 is the radius of the rigid body
            new Score()
        ]);

        // this one will be static
        this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(200, 100)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        // this one will be static
        this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(600, 400)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(450, 400)),
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

    public runWithoutFrames(nbTurns: number): void {
        let game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
        let currentTurn = 0;
        while (game.isRunning() && currentTurn < nbTurns) {

            // Get agent action during current loop

            this.em.update({
                deltaTime: 1.0,
                time: 0.0,
                canvas2D: this.canvas2D
            });

            game = this.em.selectGlobal('gameState')?.get('GameState') as GameState;
            currentTurn++;
        }
    }

    public run(): void {
        this.startTime = Date.now();
        this.now = this.startTime;

        if (!this.agent) {
            document.addEventListener('keydown', this.registerHumanAction, false);
        }

        window.requestAnimationFrame(() => this.animate());
    }

    private registerHumanAction(e: KeyboardEvent) {

        const inputs = gApplication.em.selectGlobal('inputs')?.get('Inputs') as Inputs;
        if (e.keyCode === 37) {
            inputs.addInput('left');
        }
        else if (e.keyCode === 39) {
            inputs.addInput('right');
        }
        gApplication.em.addComponents('inputs', inputs);
    }

    private registerAgentAction(worldState: WorldState): void {
        if (this.agent) {
            const inputs = this.em.selectGlobal('inputs')?.get('Inputs') as Inputs;
            inputs.addInput(this.agent.exploit(worldState));
            this.em.addComponents('inputs', inputs);
        }
    }

    private buildWorldState(): WorldState {
        let worldState = new WorldState();
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
                    this.registerAgentAction(worldState);
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
}