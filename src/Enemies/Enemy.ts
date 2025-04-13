import { Status } from "../Common/Status";
import { Player } from "../Players/Player";

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected damage: number;
  protected prefix: string;
  protected attackCooldown: boolean = false;
  protected attackDuration: number = 1000;

  protected takingDamage: boolean = false;
  protected takingDamageDuration: number = 1000;
  protected status: Status | null = null;

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

    this.setDepth(10);

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

    if (statusType === "fire") {
      this.tint = 0xffa500; // Orange for fire status
    } else {
      this.tint = 0xff0000; // Red for normal damage
    }

    if (this.health <= 0) {
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
