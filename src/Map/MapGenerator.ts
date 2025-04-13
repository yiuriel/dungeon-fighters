import Phaser from "phaser";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "../constants";

// Tile type constants
enum TileType {
  FLOOR = 1,
  FLOOR_ALT_1 = 2,
  FLOOR_ALT_2 = 3,
  FLOOR_ALT_3 = 4,
  FLOOR_ALT_4 = 5,
  FLOOR_ALT_5 = 6,
  WALL_TOP = 25,
  WALL_RIGHT = 30,
  WALL_BOTTOM = 37,
  WALL_LEFT = 28,
  WALL_CORNER_TOP_RIGHT = 26,
  WALL_CORNER_BOTTOM_RIGHT = 38,
  WALL_CORNER_BOTTOM_LEFT = 36,
  WALL_CORNER_TOP_LEFT = 24,
}

export class MapGenerator {
  private scene: Phaser.Scene;
  private mapWidth: number;
  private mapHeight: number;
  private tileSize: number;
  public boundaries!: Phaser.Physics.Arcade.StaticGroup;
  private map: number[][];

  constructor(scene: Phaser.Scene, tileSize: number = 48) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.mapWidth = Math.floor(WINDOW_WIDTH / tileSize);
    this.mapHeight = Math.floor(WINDOW_HEIGHT / tileSize);

    this.map = Array(this.mapHeight);
  }

  public preload() {
    this.scene.load.spritesheet("tiles", "assets/tilesets/map-tiles.png", {
      frameWidth: this.tileSize,
      frameHeight: this.tileSize,
    });
  }

  public getBoundaries(): Phaser.Physics.Arcade.StaticGroup {
    return this.boundaries;
  }

  public getMapHeight(): number {
    return this.mapHeight;
  }

  public getMapWidth(): number {
    return this.mapWidth;
  }

  public getMapRealWidth(): number {
    return this.mapWidth * this.tileSize;
  }

  public getMapRealHeight(): number {
    return this.mapHeight * this.tileSize;
  }

  public generateMap(): void {
    // Create empty map grid filled with random floor tiles
    this.map = Array(this.mapHeight)
      .fill(0)
      .map(() =>
        Array(this.mapWidth)
          .fill(0)
          .map(() => this.getRandomFloorTile())
      );

    // Create a tilemap from the grid
    const tilemap = this.scene.make.tilemap({
      data: this.map,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
    });

    // Add the tileset to the map
    const tileset = tilemap.addTilesetImage("tiles");

    if (!tileset) {
      throw new Error("Tileset not found");
    }

    // Create the layer with the tileset
    tilemap.createLayer(0, tileset, 0, 0);

    // Create boundary walls as a separate static group
    this.createBoundaries();

    // Set the world bounds
    this.scene.physics.world.setBounds(
      0,
      0,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize
    );
  }

  private createBoundaries() {
    // Create a static group for boundaries
    this.boundaries = this.scene.physics.add.staticGroup();

    // Top boundary
    for (let x = 0; x < this.mapWidth; x++) {
      const wall = this.boundaries.create(
        x * this.tileSize + this.tileSize / 2,
        this.tileSize / 2,
        "tiles",
        TileType.WALL_TOP
      );
      wall.setSize(this.tileSize, this.tileSize);
    }

    // Bottom boundary
    for (let x = 0; x < this.mapWidth; x++) {
      const wall = this.boundaries.create(
        x * this.tileSize + this.tileSize / 2,
        (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.WALL_BOTTOM
      );
      wall.setSize(this.tileSize, this.tileSize);
    }

    // Left boundary
    for (let y = 0; y < this.mapHeight; y++) {
      const wall = this.boundaries.create(
        this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.WALL_LEFT
      );
      wall.setSize(this.tileSize, this.tileSize);
    }

    // Right boundary
    for (let y = 0; y < this.mapHeight; y++) {
      const wall = this.boundaries.create(
        (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.WALL_RIGHT
      );
      wall.setSize(this.tileSize, this.tileSize);
    }

    // Corners
    this.boundaries.create(
      this.tileSize / 2,
      this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_TOP_LEFT
    );
    this.boundaries.create(
      (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
      this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_TOP_RIGHT
    );
    this.boundaries.create(
      this.tileSize / 2,
      (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_BOTTOM_LEFT
    );
    this.boundaries.create(
      (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
      (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_BOTTOM_RIGHT
    );
  }

  private getRandomFloorTile(): TileType {
    const random = Math.random();
    if (random < 0.7) return TileType.FLOOR;
    if (random < 0.8) return TileType.FLOOR_ALT_1;
    if (random < 0.85) return TileType.FLOOR_ALT_2;
    if (random < 0.9) return TileType.FLOOR_ALT_3;
    if (random < 0.95) return TileType.FLOOR_ALT_4;
    return TileType.FLOOR_ALT_5;
  }
}
