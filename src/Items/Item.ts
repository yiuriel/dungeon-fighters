import Phaser from "phaser";
import { Player } from "../Players/Player";

export enum ItemType {
  GOLD = "gold",
  POTION = "potion",
  SCEPTER = "scepter",
}

export class Item extends Phaser.Physics.Arcade.Sprite {
  public itemType: ItemType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    type: ItemType = ItemType.GOLD
  ) {
    super(scene, x, y, texture);

    this.itemType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2);
    this.setDepth(2);
  }

  public getType(): ItemType {
    return this.itemType;
  }

  // Method to be overridden by child classes
  public use(_: Player): void {
    // Base implementation does nothing
    console.log(`Item of type ${this.itemType} used by player`);
  }

  // Method to be overridden by child classes to determine if item can be used
  public canUse(_: Player): boolean {
    return true;
  }
}
