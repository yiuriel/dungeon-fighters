import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";
import { Mage } from "../Players/Mage";
import { FireMage } from "../Players/FireMage";

export class HealthManaPotion extends Item {
  private healAmount: number;
  private manaAmount: number;
  private readonly baseHealAmount: number = 5;
  private readonly baseManaAmount: number = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use purple potion frames (8-11)
    const frame = Phaser.Math.Between(8, 10);
    super(scene, x, y, "potions", ItemType.POTION);

    // Calculate amounts based on frame (larger frame = more healing and mana)
    this.healAmount = this.baseHealAmount + Math.floor(frame * 1.5);
    this.manaAmount = this.baseManaAmount + Math.floor(frame * 2);

    // Set the specific frame from the potions spritesheet
    this.setFrame(frame);
  }

  public use(player: Player): void {
    this.scene.sound.play("pickup_potion");
    if (this.canUse(player)) {
      player.heal(this.healAmount);

      if (player instanceof Mage || player instanceof FireMage) {
        player.regenerateMana(this.manaAmount);
      }

      this.destroy();
    }
  }

  public canUse(player: Player): boolean {
    const needsHealth = player.getHealth() < player.getMaxHealth();
    const needsMana =
      (player instanceof Mage || player instanceof FireMage) &&
      player.getMana() < player.getMaxMana();
    return needsHealth || needsMana;
  }
}
