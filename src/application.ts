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

let gApplication: Application;

export class Application {
    private em: EntityManager<UpdateContext>;
    private canvas2D: CanvasRenderingContext2D;
    private idArea: string;
    private id1: string;
    private id2: string;

    // animation variables
    private startTime: number;
    private now: number;
    private delta: number;
    private then: number;
    private interval: number;
    private fps: number;

    public constructor(canvas: CanvasRenderingContext2D) {
        // global context
        this.canvas2D = canvas;
        this.startTime = 0;
        this.now = 0;
        this.delta = 0;
        this.then = 0;
        this.fps = 30;
        this.interval = 1000 / this.fps;
        gApplication = this;

        this.em = new EntityManager<UpdateContext>();
        this.em.addSystem(new Solve(), 'Action');

        this.em.addSystem(new Turn(), 'Physics');
        this.em.addSystem(new Orientate(), 'Physics');
        this.em.addSystem(new DetectCollisions, 'Physics');
        this.em.addSystem(new Move(), 'Physics');
        this.em.addSystem(new Collide, 'Physics');
        this.em.addSystem(new Clean, 'Physics');

        this.em.addSystem(new RenderArea(), 'Rendering');
        this.em.addSystem(new RenderBeacon(), 'Rendering');
        this.em.addSystem(new RenderShip(), 'Rendering');
        this.em.addSystem(new RenderRadar(), 'Rendering');
        this.em.addSystem(new RenderScore(), 'Rendering');

        this.idArea = this.em.addEntity([
            new Area(1200, 800),
            new Position(new Vect2D(0, 0)),
            new Renderer('(0,0,0)', 1200, 800)
        ]);

        // this one will move
        this.id1 = this.em.addEntity([
            new Ship(),
            new Speed(10),
            new Position(new Vect2D(400, 400)),
            new Velocity(new Vect2D(1, 0)),
            new Orientation(0),
            new Radar(100, 5, 6),
            new RigidBody(20),
            new Score()
        ]);

        // this one will be static
        this.id2 = this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(200, 100)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        // this one will be static
        const id3 = this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(600, 400)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        const id4 = this.em.addEntity([
            new Beacon(),
            new Position(new Vect2D(450, 400)),
            new Velocity(new Vect2D(0, 0)),
            new RigidBody(20),
            new Renderer('(0,0,0)', 100, 100)
        ]);

        // Global entities
        const idFrame = this.em.addGlobalEntity('frame', new FrameTime);
        const idCollisions = this.em.addGlobalEntity('collisions', new Collisions);
        const idPrevCollisions = this.em.addGlobalEntity('previousCollision', new Collisions);
        const idInputs = this.em.addGlobalEntity('inputs', new Inputs);
    }

    public run(): void {
        this.startTime = Date.now();
        this.now = this.startTime;

        // Need to have an initialization at this moment
        // to allow charts to be initialized with correct values
        // yes I know could be better ...
        //this.initialize();
        //this.game.start();
        document.addEventListener('keydown', this.registerHumanAction, false);
        window.requestAnimationFrame(() => this.animate());
    }

    private registerHumanAction(e: KeyboardEvent) {

        const inputsEntity = gApplication.em.selectGlobal('inputs');
        const inputs = inputsEntity.get('inputs') as Inputs;
        if (e.keyCode === 37) {
            inputs.addInput('left');
        }
        else if (e.keyCode === 39) {
            inputs.addInput('right');
        }
        gApplication.em.addComponents('inputs', inputs);
    }

    private animate(): void {
        window.requestAnimationFrame(() => this.animate());

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval) {
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