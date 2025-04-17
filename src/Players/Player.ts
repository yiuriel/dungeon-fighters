import { HealthBar } from "../Common/HealthBar";

export abstract class Player extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected prefix: string;
  protected facing: string = "down";
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected healthBar: HealthBar;

  protected takingDamageCooldown: boolean = false;

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

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.cursors = scene.input.keyboard.createCursorKeys();

    this.createAnimations();
  }

  update(): void {
    this.handleMovement();
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

  takeDamage(amount: number): void {
    if (this.takingDamageCooldown) {
      return;
    }
    this.takingDamageCooldown = true;
    this.scene.time.delayedCall(500, () => {
      this.takingDamageCooldown = false;
    });
    this.health -= amount;
    this.healthBar.setHealth(this.health);
    if (this.health <= 0) {
      this.healthBar.destroy();
      this.destroy();
    }
  }

  getPrefix(): string {
    return this.prefix;
  }

  getFacing(): string {
    return this.facing;
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

  destroy(fromScene?: boolean) {
    this.healthBar.destroy();

    super.destroy(fromScene); // Call Phaser's built-in destroy
  }
}
