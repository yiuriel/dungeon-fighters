import Phaser from "phaser";
import { FireMage } from "../Players/FireMage";

export class FireMageFireCircle extends Phaser.Physics.Arcade.Sprite {
  fireOwner: FireMage;
  damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, owner: FireMage) {
    super(scene, x, y, "fire_circle");

    this.fireOwner = owner;
    this.damage = owner.getFireCircleDamage();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setVelocity(0, 0);
    this.setScale(2);

    if (this.body) {
      this.body.setSize(80, 80);
      this.body.setOffset(8, 8);
    }

    this.createAnimations();

    this.play(this.getStartAnimationKey()).once("animationcomplete", () => {
      this.play({
        key: this.getActiveAnimationKey(),
        repeat: 6,
      }).once("animationcomplete", () => {
        this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
          this.destroy();
        });
      });
    });
  }

  getStartAnimationKey(): string {
    return "fire_circle_start";
  }

  getActiveAnimationKey(): string {
    return "fire_circle_active";
  }

  getEndAnimationKey(): string {
    return "fire_circle_end";
  }

  getDamage(): number {
    return this.damage * this.fireOwner?.getDamageMultiplier();
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_circle", {
        start: 0,
        end: 4,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: this.getActiveAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_circle", {
        start: 4,
        end: 5,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers("fire_mage_circle", {
        frames: [5, 4, 3, 2, 1, 0],
      }),
      frameRate: 16,
      repeat: 0,
    });
  }
}
