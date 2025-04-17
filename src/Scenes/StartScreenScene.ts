import Phaser from "phaser";
import { WINDOW_CENTER, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";
import { FireMage } from "../Players/FireMage";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";
import { MapGenerator } from "../Map/MapGenerator";

export default class StartScreenScene extends Phaser.Scene {
  private selectedCharacter: string | null = null;
  selectedCharacterButtonText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("StartScreenScene");
  }

  create() {
    // Add background image with preserved aspect ratio
    this.add
      .image(WINDOW_CENTER.x, WINDOW_CENTER.y - 100, "game_cover")
      .setDepth(-2);

    // Add title text with retro style
    const title = this.add
      .text(WINDOW_CENTER.x, 100, "FIRST LIGHT", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ffffa0",
        letterSpacing: 5,
        stroke: "#FFA500",
        strokeThickness: 6,
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: "#ffcc00",
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

    // Add controls UI
    this.createControlsUI(WINDOW_CENTER.x, 420);

    // Add neon glow effect to start button
    const buttonGlow = this.add.rectangle(
      WINDOW_CENTER.x,
      550,
      320,
      100,
      0x8800ff,
      0.3
    );
    const buttonOutline = this.add.rectangle(
      WINDOW_CENTER.x,
      550,
      310,
      90,
      0xaa00ff,
      0.5
    );
    const button = this.add.rectangle(WINDOW_CENTER.x, 550, 300, 80, 0x6666ff);

    const buttonText = this.add
      .text(WINDOW_CENTER.x, 550, "START GAME", {
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

    // Add a more transparent overlay grid for decoration
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
        0.1
      )
      .setDepth(-1);
  }

  createControlsUI(x: number, y: number) {
    // Create container for controls
    const controlsPanel = this.add.rectangle(x, y + 30, 500, 80, 0x000000, 0.5);
    controlsPanel.setStrokeStyle(2, 0xaa00ff, 0.8);

    // Controls title
    this.add
      .text(x, y + 10, "CONTROLS", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Arrow keys for movement
    this.add
      .text(x - 100, y + 30, "ARROW KEYS", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffcc00",
      })
      .setOrigin(0.5);

    this.add
      .text(x - 100, y + 50, "Movement", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Attack & Defense Keys
    this.add
      .text(x + 100, y + 30, "Z, X, C", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffcc00",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setOrigin(0.5);

    this.selectedCharacterButtonText = this.add
      .text(
        x + 100,
        y + 50,
        localStorage.getItem("selectedCharacter") === "mage"
          ? "Spell, Projectile, Teleport"
          : "Shield, Fire Circle, Fire Orb",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);
  }

  changeButtonText() {
    if (this.selectedCharacterButtonText) {
      this.selectedCharacterButtonText.setText(
        this.selectedCharacter === "mage"
          ? "Spell, Projectile, Teleport"
          : "Shield, Fire Circle, Fire Orb"
      );
    }
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
        new MapGenerator(this),
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    }
    player.setScale(1.8);

    this.anims.play({ key: `${spriteKey}_walk_down`, frameRate: 4 }, player);

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
        this.selectedCharacter = spriteKey;
        this.changeButtonText();

        // Highlight selected button
        button.fillColor = 0x44aaff;
      });

    return button;
  }
}
