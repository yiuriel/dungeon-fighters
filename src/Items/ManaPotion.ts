import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";
import { Mage } from "../Players/Mage";
import { FireMage } from "../Players/FireMage";

export class ManaPotion extends Item {
  private manaAmount: number;
  private readonly baseManaAmount: number = 10;
  private readonly frameNumber: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a potion frame between 0-3 (blue potions)
    super(scene, x, y, "potions", ItemType.POTION);
    this.frameNumber = Phaser.Math.Between(0, 3);

    // Calculate mana amount based on frame (larger frame = more mana)
    this.manaAmount = this.baseManaAmount + Math.floor(this.frameNumber * 3);

    // Set the specific frame from the potions spritesheet
    this.setFrame(this.frameNumber);
  }

  public use(player: Player): void {
    this.scene.sound.play(`potion_${this.frameNumber + 1}`);
    if (this.canUse(player)) {
      if (player instanceof Mage) {
        player.regenerateMana(this.manaAmount);
      } else if (player instanceof FireMage) {
        player.regenerateMana(this.manaAmount);
      }
      this.destroy();
    }
  }

  public canUse(player: Player): boolean {
    return (
      (player instanceof Mage || player instanceof FireMage) &&
      player.getMana() < player.getMaxMana()
    );
  }
}
