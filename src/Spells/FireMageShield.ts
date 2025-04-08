import Phaser from "phaser";
import { FireMage } from "../Players/FireMage";

export class FireMageShield extends Phaser.Physics.Arcade.Sprite {
  private duration: number;
  private fireOwner: FireMage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    owner: FireMage,
    duration: number = 5000
  ) {
    super(scene, x, y, "fire_shield");

    this.fireOwner = owner;
    this.duration = duration;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5);

    this.createAnimations();

    this.play(this.getStartAnimationKey()).once("animationcomplete", () => {
      this.play({
        key: this.getIdleAnimationKey(),
        duration: this.duration,
      }).once("animationcomplete", () => {
        this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
          this.destroyShield();
        });
      });
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // Follow the fire mage
    if (this.fireOwner && this.fireOwner.active) {
      this.x = this.fireOwner.x;
      this.y = this.fireOwner.y;
    } else {
      this.destroyShield();
    }
  }

  destroyShield() {
    this.destroy();
  }

  getStartAnimationKey(): string {
    return "fire_shield_start";
  }

  getIdleAnimationKey(): string {
    return "fire_shield_idle";
  }

  getEndAnimationKey(): string {
    return "fire_shield_end";
  }

  private createAnimations(): void {
    this.anims.create({
      key: "fire_shield_start",
      frames: this.anims.generateFrameNumbers("fire_mage_shield", {
        start: 0,
        end: 8,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: "fire_shield_idle",
      frames: this.anims.generateFrameNumbers("fire_mage_shield", {
        frames: [9, 10, 11, 10, 9, 10, 11, 10, 9, 10, 11, 10, 9, 10, 11, 10],
      }),
      frameRate: 16,
      yoyo: true,
      repeat: 0,
    });

    this.anims.create({
      key: "fire_shield_end",
      frames: this.anims.generateFrameNumbers("fire_mage_shield", {
        start: 8,
        end: 0,
      }),
      frameRate: 16,
      repeat: 0,
    });
  }
}
