import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";
import { Mage } from "../Players/Mage";
import { FireMage } from "../Players/FireMage";

export class ManaPotion extends Item {
  private manaAmount: number;
  private readonly baseManaAmount: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a potion frame between 0-3 (blue potions)
    const frame = Phaser.Math.Between(0, 3);
    super(scene, x, y, "potions", ItemType.POTION);

    // Calculate mana amount based on frame (larger frame = more mana)
    this.manaAmount = this.baseManaAmount + Math.floor(frame * 3);

    // Set the specific frame from the potions spritesheet
    this.setFrame(frame);
  }

  public use(player: Player): void {
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
    return player instanceof Mage || player instanceof FireMage;
  }
}
