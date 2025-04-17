import Phaser from "phaser";
import Snake from "../Enemies/Snake";
import { Player } from "../Players/Player";

export class SnakeVenomProjectile extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 1500;
  private damage: number = 10;
  private speed: number = 150;
  private caster: Snake;
  private directionX: number = 0;
  private directionY: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Snake,
    damage: number,
    lifespan?: number,
    speed?: number
  ) {
    super(scene, x, y, texture);
    this.caster = caster;
    this.lifespan = lifespan || 5000;
    this.damage = damage;
    this.speed = speed || 100;

    this.createAnimations();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Calculate direction towards player
    const player = scene.children
      .getChildren()
      .find((child) => child instanceof Player);

    const offset = 25; // Initial distance from caster
    let directionX = 0;
    let directionY = 0;

    if (player && player instanceof Phaser.Physics.Arcade.Sprite) {
      // Calculate angle towards player
      const dx = player.x - this.caster.x;
      const dy = player.y - this.caster.y;
      const angle = Math.atan2(dy, dx);

      this.directionX = Math.cos(angle);
      this.directionY = Math.sin(angle);

      // Set position offset from caster
      this.x = this.caster.x + offset * directionX;
      this.y = this.caster.y + offset * directionY;

      // Set rotation to face player
      this.setRotation(angle);

      // Set appropriate hitbox based on angle
      if (this.body) {
        if (Math.abs(directionY) > Math.abs(directionX)) {
          // More vertical than horizontal
          this.body.setSize(10, 24);
          this.body.setOffset(11, 4);
        } else {
          // More horizontal than vertical
          this.body.setSize(24, 10);
          this.body.setOffset(4, 3);
        }
      }
    } else {
      // Fallback to caster's facing if player not found
      const facing = this.caster.getFacing();

      if (facing === "up") {
        this.directionX = 0;
        this.directionY = -1;
        this.y = this.caster.y - offset;
        this.x = this.caster.x;
        this.setRotation(-Math.PI / 2);
        if (this.body) {
          this.body.setSize(10, 24);
          this.body.setOffset(11, 4);
        }
      } else if (facing === "down") {
        this.directionX = 0;
        this.directionY = 1;
        this.y = this.caster.y + offset;
        this.x = this.caster.x;
        this.setRotation(Math.PI / 2);
        if (this.body) {
          this.body.setSize(10, 24);
          this.body.setOffset(11, 4);
        }
      } else if (facing === "left") {
        this.directionX = -1;
        this.directionY = 0;
        this.x = this.caster.x - offset;
        this.y = this.caster.y;
        this.setRotation(Math.PI);
        if (this.body) {
          this.body.setSize(24, 10);
          this.body.setOffset(4, 3);
        }
      } else if (facing === "right") {
        this.directionX = 1;
        this.directionY = 0;
        this.x = this.caster.x + offset;
        this.y = this.caster.y;
        if (this.body) {
          this.body.setSize(24, 10);
          this.body.setOffset(4, 3);
        }
      }
    }

    // Set depth to appear above other sprites
    this.setDepth(4);

    // Set tint to greenish color for venom appearance
    this.setTint(0x88ff88);

    // Play the animation
    this.play(this.getStartAnimationKey()).once("animationcomplete", () => {
      this.play(this.getIdleAnimationKey());
    });

    // Destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      // Fade opacity to 0.2 during lifespan
      scene.tweens.add({
        targets: this,
        alpha: 0.2,
        duration: 200,
        ease: "Linear",
      });

      if (this.active) {
        this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
          this.destroy();
        });
      }
    });
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers("snake_venom", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: this.getIdleAnimationKey(),
      frames: this.anims.generateFrameNumbers("snake_venom", {
        start: 4,
        end: 5,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers("snake_venom", {
        start: 6,
        end: 7,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Ensure velocity is maintained (in case it's reset elsewhere)
    if (this.active && this.body) {
      const speed = this.speed;
      this.body.velocity.x = this.directionX * speed;
      this.body.velocity.y = this.directionY * speed;
    }
  }

  public getDamage(): number {
    return this.damage;
  }

  public getStartAnimationKey(): string {
    return "snake_venom_start";
  }

  public getIdleAnimationKey(): string {
    return "snake_venom_idle";
  }

  public getEndAnimationKey(): string {
    return "snake_venom_end";
  }
}
