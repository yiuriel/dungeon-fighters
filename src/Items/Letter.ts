import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";
import { NotesMap, NoteId } from "../Common/NoteMap";
import { ReadNote } from "../Graphics/ReadNote";

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

  public collect(_: Player, onNoteClose: () => void): void {
    // Collect the letter by player inventory
    if (NotesMap.has(this.noteId)) {
      const note = NotesMap.get(this.noteId);
      if (note) {
        // Display the note content
        const readNote = new ReadNote(this.scene, note, () => {
          onNoteClose();
        });
        readNote.show();
      }
    }
  }
}
