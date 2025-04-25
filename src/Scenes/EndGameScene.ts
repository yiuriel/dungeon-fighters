import Phaser from "phaser";
import { WINDOW_CENTER } from "../constants";
import { gameRegistryManager } from "../GameRegistryManager";
import { SceneManager } from "../helpers/SceneManager";

export default class EndGameScene extends Phaser.Scene {
  private sceneManager: SceneManager;

  constructor() {
    super("EndGameScene");
    this.sceneManager = new SceneManager(this);
  }

  create() {
    // Add background overlay
    this.add
      .rectangle(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      )
      .setDepth(0);

    // Add congratulations message
    this.add
      .text(WINDOW_CENTER.x, WINDOW_CENTER.y - 100, "CONGRATULATIONS!", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "48px",
        color: "#ffffff",
        align: "center",
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 3,
        },
      })
      .setOrigin(0.5);

    // Add description
    this.add
      .text(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        "You have completed all the levels and discovered the story!\nWhat would you like to do next?",
        {
          fontFamily: "'Trebuchet MS', Arial, sans-serif",
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Create buttons
    this.createButton(
      WINDOW_CENTER.x - 150,
      WINDOW_CENTER.y + 100,
      "Return to Menu",
      () => {
        this.sceneManager.fadeOut(500).then(() => {
          this.scene.stop("LevelScene");
          this.scene.start("StartScreenScene");
        });
      }
    );

    this.createButton(
      WINDOW_CENTER.x + 150,
      WINDOW_CENTER.y + 100,
      "Continue Playing",
      () => {
        this.sceneManager.fadeOut(500).then(() => {
          gameRegistryManager.set("keep_playing_after_end", true);
          this.scene.stop();
          this.scene.resume("LevelScene");
        });
      }
    );

    // Fade in the scene
    this.sceneManager.fadeIn(500);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ) {
    const buttonContainer = this.add.container(x, y);

    // Create glass panel effect
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3366ff, 0.3);
    buttonBg.fillRoundedRect(-100, -25, 200, 50, 10);
    buttonBg.lineStyle(2, 0x3366ff, 0.8);
    buttonBg.strokeRoundedRect(-100, -25, 200, 50, 10);

    // Add glow effect
    const glow = this.add.graphics();
    glow.fillStyle(0x3366ff, 0.2);
    glow.fillRoundedRect(-105, -30, 210, 60, 12);
    glow.alpha = 0;

    // Main text
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Add all elements to container
    buttonContainer.add([glow, buttonBg, buttonText]);

    // Make interactive
    buttonContainer.setSize(200, 50);
    buttonContainer.setInteractive({ useHandCursor: true });

    // Add hover effects
    buttonContainer.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4477ff, 0.5);
      buttonBg.fillRoundedRect(-100, -25, 200, 50, 10);
      buttonBg.lineStyle(2, 0x4477ff, 1);
      buttonBg.strokeRoundedRect(-100, -25, 200, 50, 10);
      buttonText.setColor("#ffffff");

      // Show glow on hover
      this.tweens.add({
        targets: glow,
        alpha: 1,
        duration: 200,
      });

      // Scale effect
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    buttonContainer.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x3366ff, 0.3);
      buttonBg.fillRoundedRect(-100, -25, 200, 50, 10);
      buttonBg.lineStyle(2, 0x3366ff, 0.8);
      buttonBg.strokeRoundedRect(-100, -25, 200, 50, 10);

      // Hide glow on hover out
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 200,
      });

      // Reset scale
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    buttonContainer.on("pointerdown", () => {
      // Click animation
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback,
      });
    });

    return buttonContainer;
  }
}
