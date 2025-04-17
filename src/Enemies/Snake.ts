import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { MapGenerator } from "../Map/MapGenerator";
import { SnakeVenomProjectile } from "../Spells/SnakeVenomProjectile";

export default class Snake extends Enemy {
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
      "snake",
      mapGenerator,
      "snake",
      frame,
      100,
      Phaser.Math.Between(10, 25),
      Phaser.Math.Between(20, 40),
      150
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

      const venomSpell = new SnakeVenomProjectile(
        this.scene,
        this.x,
        this.y,
        "snake_venom",
        this,
        this.getDamage(),
        2000,
        120
      );

      this.scene.events.emit("venomSpellFired", venomSpell);

      this.scene.time.delayedCall(5000, () => {
        this.setDistanceAttackCooldown(false);
      });
    }
  }
}
