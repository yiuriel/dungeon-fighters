import { Status } from "../Common/Status";
import { MapGenerator, TileType } from "../Map/MapGenerator";
import { Player } from "../Players/Player";
import * as pf from "pathfinding";
import { HealthBar } from "../Common/HealthBar";

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected damage: number;
  protected prefix: string;
  protected attackCooldown: boolean = false;
  protected attackDuration: number = 1000;
  protected distanceAttackRange: number = 0; // Default to 0 (no distance attack)
  protected distanceAttackCooldown: boolean = false;

  protected takingDamage: boolean = false;
  protected takingDamageDuration: number = 1000;
  protected status: Status | null = null;

  protected mapGenerator: MapGenerator;
  protected grid: pf.Grid;
  protected pathfinder: pf.AStarFinder;

  protected path: number[][] = [];
  protected pathCooldownRecalc: boolean = false;

  protected healthBar: HealthBar;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    mapGenerator: MapGenerator,
    prefix: string,
    frame?: string | number,
    health?: number,
    speed?: number,
    damage?: number,
    distanceAttackRange?: number
  ) {
    super(scene, x, y, texture, frame);

    this.mapGenerator = mapGenerator;
    this.grid = new pf.Grid(
      this.mapGenerator.getMapWidth(),
      this.mapGenerator.getMapHeight()
    );
    this.pathfinder = new pf.AStarFinder();

    // Initialize the grid with walkability data from the map
    const map = this.mapGenerator.getMap();
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        // If the tile is 0 or not a wall/boundary, mark it as walkable
        if (map[y][x] <= TileType.FLOOR_ALT_5) {
          this.grid.setWalkableAt(x, y, true);
        } else {
          this.grid.setWalkableAt(x, y, false);
        }
      }
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health || 100;
    this.speed = speed || 100;
    this.damage = damage || 10;
    this.prefix = prefix;
    this.distanceAttackRange = distanceAttackRange || 0;

    this.setDepth(10);

    this.createAnimations();

    this.healthBar = new HealthBar(
      scene,
      this,
      this.health,
      undefined,
      undefined,
      -15
    );
  }

  update(): void {
    this.healthBar.update();
    this.handleMovement();
    this.updateSpecific();
  }

  protected abstract updateSpecific(): void;

  protected handleMovement(): void {
    // Common enemy movement logic
    const player = this.scene.children
      .getChildren()
      .find((child) => child instanceof Player);

    if (!this.pathCooldownRecalc && player && player.active) {
      this.path = this.pathfinder.findPath(
        Math.floor(this.x / this.mapGenerator.getTileSize()),
        Math.floor(this.y / this.mapGenerator.getTileSize()),
        Math.floor(player!.x / this.mapGenerator.getTileSize()),
        Math.floor(player!.y / this.mapGenerator.getTileSize()),
        this.grid.clone()
      );

      this.scene.time.addEvent({
        delay: 500,
        callback: () => {
          this.pathCooldownRecalc = false;
        },
        callbackScope: this,
      });
    }

    this.pathCooldownRecalc = true;

    if (player && this.path && this.path.length > 1) {
      // Get the next point in the path (index 1 since 0 is the current position)
      const nextPoint = this.path[1];
      const nextX =
        nextPoint[0] * this.mapGenerator.getTileSize() +
        this.mapGenerator.getTileSize() / 2;
      const nextY =
        nextPoint[1] * this.mapGenerator.getTileSize() +
        this.mapGenerator.getTileSize() / 2;

      // Calculate direction to the next point in the path
      const dx = nextX - this.x;
      const dy = nextY - this.y;
      const angle = Math.atan2(dy, dx);

      this.setVelocityX(Math.cos(angle) * this.speed);
      this.setVelocityY(Math.sin(angle) * this.speed);

      // Update animation based on movement direction
      this.updateAnimation(dx, dy);
    } else {
      this.setVelocity(0);
      this.anims.play(`${this.prefix}_idle`, true);
    }
  }

  protected updateAnimation(dx: number, dy: number): void {
    if (Math.abs(dx) > Math.abs(dy)) {
      // Moving horizontally
      if (dx > 0) {
        this.anims.play(`${this.prefix}_walk_right`, true);
      } else {
        this.anims.play(`${this.prefix}_walk_left`, true);
      }
    } else {
      // Moving vertically
      if (dy > 0) {
        this.anims.play(`${this.prefix}_walk_down`, true);
      } else {
        this.anims.play(`${this.prefix}_walk_up`, true);
      }
    }
  }

  public knockback(otherEnemy: Enemy, strength: number = 500): void {
    // Calculate direction away from the other enemy
    const dx = this.x - otherEnemy.x;
    const dy = this.y - otherEnemy.y;
    const angle = Math.atan2(dy, dx);

    // Apply knockback force
    this.setVelocityX(Math.cos(angle) * strength);
    this.setVelocityY(Math.sin(angle) * strength);

    // Reset velocity after a short delay
    this.scene.time.delayedCall(200, () => {
      if (this.active) {
        this.setVelocity(0);
      }
    });
  }

  /**
   * Checks if the enemy can hit the player with a distance attack.
   * This means there are no obstacles between the enemy and the player,
   * and the player is within the enemy's distance attack range.
   * @returns boolean indicating if the enemy can hit the player
   */
  public canHitPlayerWithDistanceAttack(): boolean {
    // If enemy doesn't have distance attack capability, return false
    if (this.distanceAttackRange <= 0) {
      return false;
    }

    // Find the player
    const player = this.scene.children
      .getChildren()
      .find((child) => child instanceof Player);

    if (!player || !player.active) {
      return false;
    }

    // Calculate distance to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if player is within range
    if (distance > this.distanceAttackRange) {
      return false;
    }

    // Check if there's a clear line of sight to the player
    return this.hasLineOfSightToPlayer(player);
  }

  /**
   * Checks if there's a clear line of sight between the enemy and the player.
   * @param player The player to check line of sight to
   * @returns boolean indicating if there's a clear line of sight
   */
  private hasLineOfSightToPlayer(player: Player): boolean {
    // Convert positions to map coordinates
    const enemyMapPos = this.mapGenerator.pixelToMap(this.x, this.y);
    const playerMapPos = this.mapGenerator.pixelToMap(player.x, player.y);

    // Use Bresenham's line algorithm to check for obstacles
    const line = this.getLinePoints(
      enemyMapPos.x,
      enemyMapPos.y,
      playerMapPos.x,
      playerMapPos.y
    );

    // Check each point on the line for obstacles
    const map = this.mapGenerator.getMap();
    for (const point of line) {
      // Skip the starting and ending points
      if (
        (point.x === enemyMapPos.x && point.y === enemyMapPos.y) ||
        (point.x === playerMapPos.x && point.y === playerMapPos.y)
      ) {
        continue;
      }

      // Check if the point is out of bounds
      if (
        point.x < 0 ||
        point.x >= map[0].length ||
        point.y < 0 ||
        point.y >= map.length
      ) {
        return false;
      }

      // Check if there's an obstacle at this point
      const tileType = map[point.y][point.x];
      if (tileType > TileType.FLOOR_ALT_5) {
        // If it's not a floor tile, it's an obstacle
        return false;
      }
    }

    // If we reach here, there's a clear line of sight
    return true;
  }

  /**
   * Implementation of Bresenham's line algorithm to get all points on a line
   * @param x0 Starting x coordinate
   * @param y0 Starting y coordinate
   * @param x1 Ending x coordinate
   * @param y1 Ending y coordinate
   * @returns Array of points on the line
   */
  private getLinePoints(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;
  }

  public getDistanceAttackRange(): number {
    return this.distanceAttackRange;
  }

  public setDistanceAttackRange(range: number): void {
    this.distanceAttackRange = range;
  }

  public setDistanceAttackCooldown(cooldown: boolean): void {
    this.distanceAttackCooldown = cooldown;
  }

  public getDistanceAttackCooldown(): boolean {
    return this.distanceAttackCooldown;
  }

  public takeDamage(amount: number, status: Status | null = null): void {
    if (this.takingDamage) {
      return;
    }

    if (!this.status) {
      this.status = status;
      this.status?.apply();
    }

    const statusType = this.status?.getType();

    this.takingDamage = true;
    this.health -= amount;

    if (this.healthBar && this.healthBar.bar.active) {
      this.healthBar.setHealth(this.health);
    }

    if (statusType === "fire") {
      this.tint = 0xffa500; // Orange for fire status
    } else {
      this.tint = 0xff0000; // Red for normal damage
    }

    if (this.health <= 0) {
      this.healthBar.destroy();
      this.destroy();
    }

    if (this.health && this.active)
      this.scene.time.delayedCall(this.takingDamageDuration, () => {
        this.takingDamage = false;
        this.tint = 0xffffff;
      });
  }

  public onStatusFinished(): void {
    this.status = null;
  }

  public doDamage(): number {
    if (this.attackCooldown) {
      return 0;
    }

    this.attackCooldown = true;

    this.scene.time.delayedCall(this.attackDuration, () => {
      this.attackCooldown = false;
    });

    return this.getDamage();
  }

  public getDamage(): number {
    return this.damage;
  }

  public getPrefix(): string {
    return this.prefix;
  }

  public getTakingDamageDuration(): number {
    return this.takingDamageDuration;
  }

  createAnimations(): void {
    this.anims.create({
      key: `${this.prefix}_idle`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 0,
        end: 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_down`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_up`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 9,
        end: 11,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_left`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 3,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_right`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 6,
        end: 8,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }
}
