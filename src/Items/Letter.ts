import Phaser from "phaser";
import { NoteId } from "../Common/NoteMap";
import { Item, ItemType } from "./Item";

export class Letter extends Item {
  private noteId: NoteId;

  constructor(scene: Phaser.Scene, x: number, y: number, noteId: NoteId) {
    super(scene, x, y, "letter", ItemType.LETTER);
    this.noteId = noteId;

    this.setFrame(0);

    // Add a slight bobbing animation
    scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public collect(): NoteId {
    // Play sound
    this.scene.sound.play("letter_collect");
    this.destroy();
    return this.noteId;
  }
}
