import Phaser from "phaser";
import { Mage } from "../Players/Mage";

export class MageProjectileSpell extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 1500;
  private damage: number = 15;
  private speed: number = 200;
  private caster: Mage;

  private initialFacing: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Mage,
    damage: number,
    lifespan?: number,
    speed?: number
  ) {
    super(scene, x, y, texture);
    this.caster = caster;
    this.lifespan = lifespan || 1500;
    this.damage = damage;
    this.speed = speed || 200;

    this.createAnimations();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set position and velocity based on caster's facing direction
    const facing = caster.getFacing();
    const offset = 10; // Initial distance from caster

    this.initialFacing = facing;

    if (facing === "up") {
      this.y = caster.y - offset;
      this.x = caster.x;
      this.setRotation(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
      if (this.body) {
        this.body.setSize(16, 20); // Taller than wide for vertical movement
        this.body.setOffset(4, 0);
      }
    } else if (facing === "down") {
      this.y = caster.y + offset;
      this.x = caster.x;
      this.setRotation(Math.PI / 2); // Rotate 90 degrees clockwise
      if (this.body) {
        this.body.setSize(16, 20); // Taller than wide for vertical movement
        this.body.setOffset(4, 0);
      }
    } else if (facing === "left") {
      this.x = caster.x - offset;
      this.y = caster.y;
      this.setRotation(Math.PI); // Rotate 180 degrees
      if (this.body) {
        this.body.setSize(20, 16); // Wider than tall for horizontal movement
        this.body.setOffset(4, 0);
      }
    } else if (facing === "right") {
      this.x = caster.x + offset;
      this.y = caster.y;
      // No rotation needed as projectile already points right
      if (this.body) {
        this.body.setSize(20, 16); // Wider than tall for horizontal movement
        this.body.setOffset(4, 0);
      }
    }

    // Set depth to appear above other sprites
    this.setDepth(5);

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
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_projectile_spell`,
        {
          start: 0,
          end: 1,
        }
      ),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: this.getIdleAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_projectile_spell`,
        {
          start: 2,
          end: 3,
        }
      ),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_projectile_spell`,
        {
          start: 4,
          end: 7,
        }
      ),
      frameRate: 16,
      repeat: 0,
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Ensure velocity is maintained (in case it's reset elsewhere)
    if (this.active && this.body) {
      const speed = this.speed;
      switch (this.initialFacing) {
        case "left":
          this.body.velocity.x = -speed;
          break;
        case "right":
          this.body.velocity.x = speed;
          break;
        case "up":
          this.body.velocity.y = -speed;
          break;
        case "down":
          this.body.velocity.y = speed;
          break;
      }
    }
  }

  public getDamage(): number {
    return this.damage * this.caster?.getDamageMultiplier();
  }

  public getStartAnimationKey(): string {
    return `${this.caster.getPrefix()}_projectile_spell_start`;
  }

  public getIdleAnimationKey(): string {
    return `${this.caster.getPrefix()}_projectile_spell_idle`;
  }

  public getEndAnimationKey(): string {
    return `${this.caster.getPrefix()}_projectile_spell_end`;
  }
}
