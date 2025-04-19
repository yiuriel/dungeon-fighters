import { WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";

export class ReadNote {
  private scene: Phaser.Scene;
  private noteContainer: Phaser.GameObjects.Container;
  private onCloseCallback: () => void;
  private resolvePromise!: () => void;

  constructor(scene: Phaser.Scene, text: string, onClose?: () => void) {
    this.scene = scene;
    this.onCloseCallback = onClose || (() => {});

    // Create container for the note
    this.noteContainer = this.scene.add.container(0, 0);
    this.noteContainer.setScrollFactor(0);

    // Add semi-transparent background
    const bg = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.7
    );
    this.noteContainer.add(bg);

    // Create note background
    const noteWidth = WINDOW_WIDTH * 0.8;
    const noteHeight = WINDOW_HEIGHT * 0.8;
    const noteBackground = this.scene.add
      .rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        noteWidth,
        noteHeight,
        0xf8f0d4,
        1
      )
      .setStrokeStyle(4, 0x6b5c3f);
    this.noteContainer.add(noteBackground);

    // Add text
    const noteText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 30,
        text,
        {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#000000",
          align: "center",
          wordWrap: { width: noteWidth - 50 },
        }
      )
      .setOrigin(0.5);
    this.noteContainer.add(noteText);

    // Add continue button
    const continueButton = this.scene.add
      .rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - noteHeight / 2 + 150,
        150,
        40,
        0x6b5c3f
      )
      .setInteractive({ useHandCursor: true })
      .setDepth(2000)
      .on("pointerdown", this.close, this)
      .on("pointerover", () => {
        continueButton.setScale(1.1);
      })
      .on("pointerout", () => {
        continueButton.setScale(1);
      });

    const buttonText = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - noteHeight / 2 + 150,
        "Continue",
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5)
      .on("pointerover", () => {
        continueButton.setScale(1.1);
      })
      .on("pointerout", () => {
        continueButton.setScale(1);
      });

    this.noteContainer.add(continueButton);
    this.noteContainer.add(buttonText);

    // Set container depth to ensure it's on top
    this.noteContainer.setDepth(3000);
  }

  show(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  close(): void {
    // Remove the note
    this.noteContainer.destroy();

    // Call the callback
    this.onCloseCallback();

    // Resolve the promise
    if (this.resolvePromise) {
      this.resolvePromise();
    }
  }
}
