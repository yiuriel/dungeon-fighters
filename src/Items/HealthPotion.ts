import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";

export class HealthPotion extends Item {
  private healAmount: number;
  private readonly baseHealAmount: number = 5;
  private readonly frameNumber: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a potion frame between 4-7
    super(scene, x, y, "potions", ItemType.POTION);
    this.frameNumber = Phaser.Math.Between(4, 7);

    // Calculate heal amount based on frame (larger frame = more healing)
    this.healAmount = this.baseHealAmount + Math.floor(this.frameNumber * 2);

    // Set the specific frame from the potions spritesheet
    this.setFrame(this.frameNumber);
  }

  public use(player: Player): void {
    // Transform frame number from 1 to 4
    const frameNumber = this.frameNumber - 3;
    this.scene.sound.play(`potion_${frameNumber}`);
    if (this.canUse(player)) {
      player.heal(this.healAmount);
      this.destroy();
    }
  }

  public canUse(player: Player): boolean {
    return player.getHealth() < player.getMaxHealth();
  }
}
