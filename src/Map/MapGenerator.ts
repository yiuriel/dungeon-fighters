import Phaser from "phaser";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "../constants";

// Tile type constants
export enum TileType {
  FLOOR = 1,
  FLOOR_ALT_1 = 2,
  FLOOR_ALT_2 = 3,
  FLOOR_ALT_3 = 5,
  FLOOR_ALT_4 = 6,
  FLOOR_ALT_5 = 7,
  WALL_TOP = 25,
  WALL_RIGHT = 30,
  WALL_BOTTOM = 37,
  WALL_LEFT = 28,
  WALL_CORNER_TOP_RIGHT = 26,
  WALL_CORNER_BOTTOM_RIGHT = 38,
  WALL_CORNER_BOTTOM_LEFT = 36,
  WALL_CORNER_TOP_LEFT = 24,
  ROOM_TOP_LEFT = 8,
  ROOM_TOP = 9,
  ROOM_TOP_RIGHT = 10,
  ROOM_LEFT = 12,
  ROOM_EMPTY = 13,
  ROOM_RIGHT = 14,
  ROOM_BOTTOM_LEFT = 16,
  ROOM_BOTTOM = 17,
  ROOM_BOTTOM_RIGHT = 18,
  ROOM_BOTTOM_LEFT_WALL = 20,
  ROOM_BOTTOM_MIDDLE_WALL = 21,
  ROOM_BOTTOM_RIGHT_WALL = 22,
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
    this.mapWidth = Math.floor((WINDOW_WIDTH * 1.5) / tileSize);
    this.mapHeight = Math.floor((WINDOW_HEIGHT * 1.5) / tileSize);

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

  public getTileSize(): number {
    return this.tileSize;
  }

  public getMap(): number[][] {
    return this.map;
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
    const layer = tilemap.createLayer(0, tileset, 0, 0);

    // Randomly rotate floor tiles
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = layer?.getTileAt(x, y);
        if (tile) {
          // Only rotate floor tiles
          if (
            [
              TileType.FLOOR,
              TileType.FLOOR_ALT_1,
              TileType.FLOOR_ALT_2,
              TileType.FLOOR_ALT_3,
              TileType.FLOOR_ALT_4,
              TileType.FLOOR_ALT_5,
            ].includes(tile.index)
          ) {
            // Randomly choose between 0, 90, -90 rotation
            const rotation = Math.floor(Math.random() * 3);
            if (rotation === 1) {
              tile.rotation = Math.PI / 2; // 90 degrees
            } else if (rotation === 2) {
              tile.rotation = -Math.PI / 2; // -90 degrees
            }
          }
        }
      }
    }

    // Create boundary walls as a separate static group
    this.boundaries = this.scene.physics.add.staticGroup();

    // Create the boundary walls
    this.createBoundaries();

    // Add random rooms
    this.createRooms();

    // Set the world bounds
    this.scene.physics.world.setBounds(
      0,
      0,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize
    );
  }

  private createBoundaries() {
    // Top boundary
    for (let x = 0; x < this.mapWidth; x++) {
      const wall = this.boundaries.create(
        x * this.tileSize + this.tileSize / 2,
        this.tileSize / 2,
        "tiles",
        TileType.WALL_TOP
      );
      wall.setSize(this.tileSize, this.tileSize);
      this.map[0][x] = TileType.WALL_TOP;
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
      this.map[this.mapHeight - 1][x] = TileType.WALL_BOTTOM;
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
      this.map[y][0] = TileType.WALL_LEFT;
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
      this.map[y][this.mapWidth - 1] = TileType.WALL_RIGHT;
    }

    // Corners
    this.boundaries.create(
      this.tileSize / 2,
      this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_TOP_LEFT
    );
    this.map[0][0] = TileType.WALL_CORNER_TOP_LEFT;
    this.boundaries.create(
      (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
      this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_TOP_RIGHT
    );
    this.map[0][this.mapWidth - 1] = TileType.WALL_CORNER_TOP_RIGHT;
    this.boundaries.create(
      this.tileSize / 2,
      (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_BOTTOM_LEFT
    );
    this.map[this.mapHeight - 1][0] = TileType.WALL_CORNER_BOTTOM_LEFT;
    this.boundaries.create(
      (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
      (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.WALL_CORNER_BOTTOM_RIGHT
    );
    this.map[this.mapHeight - 1][this.mapWidth - 1] =
      TileType.WALL_CORNER_BOTTOM_RIGHT;
  }

  public mapToPixel(mapX: number, mapY: number): { x: number; y: number } {
    return {
      x: mapX * this.tileSize + this.tileSize / 2,
      y: mapY * this.tileSize + this.tileSize / 2,
    };
  }

  public pixelToMap(pixelX: number, pixelY: number): { x: number; y: number } {
    return {
      x: Math.floor(pixelX / this.tileSize),
      y: Math.floor(pixelY / this.tileSize),
    };
  }

  public getRandomNonRoomPosition(): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let isValidPosition = false;
    let attempts = 0;
    const maxAttempts = 50;

    while (!isValidPosition && attempts < maxAttempts) {
      attempts++;

      // Get random position within the map bounds (with some padding)
      x = Phaser.Math.Between(
        this.tileSize * 2,
        this.mapWidth * this.tileSize - this.tileSize * 2
      );
      y = Phaser.Math.Between(
        this.tileSize * 2,
        this.mapHeight * this.tileSize - this.tileSize * 2
      );

      // Convert to map coordinates
      const mapPos = this.pixelToMap(x, y);

      // Check if this position is not in a room (not a ROOM_TILE_ID)
      if (
        this.map[mapPos.y] &&
        this.map[mapPos.y][mapPos.x] < TileType.ROOM_TOP_LEFT
      ) {
        isValidPosition = true;
      }
    }

    // If we couldn't find a valid position after max attempts, just return a position in the middle
    if (!isValidPosition) {
      x = (this.mapWidth * this.tileSize) / 2;
      y = (this.mapHeight * this.tileSize) / 2;
    }

    return { x, y };
  }

  private readonly ROOM_TILE_ID = 100;

  private createRoom(
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    // Top row
    this.boundaries.create(
      startX * this.tileSize + this.tileSize / 2,
      startY * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_TOP_LEFT
    );
    this.map[startY][startX] = TileType.ROOM_TOP_LEFT;

    for (let x = 1; x < width - 1; x++) {
      this.boundaries.create(
        (startX + x) * this.tileSize + this.tileSize / 2,
        startY * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.ROOM_TOP
      );
      this.map[startY][startX + x] = TileType.ROOM_TOP;
    }

    this.boundaries.create(
      (startX + width - 1) * this.tileSize + this.tileSize / 2,
      startY * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_TOP_RIGHT
    );
    this.map[startY][startX + width - 1] = TileType.ROOM_TOP_RIGHT;

    // Middle rows
    for (let y = 1; y < height - 1; y++) {
      // Left side
      this.boundaries.create(
        startX * this.tileSize + this.tileSize / 2,
        (startY + y) * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.ROOM_LEFT
      );
      this.map[startY + y][startX] = TileType.ROOM_LEFT;

      // Room interior - only ROOM_EMPTY
      for (let x = 1; x < width - 1; x++) {
        this.boundaries.create(
          (startX + x) * this.tileSize + this.tileSize / 2,
          (startY + y) * this.tileSize + this.tileSize / 2,
          "tiles",
          TileType.ROOM_EMPTY
        );

        // Mark room tiles in the map
        this.map[startY + y][startX + x] = TileType.ROOM_EMPTY;
      }

      // Right side
      this.boundaries.create(
        (startX + width - 1) * this.tileSize + this.tileSize / 2,
        (startY + y) * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.ROOM_RIGHT
      );
      this.map[startY + y][startX + width - 1] = TileType.ROOM_RIGHT;
    }

    // Bottom row
    this.boundaries.create(
      startX * this.tileSize + this.tileSize / 2,
      (startY + height - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_BOTTOM_LEFT
    );
    this.map[startY + height - 1][startX] = TileType.ROOM_BOTTOM_LEFT;

    for (let x = 1; x < width - 1; x++) {
      this.boundaries.create(
        (startX + x) * this.tileSize + this.tileSize / 2,
        (startY + height - 1) * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.ROOM_BOTTOM
      );
      this.map[startY + height - 1][startX + x] = TileType.ROOM_BOTTOM;
    }

    this.boundaries.create(
      (startX + width - 1) * this.tileSize + this.tileSize / 2,
      (startY + height - 1) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_BOTTOM_RIGHT
    );
    this.map[startY + height - 1][startX + width - 1] =
      TileType.ROOM_BOTTOM_RIGHT;

    // Add wall tiles below bottom row
    this.boundaries.create(
      startX * this.tileSize + this.tileSize / 2,
      (startY + height) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_BOTTOM_LEFT_WALL
    );
    this.map[startY + height][startX] = TileType.ROOM_BOTTOM_LEFT_WALL;

    for (let x = 1; x < width - 1; x++) {
      this.boundaries.create(
        (startX + x) * this.tileSize + this.tileSize / 2,
        (startY + height) * this.tileSize + this.tileSize / 2,
        "tiles",
        TileType.ROOM_BOTTOM_MIDDLE_WALL
      );
      this.map[startY + height][startX + x] = TileType.ROOM_BOTTOM_MIDDLE_WALL;
    }

    this.boundaries.create(
      (startX + width - 1) * this.tileSize + this.tileSize / 2,
      (startY + height) * this.tileSize + this.tileSize / 2,
      "tiles",
      TileType.ROOM_BOTTOM_RIGHT_WALL
    );
    this.map[startY + height][startX + width - 1] =
      TileType.ROOM_BOTTOM_RIGHT_WALL;
  }

  public getRoomTileId(): number {
    return this.ROOM_TILE_ID;
  }

  private createRooms() {
    // Generate 4-8 random rooms (ensuring at least 4)
    const numRooms = 4 + Math.floor(Math.random() * 5);
    const placedRooms: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    let attempts = 0;
    const maxAttempts = 100;

    while (placedRooms.length < numRooms && attempts < maxAttempts) {
      attempts++;

      // Random room size between 2x2 and 5x5
      const roomWidth = 2 + Math.floor(Math.random() * 4);
      const roomHeight = 2 + Math.floor(Math.random() * 4);

      // Random position (ensure room is not at the edge)
      const startX =
        2 + Math.floor(Math.random() * (this.mapWidth - roomWidth - 4));
      const startY =
        2 + Math.floor(Math.random() * (this.mapHeight - roomHeight - 4));

      // Check collision with other rooms (including a 1-tile buffer)
      const hasCollision = placedRooms.some((room) => {
        return !(
          startX > room.x + room.width + 1 ||
          startX + roomWidth + 1 < room.x ||
          startY > room.y + room.height + 1 ||
          startY + roomHeight + 1 < room.y
        );
      });

      // Only create the room if there's no collision
      if (!hasCollision) {
        this.createRoom(startX, startY, roomWidth, roomHeight);
        placedRooms.push({
          x: startX,
          y: startY,
          width: roomWidth,
          height: roomHeight,
        });
      }
    }

    // If we couldn't place enough rooms, force placement of remaining rooms
    if (placedRooms.length < 4) {
      const additionalRooms = 4 - placedRooms.length;
      for (let i = 0; i < additionalRooms; i++) {
        const roomWidth = 2 + Math.floor(Math.random() * 3);
        const roomHeight = 2 + Math.floor(Math.random() * 3);

        // Place in different quadrants of the map to avoid collisions
        const quadrant = i % 4;
        let startX, startY;

        switch (quadrant) {
          case 0: // Top-left
            startX = 2 + Math.floor(Math.random() * (this.mapWidth / 3));
            startY = 2 + Math.floor(Math.random() * (this.mapHeight / 3));
            break;
          case 1: // Top-right
            startX =
              Math.floor((this.mapWidth * 2) / 3) +
              Math.floor(Math.random() * (this.mapWidth / 3 - roomWidth - 2));
            startY = 2 + Math.floor(Math.random() * (this.mapHeight / 3));
            break;
          case 2: // Bottom-left
            startX = 2 + Math.floor(Math.random() * (this.mapWidth / 3));
            startY =
              Math.floor((this.mapHeight * 2) / 3) +
              Math.floor(Math.random() * (this.mapHeight / 3 - roomHeight - 2));
            break;
          case 3: // Bottom-right
            startX =
              Math.floor((this.mapWidth * 2) / 3) +
              Math.floor(Math.random() * (this.mapWidth / 3 - roomWidth - 2));
            startY =
              Math.floor((this.mapHeight * 2) / 3) +
              Math.floor(Math.random() * (this.mapHeight / 3 - roomHeight - 2));
            break;
        }

        if (startX === undefined || startY === undefined) {
          continue;
        }
        this.createRoom(startX, startY, roomWidth, roomHeight);
        placedRooms.push({
          x: startX,
          y: startY,
          width: roomWidth,
          height: roomHeight,
        });
      }
    }
  }

  private getRandomFloorTile(): TileType {
    const random = Math.random();
    if (random < 0.7) return TileType.FLOOR;
    if (random < 0.8) return TileType.FLOOR_ALT_1;
    if (random < 0.85) return TileType.FLOOR_ALT_2;
    if (random < 0.9) return TileType.FLOOR_ALT_3;
    if (random < 0.95) return TileType.FLOOR_ALT_4;
    if (random < 0.99) return TileType.FLOOR_ALT_5;
    return TileType.FLOOR;
  }
}
