import Phaser from "phaser";
import { ReadNote } from "../Graphics/ReadNote";
import { SceneManager } from "../helpers/SceneManager";

export default class ReadNoteScene extends Phaser.Scene {
  private parentScene: Phaser.Scene | undefined;
  private readNote: ReadNote | undefined;
  private sceneManager: SceneManager;
  private noteText: string;
  private onCloseCallback?: () => void;

  constructor() {
    super("ReadNoteScene");

    this.parentScene = undefined;
    this.readNote = undefined;
    this.sceneManager = new SceneManager(this);
    this.noteText = "";
    this.onCloseCallback = undefined;
  }

  init(data: {
    text: string;
    parentScene: Phaser.Scene;
    onClose?: () => void;
  }) {
    this.noteText = data.text;
    this.parentScene = data.parentScene;
    this.onCloseCallback = data.onClose;

    // Pause the parent scene
    if (this.parentScene) {
      this.parentScene.scene.pause();
    }
  }

  create() {
    this.sceneManager.fadeIn(300);

    // Create the note
    this.readNote = new ReadNote(this, this.noteText, () => {
      this.closeNote();
    });

    // Show the note
    if (this.readNote) {
      this.readNote.show();
    }

    // Add keyboard event to close the note
    if (!this.input?.keyboard) {
      return;
    }

    this.input.keyboard.once("keydown-ESC", () => {
      this.closeNote();
    });
  }

  private closeNote() {
    // Resume the parent scene
    if (this.parentScene) {
      this.parentScene.scene.resume();
    }

    // Call the callback if provided
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }

    // Destroy this scene
    this.scene.stop();
  }
}
