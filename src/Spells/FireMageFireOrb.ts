import Phaser from "phaser";
import { FireMage } from "../Players/FireMage";

export class FireMageFireOrb extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 750; // milliseconds
  private damage: number = 15;
  private caster: FireMage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: FireMage,
    damage: number,
    lifespan?: number
  ) {
    super(scene, x, y, texture);
    this.caster = caster;
    this.lifespan = lifespan || 750;
    this.damage = damage;

    this.createAnimations();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set position based on caster's facing direction
    const facing = caster.getFacing();
    const offset = 100; // Distance from caster

    if (facing === "up") {
      this.y = caster.y - offset;
      this.x = caster.x;
    } else if (facing === "down") {
      this.y = caster.y + offset;
      this.x = caster.x;
    } else if (facing === "left") {
      this.x = caster.x - offset;
      this.y = caster.y;
    } else if (facing === "right") {
      this.x = caster.x + offset;
      this.y = caster.y;
    }

    // Set depth to appear above other sprites
    this.setDepth(1);
    this.setVelocity(0, 0);

    // Play the animation
    this.play(this.getStartAnimationKey()).once("animationcomplete", () => {
      this.play(this.getIdleAnimationKey());
    });

    // Set collision size
    if (this.body) {
      this.body.setSize(20, 20); // Slightly larger hitbox for fire orb
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setAllowDrag(false);
        this.body.setAllowGravity(false);
      }
    }

    // Play sound
    this.scene.sound.play("fireorb");

    // Add fire particles
    const particles = scene.add.particles(0, 0, texture, {
      alpha: { start: 1, end: 0 },
      scale: { start: 0.7, end: 0.5 },
      speed: 50,
      lifespan: 1000,
      blendMode: "ADD",
      frequency: 50,
      x: this.x,
      y: this.y,
    });
    particles.startFollow(this);

    // Fade opacity to 0.5 during lifespan (less fade for fire effect)
    scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: this.lifespan,
      ease: "Linear",
    });

    // Play end animation then destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      particles.destroy();
      if (this.active) {
        this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
          this.destroy();
        });
      }
    });
  }

  getDamage(): number {
    return this.damage * this.caster?.getDamageMultiplier();
  }

  getStartAnimationKey(): string {
    return `fire_mage_fire_orb_start`;
  }

  getIdleAnimationKey(): string {
    return `fire_mage_fire_orb_idle`;
  }

  getEndAnimationKey(): string {
    return `fire_mage_fire_orb_end`;
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_orb", {
        start: 0,
        end: 3,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: this.getIdleAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_orb", {
        start: 4,
        end: 11,
      }),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_orb", {
        start: 12,
        end: 22,
      }),
      frameRate: 16,
      repeat: 0,
    });
  }
}
