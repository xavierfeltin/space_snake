import { IComponent } from '../ecs_engine';

export class Area implements IComponent {
  kind = 'Area';

  public width: number;
  public height: number;
  public widthMap: number;
  public heightMap: number;
  private cellSize: number;
  public cartography: number[];

  constructor(w: number, h: number, size: number) {
    this.width = w;
    this.height = h;
    this.widthMap = this.width / size;
    this.heightMap = this.height / size;

    this.cellSize =  size;
    this.cartography = this.loadCartography();     
  }

  private loadCartography(): number[] {
    const nbCells = this.widthMap * this.heightMap;
    let map = Array<number>(this.widthMap * this.heightMap).fill(0);
    map = map.fill(-1, 0, this.widthMap);

    for(let i = 0; i < nbCells; i += this.widthMap) {
      map[i] = -1;
      map[i + (this.widthMap-1)] = -1;
    }

    map = map.fill(-1, (this.heightMap - 1) * this.widthMap, ((this.heightMap - 1) * this.widthMap) + this.widthMap);

    return map;
  }  
}