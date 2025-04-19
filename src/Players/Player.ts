import { HealthBar } from "../Common/HealthBar";
import { Status } from "../Common/Status";

export abstract class Player extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected prefix: string;
  protected facing: string = "down";
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected healthBar: HealthBar;
  protected maxHealth: number = 100;
  protected damageMultiplier: number = 1.0;
  protected status: Status | null = null;

  protected takingDamageCooldown: boolean = false;
  protected canMove: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    prefix: string,
    frame?: string | number,
    health?: number,
    speed?: number,
    skipBars?: boolean
  ) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health || 100;
    this.speed = speed || 150;
    this.prefix = prefix;

    this.healthBar = new HealthBar(scene, this, this.health);
    if (skipBars) {
      this.healthBar.destroy();
    }

    this.setDepth(10);
    this.setScale(1.8);

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.cursors = scene.input.keyboard.createCursorKeys();

    this.createAnimations();
  }

  update(): void {
    if (this.canMove) {
      this.handleMovement();
    }
    this.updateSpecific();
  }

  protected abstract updateSpecific(): void;

  protected handleMovement(): void {
    // Reset velocity
    this.setVelocity(0);

    // Handle keyboard movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.facing = "left";
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.facing = "right";
    }

    if (this.cursors.up.isDown) {
      this.setVelocityY(-this.speed);
      // Only change facing if not moving horizontally
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.facing = "up";
      }
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(this.speed);
      // Only change facing if not moving horizontally
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.facing = "down";
      }
    }

    // Update animation based on movement
    this.updateAnimation(
      this.body?.velocity?.x || 0,
      this.body?.velocity?.y || 0
    );
  }

  protected updateAnimation(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) {
      this.anims.play(`${this.prefix}_idle_${this.facing}`, true);
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Moving horizontally
      if (dx > 0) {
        this.anims.play(`${this.prefix}_walk_right`, true);
        this.facing = "right";
      } else {
        this.anims.play(`${this.prefix}_walk_left`, true);
        this.facing = "left";
      }
    } else {
      // Moving vertically
      if (dy > 0) {
        this.anims.play(`${this.prefix}_walk_down`, true);
        this.facing = "down";
      } else {
        this.anims.play(`${this.prefix}_walk_up`, true);
        this.facing = "up";
      }
    }
  }

  takeDamage(amount: number, status: Status | null = null): void {
    if (this.takingDamageCooldown) {
      return;
    }
    this.takingDamageCooldown = true;
    this.health -= amount;
    this.healthBar.setHealth(this.health);

    if (!this.status) {
      this.status = status;
      this.status?.apply();
    }

    const statusType = this.status?.getType();
    if (statusType === "venom") {
      this.tint = 0x00ff00; // Green for venom damage
    } else {
      this.tint = 0xff0000; // Red for normal damage
    }

    if (this.health <= 0) {
      if (this.scene.events) {
        this.scene.events.emit("playerDied");
      }
      this.healthBar.destroy();
      this.destroy();
    }

    if (this.health && this.active)
      this.scene.time.delayedCall(500, () => {
        this.takingDamageCooldown = false;
        this.tint = 0xffffff;
      });
  }

  smallKnockback(): void {
    if (!this.canMove || !this.active) {
      return;
    }

    const facing = this.facing;
    const knockbackDistance = 100;
    const knockbackDuration = 200;

    this.canMove = false;

    if (facing === "up") {
      this.setVelocityY(knockbackDistance);
    } else if (facing === "down") {
      this.setVelocityY(-knockbackDistance);
    } else if (facing === "left") {
      this.setVelocityX(knockbackDistance);
    } else if (facing === "right") {
      this.setVelocityX(-knockbackDistance);
    }

    this.scene.time.delayedCall(knockbackDuration, () => {
      if (this.active) {
        this.setVelocity(0);
        this.canMove = true;
      }
    });
  }

  getPrefix(): string {
    return this.prefix;
  }

  getFacing(): string {
    return this.facing;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  heal(amount: number): void {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.healthBar.setHealth(this.health);
  }

  createAnimations(): void {
    this.anims.create({
      key: `${this.prefix}_idle_down`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 1,
        end: 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_idle_up`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 9,
        end: 9,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_idle_left`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 3,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_idle_right`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        start: 6,
        end: 6,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_down`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        frames: [0, 1, 2, 1],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_up`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        frames: [9, 10, 11, 10],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_left`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        frames: [3, 4, 5, 4],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.prefix}_walk_right`,
      frames: this.anims.generateFrameNumbers(this.prefix, {
        frames: [6, 7, 8, 7],
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  public setDamageMultiplier(damageMultiplier: number): void {
    this.damageMultiplier = damageMultiplier;
  }

  public getDamageMultiplier(): number {
    return this.damageMultiplier;
  }

  public getStatus(): Status | null {
    return this.status;
  }

  public setStatus(status: Status | null): void {
    this.status = status;
  }

  public onStatusFinished(): void {
    this.status = null;
  }

  destroy(fromScene?: boolean) {
    this.healthBar.destroy();

    super.destroy(fromScene); // Call Phaser's built-in destroy
  }
}
