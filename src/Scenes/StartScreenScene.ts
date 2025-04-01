import Phaser from "phaser";
import { WINDOW_CENTER, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";

export default class StartScreenScene extends Phaser.Scene {
  constructor() {
    super("StartScreenScene");
  }

  preload() {
    // Load any assets needed for the start screen
  }

  create() {
    // Add title text with retro style
    const title = this.add
      .text(WINDOW_CENTER.x, 150, "DUNGEON FIGHTERS", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 5,
          stroke: true,
        },
      })
      .setOrigin(0.5);

    // Add pixelated effect and animation to title
    title.setPipeline("Pixelate");

    // Add neon glow effect to button using multiple rectangles
    const buttonGlow = this.add.rectangle(
      WINDOW_CENTER.x,
      350,
      320,
      100,
      0x8800ff,
      0.3
    );
    const buttonOutline = this.add.rectangle(
      WINDOW_CENTER.x,
      350,
      310,
      90,
      0xaa00ff,
      0.5
    );
    const button = this.add.rectangle(WINDOW_CENTER.x, 350, 300, 80, 0x6666ff);

    const buttonText = this.add
      .text(WINDOW_CENTER.x, 350, "CREATE ROOM", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Make button interactive with enhanced effects
    button
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("LevelScene"))
      .on("pointerover", () => {
        button.fillColor = 0x8888ff;
        buttonGlow.setScale(1.1);
        buttonOutline.setScale(1.05);
        this.tweens.add({
          targets: buttonText,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
        });
      })
      .on("pointerout", () => {
        button.fillColor = 0x6666ff;
        buttonGlow.setScale(1);
        buttonOutline.setScale(1);
        this.tweens.add({
          targets: buttonText,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });

    // Add some retro decoration
    // Add a full-screen decorative grid background
    this.add
      .grid(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        WINDOW_WIDTH - 40,
        WINDOW_HEIGHT - 40,
        32,
        32,
        0x000000,
        0,
        0xff00ff,
        0.2
      )
      .setDepth(-1);
  }
}
