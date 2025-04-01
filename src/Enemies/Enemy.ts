import { Player } from "../Players/Player";

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected damage: number;
  protected prefix: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    prefix: string,
    frame?: string | number,
    health?: number,
    speed?: number,
    damage?: number
  ) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health || 100;
    this.speed = speed || 100;
    this.damage = damage || 10;
    this.prefix = prefix;

    this.createAnimations();
  }

  update(): void {
    this.handleMovement();
    this.updateSpecific();
  }

  protected abstract updateSpecific(): void;

  protected handleMovement(): void {
    // Common enemy movement logic
    const player = this.scene.children
      .getChildren()
      .find((child) => child instanceof Player);

    if (player) {
      // Move towards player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
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

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  public getDamage(): number {
    return this.damage;
  }

  public getPrefix(): string {
    return this.prefix;
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
