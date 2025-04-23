import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";

export class HealthPotion extends Item {
  private healAmount: number;
  private readonly baseHealAmount: number = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a potion frame between 4-7
    const frame = Phaser.Math.Between(4, 7);
    super(scene, x, y, "potions", ItemType.POTION);

    // Calculate heal amount based on frame (larger frame = more healing)
    this.healAmount = this.baseHealAmount + Math.floor(frame * 2);

    // Set the specific frame from the potions spritesheet
    this.setFrame(frame);
  }

  public use(player: Player): void {
    this.scene.sound.play("pickup_potion");
    if (this.canUse(player)) {
      player.heal(this.healAmount);
      this.destroy();
    }
  }

  public canUse(player: Player): boolean {
    return player.getHealth() < player.getMaxHealth();
  }
}
