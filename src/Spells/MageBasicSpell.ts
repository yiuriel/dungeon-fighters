import Phaser from "phaser";
import { Mage } from "../Players/Mage";

export class MageBasicSpell extends Phaser.Physics.Arcade.Sprite {
  private lifespan: number = 1000; // milliseconds
  private caster: Mage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Mage
  ) {
    super(scene, x, y, texture);
    this.caster = caster;

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
    this.setDepth(1000);
    this.setVelocity(0, 0);

    // Play the animation
    this.play(`${caster.getPrefix()}_basic_spell_start`).once(
      "animationcomplete",
      () => {
        this.play(`${caster.getPrefix()}_basic_spell_idle`);
      }
    );

    // Set collision size
    if (this.body) {
      this.body.setSize(10, 10);
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setAllowDrag(false);
        this.body.setAllowGravity(false);
      }
    }

    // Play end animation then destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      this.play(`${caster.getPrefix()}_basic_spell_end`).once(
        "animationcomplete",
        () => {
          this.destroy();
        }
      );
    });
  }

  private createAnimations(): void {
    this.anims.create({
      key: `${this.caster.getPrefix()}_basic_spell_start`,
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 0,
          end: 3,
        }
      ),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: `${this.caster.getPrefix()}_basic_spell_idle`,
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 4,
          end: 5,
        }
      ),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: `${this.caster.getPrefix()}_basic_spell_end`,
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_basic_spell`,
        {
          start: 6,
          end: 9,
        }
      ),
      frameRate: 12,
      repeat: 0,
    });
  }
}
