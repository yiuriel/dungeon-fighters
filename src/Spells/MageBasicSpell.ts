import Phaser from "phaser";
import { Mage } from "../Players/Mage";

export class MageBasicSpell extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 750; // milliseconds
  private damage: number = 10;
  private caster: Mage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Mage,
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
    this.setDepth(0);
    this.setVelocity(0, 0);

    // Play the animation
    this.play(this.getStartAnimationKey()).once("animationcomplete", () => {
      this.play(this.getIdleAnimationKey());
    });

    // Set collision size
    if (this.body) {
      this.body.setSize(10, 10);
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setAllowDrag(false);
        this.body.setAllowGravity(false);
      }
    }

    // Fade opacity to 0.35 during lifespan
    scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: this.lifespan,
      ease: "Linear",
    });

    // Play end animation then destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
        this.destroy();
      });
    });
  }

  getDamage(): number {
    return this.damage * this.caster?.getDamageMultiplier();
  }

  getStartAnimationKey(): string {
    return `${this.caster.getPrefix()}_basic_spell_start`;
  }

  getIdleAnimationKey(): string {
    return `${this.caster.getPrefix()}_basic_spell_idle`;
  }

  getEndAnimationKey(): string {
    return `${this.caster.getPrefix()}_basic_spell_end`;
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 0,
          end: 3,
        }
      ),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: this.getIdleAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 4,
          end: 5,
        }
      ),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 6,
          end: 9,
        }
      ),
      frameRate: 16,
      repeat: 0,
    });
  }
}
