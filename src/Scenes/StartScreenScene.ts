import Phaser from "phaser";
import { WINDOW_CENTER, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";
import { FireMage } from "../Players/FireMage";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";

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
      .text(WINDOW_CENTER.x, 100, "DUNGEON FIGHTERS", {
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

    // Character selection text
    this.add
      .text(WINDOW_CENTER.x, 170, "SELECT YOUR CHARACTER", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Create character buttons
    this.createCharacterButton(WINDOW_CENTER.x - 180, 300, "mage", "Mage");
    this.createCharacterButton(
      WINDOW_CENTER.x + 180,
      300,
      "fire_mage",
      "Fire Mage"
    );

    // Add neon glow effect to start button
    const buttonGlow = this.add.rectangle(
      WINDOW_CENTER.x,
      500,
      320,
      100,
      0x8800ff,
      0.3
    );
    const buttonOutline = this.add.rectangle(
      WINDOW_CENTER.x,
      500,
      310,
      90,
      0xaa00ff,
      0.5
    );
    const button = this.add.rectangle(WINDOW_CENTER.x, 500, 300, 80, 0x6666ff);

    const buttonText = this.add
      .text(WINDOW_CENTER.x, 500, "START GAME", {
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

  createCharacterButton(
    x: number,
    y: number,
    spriteKey: string,
    label: string
  ) {
    // Create button background with glow
    const glow = this.add.rectangle(x, y, 180, 180, 0x8800ff, 0.3);
    const outline = this.add.rectangle(x, y, 170, 170, 0xaa00ff, 0.5);
    const button = this.add.rectangle(x, y, 160, 160, 0x6666ff);

    let player: Player;
    if (spriteKey === "fire_mage") {
      player = new FireMage(
        this,
        x,
        y,
        "fire_mage",
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    } else {
      player = new Mage(
        this,
        x,
        y,
        "mage",
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    }
    player.setScale(1.8);

    // Add label
    this.add
      .text(x, y + 60, label, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Check if this character is already selected
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    if (selectedCharacter === spriteKey) {
      button.fillColor = 0x44aaff;
    }

    // Make button interactive
    button
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        if (button.fillColor !== 0x44aaff) {
          // Only change if not active
          button.fillColor = 0x8888ff;
        }
        glow.setScale(1.05);
        outline.setScale(1.03);
        player.setScale(2.0);
      })
      .on("pointerout", () => {
        if (button.fillColor !== 0x44aaff) {
          // Only change if not active
          button.fillColor = 0x6666ff;
        }
        glow.setScale(1);
        outline.setScale(1);
        player.setScale(1.8);
      })
      .on("pointerdown", () => {
        // Reset all other buttons
        this.children.list.forEach((child) => {
          if (
            child instanceof Phaser.GameObjects.Rectangle &&
            child !== button &&
            child.width === 160 &&
            child.height === 160
          ) {
            child.fillColor = 0x6666ff;
          }
        });

        // Store selected character
        localStorage.setItem("selectedCharacter", spriteKey);

        // Highlight selected button
        button.fillColor = 0x44aaff;
      });

    return button;
  }
}
