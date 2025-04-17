import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { MapGenerator } from "../Map/MapGenerator";

export default class Octopus extends Enemy {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    mapGenerator: MapGenerator,
    frame?: string | number
  ) {
    super(
      scene,
      x,
      y,
      "octopus",
      mapGenerator,
      "octopus",
      frame,
      75,
      Phaser.Math.Between(25, 40),
      Phaser.Math.Between(10, 20),
      100
    );

    // Set up a smaller collision box at the bottom of the sprite
    if (this.body) {
      this.body.setSize(24, 16);
      this.body.setOffset(4, 16);
    }

    this.anims.play(`${this.prefix}_idle`, true);
  }

  protected updateSpecific(): void {
    if (
      !this.getDistanceAttackCooldown() &&
      this.canHitPlayerWithDistanceAttack()
    ) {
      this.setDistanceAttackCooldown(true);
      console.log("Octopus can hit player with distance attack");

      this.scene.time.delayedCall(5000, () => {
        this.setDistanceAttackCooldown(false);
      });
    }
  }
}
