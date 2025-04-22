import Phaser from "phaser";
import { WINDOW_CENTER, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";
import { FireMage } from "../Players/FireMage";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";
import { MapGenerator } from "../Map/MapGenerator";
import { SceneManager } from "../helpers/SceneManager";

export default class StartScreenScene extends Phaser.Scene {
  private selectedCharacter: string | null = null;
  private selectedCharacterButtonText: Phaser.GameObjects.Text | null = null;
  private sceneManager: SceneManager;
  private characterButtons: { [key: string]: Phaser.GameObjects.Container } =
    {};

  constructor() {
    super("StartScreenScene");
    this.sceneManager = new SceneManager(this);
  }

  create() {
    // Set up background with atmospheric particles
    this.setupBackground();

    // Create modern title with animation
    this.createTitle();

    // Add subtitles with improved typography
    this.add
      .text(WINDOW_CENTER.x, 170, "SELECT YOUR CHARACTER", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "24px",
        color: "#ffffff",
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000",
          blur: 2,
        },
      })
      .setOrigin(0.5);

    // Create modern character selection cards
    this.createCharacterButton(WINDOW_CENTER.x - 180, 310, "mage", "Mage");
    this.createCharacterButton(
      WINDOW_CENTER.x + 180,
      310,
      "fire_mage",
      "Fire Mage"
    );

    // Add modern controls UI
    this.createControlsUI(WINDOW_CENTER.x, 450);

    // Create animated start button - moved down to avoid overlap
    this.createStartButton(WINDOW_CENTER.x, 600);
  }

  /**
   * Sets up the background with particles and overlay effects
   */
  private setupBackground() {
    // Add background image with preserved aspect ratio
    this.add
      .image(WINDOW_CENTER.x, WINDOW_CENTER.y - 50, "game_cover")
      .setDepth(-2)
      .setAlpha(0.85);

    // Add a subtle dark overlay for better contrast
    this.add
      .rectangle(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        0x000000,
        0.55
      )
      .setDepth(-1);

    // Add a modern grid overlay
    this.add
      .grid(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        64,
        64,
        0x000000,
        0,
        0x3366ff,
        0.1
      )
      .setDepth(-1);

    // Create ambient floating particles using the constructor pattern
    this.add.particles(0, 0, "fire_particle", {
      x: { min: 0, max: WINDOW_WIDTH },
      y: { min: 0, max: WINDOW_HEIGHT },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.3, end: 0 },
      speed: 20,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      lifespan: { min: 2000, max: 4000 },
      quantity: 1,
      frequency: 500,
      blendMode: Phaser.BlendModes.ADD,
      tint: 0x3366ff,
    });
  }

  /**
   * Creates a modern animated title
   */
  private createTitle() {
    // Create title text with modern style
    const titleContainer = this.add.container(WINDOW_CENTER.x, 100);

    // Shadow/glow effect
    const shadowText = this.add
      .text(2, 2, "FIRST LIGHT", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#1a1a1a",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    // Main text
    const titleText = this.add
      .text(0, 0, "FIRST LIGHT", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#f8d942",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    titleContainer.add([shadowText, titleText]);

    // Add subtle floating animation
    this.tweens.add({
      targets: titleContainer,
      y: 105,
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Add pulsing glow effect
    this.tweens.add({
      targets: titleText,
      alpha: 0.8,
      duration: 1800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Creates a modern animated start button
   * @param x X position of the button
   * @param y Y position of the button
   */
  private createStartButton(x: number = WINDOW_CENTER.x, y: number = 550) {
    // Create button container
    const buttonContainer = this.add.container(x, y);

    // Create glass-like button background with gradient
    const button = this.add.graphics();
    button.fillGradientStyle(0x4287f5, 0x4287f5, 0x2463bd, 0x2463bd, 1);
    button.fillRoundedRect(-150, -40, 300, 80, 16);
    button.lineStyle(2, 0x6ab4ff);
    button.strokeRoundedRect(-150, -40, 300, 80, 16);

    // Add inner glow/highlight
    const highlight = this.add.graphics();
    highlight.fillStyle(0xffffff, 0.2);
    highlight.fillRoundedRect(-148, -38, 296, 40, {
      tl: 16,
      tr: 16,
      bl: 0,
      br: 0,
    });

    // Add text with modern font
    const buttonText = this.add
      .text(0, 0, "START ADVENTURE", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000",
          blur: 3,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Add everything to container
    buttonContainer.add([button, highlight, buttonText]);

    // Add pulsing effect
    this.tweens.add({
      targets: buttonContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Make the whole container interactive
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-150, -40, 300, 80),
      Phaser.Geom.Rectangle.Contains
    );

    buttonContainer.on("pointerover", () => {
      button.clear();
      button.fillGradientStyle(0x5499ff, 0x5499ff, 0x3573d1, 0x3573d1, 1);
      button.fillRoundedRect(-150, -40, 300, 80, 16);
      button.lineStyle(2, 0x8dc7ff);
      button.strokeRoundedRect(-150, -40, 300, 80, 16);
      this.input.setDefaultCursor("pointer");
    });

    buttonContainer.on("pointerout", () => {
      button.clear();
      button.fillGradientStyle(0x4287f5, 0x4287f5, 0x2463bd, 0x2463bd, 1);
      button.fillRoundedRect(-150, -40, 300, 80, 16);
      button.lineStyle(2, 0x6ab4ff);
      button.strokeRoundedRect(-150, -40, 300, 80, 16);
      this.input.setDefaultCursor("default");
    });

    buttonContainer.on("pointerdown", () => {
      // Add press effect
      button.clear();
      button.fillGradientStyle(0x2463bd, 0x2463bd, 0x1a4d94, 0x1a4d94, 1);
      button.fillRoundedRect(-150, -40, 300, 80, 16);
      button.lineStyle(2, 0x4287f5);
      button.strokeRoundedRect(-150, -40, 300, 80, 16);

      // Create particle burst effect using correct constructor pattern
      const particles = this.add.particles(x, y, "fire_particle", {
        speed: { min: 100, max: 200 },
        scale: { start: 0.6, end: 0 },
        angle: { min: 0, max: 360 },
        lifespan: 800,
        quantity: 20,
        blendMode: Phaser.BlendModes.ADD,
        tint: 0x4287f5,
        emitting: false,
      });

      // Explode once
      particles.explode(20, x, y);

      // Handle scene transition
      this.sceneManager.fadeOut().then(() => {
        particles.destroy();
        this.scene.start("LevelScene");
      });
    });
  }

  /**
   * Creates a modern controls UI panel
   */
  createControlsUI(x: number, y: number) {
    // Create container for controls
    const controlsContainer = this.add.container(x, y);

    // Create glass panel effect
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.6);
    panel.fillRoundedRect(-250, -30, 500, 110, 10);
    panel.lineStyle(2, 0x3366ff, 0.5);
    panel.strokeRoundedRect(-250, -30, 500, 110, 10);

    // Controls title with icon
    this.add
      .text(WINDOW_CENTER.x, 438, "CONTROLS", {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Add separator line
    const separator = this.add.graphics();
    separator.lineStyle(1, 0x3366ff, 0.4);
    separator.lineBetween(-230, 5, 230, 5);

    // Create modern keys display (these are now added directly to the scene, not to the container)
    this.createKeyDisplay(x - 150, y + 30, "Movement", "ARROW KEYS");
    this.createKeyDisplay(x + 100, y + 30, "Actions", "Z, X, C");

    // Character-specific controls text
    this.selectedCharacterButtonText = this.add
      .text(
        x + 100,
        y + 68,
        localStorage.getItem("selectedCharacter") === "mage"
          ? "Spell, Projectile, Teleport"
          : "Shield, Fire Circle, Fire Orb",
        {
          fontFamily: "'Trebuchet MS', Arial, sans-serif",
          fontSize: "14px",
          color: "#a3c8ff",
        }
      )
      .setOrigin(0.5);

    // Add the panel and separator to the container
    controlsContainer.add([panel, separator]);
  }

  /**
   * Creates a modern key display for controls
   */
  private createKeyDisplay(x: number, y: number, label: string, keys: string) {
    // Create a graphics object for key background
    const keyBackground = new Phaser.GameObjects.Graphics(this);
    keyBackground.fillStyle(0x3366ff, 0.3);
    keyBackground.fillRoundedRect(x - 60, y, 120, 24, 5);
    keyBackground.lineStyle(1, 0x3366ff, 0.6);
    keyBackground.strokeRoundedRect(x - 60, y, 120, 24, 5);
    this.add.existing(keyBackground);

    // Add label text above
    this.add
      .text(x, y - 10, label, {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Add key text
    this.add
      .text(x, y + 12, keys, {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffcc00",
      })
      .setOrigin(0.5);
  }

  /**
   * Updates the character button text based on the selected character
   */
  changeButtonText() {
    if (this.selectedCharacterButtonText) {
      this.selectedCharacterButtonText.setText(
        this.selectedCharacter === "mage"
          ? "Spell, Projectile, Teleport"
          : "Shield, Fire Circle, Fire Orb"
      );
    }
  }

  /**
   * Creates a modern character selection card
   */
  createCharacterButton(
    x: number,
    y: number,
    spriteKey: string,
    label: string
  ) {
    // Create a container for this character button
    const container = this.add.container(x, y);
    this.characterButtons[spriteKey] = container;

    // Create card background with modern glass effect
    const cardBackground = this.add.graphics();
    cardBackground.fillStyle(0x000000, 0.6);
    cardBackground.fillRoundedRect(-80, -80, 160, 160, 10);

    // Create border based on initial selection status
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    const isSelected = selectedCharacter === spriteKey;

    const border = this.add.graphics();
    if (isSelected) {
      // Selected character gets special border
      border.lineStyle(3, 0x4287f5, 0.9);
    } else {
      // Unselected character gets standard border
      border.lineStyle(2, 0x3366ff, 0.5);
    }
    border.strokeRoundedRect(-80, -80, 160, 160, 10);

    // Create inner highlight for the card
    const highlight = this.add.graphics();
    highlight.fillStyle(0xffffff, 0.1);
    highlight.fillRoundedRect(-80, -80, 160, 80, {
      tl: 10,
      tr: 10,
      bl: 0,
      br: 0,
    });

    // Create player sprite
    let player: Player;
    if (spriteKey === "fire_mage") {
      player = new FireMage(
        this,
        0,
        -15,
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
        0,
        -15,
        "mage",
        new MapGenerator(this),
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    }
    player.setScale(2);

    // Animate the player sprite
    this.anims.play({ key: `${spriteKey}_walk_down`, frameRate: 4 }, player);

    // Create modern label with subtle shadow
    const characterLabel = this.add
      .text(0, 50, label, {
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000",
          blur: 2,
        },
      })
      .setOrigin(0.5);

    // Add an indicator for selected characters
    const selectionIndicator = this.add.graphics();
    if (isSelected) {
      drawSelectionIndicator(selectionIndicator, true);
    } else {
      drawSelectionIndicator(selectionIndicator, false);
    }

    // Add all elements to the container
    container.add([
      cardBackground,
      border,
      highlight,
      player,
      characterLabel,
      selectionIndicator,
    ]);

    // Make the container interactive
    container.setInteractive(
      new Phaser.Geom.Rectangle(-80, -80, 160, 160),
      Phaser.Geom.Rectangle.Contains
    );

    // Add hover effects
    container.on("pointerover", () => {
      if (!isSelected) {
        border.clear();
        border.lineStyle(2, 0x5499ff, 0.8);
        border.strokeRoundedRect(-80, -80, 160, 160, 10);
      }
      player.setScale(2.2);
      this.input.setDefaultCursor("pointer");
    });

    container.on("pointerout", () => {
      if (!isSelected) {
        border.clear();
        border.lineStyle(2, 0x3366ff, 0.5);
        border.strokeRoundedRect(-80, -80, 160, 160, 10);
      }
      player.setScale(2);
      this.input.setDefaultCursor("default");
    });

    container.on("pointerdown", () => {
      // Reset all other character buttons
      Object.keys(this.characterButtons).forEach((key) => {
        if (key !== spriteKey) {
          const otherContainer = this.characterButtons[key];
          const otherBorder = otherContainer.getAt(
            1
          ) as Phaser.GameObjects.Graphics;
          const otherIndicator = otherContainer.getAt(
            5
          ) as Phaser.GameObjects.Graphics;

          otherBorder.clear();
          otherBorder.lineStyle(2, 0x3366ff, 0.5);
          otherBorder.strokeRoundedRect(-80, -80, 160, 160, 10);

          otherIndicator.clear();
          drawSelectionIndicator(otherIndicator, false);
        }
      });

      // Update this character's selection state
      border.clear();
      border.lineStyle(3, 0x4287f5, 0.9);
      border.strokeRoundedRect(-80, -80, 160, 160, 10);

      selectionIndicator.clear();
      drawSelectionIndicator(selectionIndicator, true);

      // Store selected character
      localStorage.setItem("selectedCharacter", spriteKey);
      this.selectedCharacter = spriteKey;
      this.changeButtonText();

      // Add selection particle effect with proper constructor pattern
      const particles = this.add.particles(x, y + 5, "fire_particle", {
        speed: { min: 50, max: 100 },
        scale: { start: 0.8, end: 0 },
        lifespan: 600,
        blendMode: Phaser.BlendModes.ADD,
        tint: 0x4287f5,
        emitting: false,
      });

      // Explode once
      particles.explode(15);

      // Auto-destroy after particles complete
      this.time.delayedCall(600, () => {
        particles.destroy();
      });
    });

    // Helper function to draw the selection indicator
    function drawSelectionIndicator(
      graphics: Phaser.GameObjects.Graphics,
      isSelected: boolean
    ) {
      if (isSelected) {
        // Draw checkmark or selected indicator
        graphics.fillStyle(0x4287f5, 0.8);
        graphics.fillCircle(55, -55, 12);

        // Add checkmark
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(50, -55);
        graphics.lineTo(54, -51);
        graphics.lineTo(60, -59);
        graphics.closePath();
        graphics.strokePath();
      } else {
        // Draw empty circle for unselected
        graphics.lineStyle(1, 0x3366ff, 0.5);
        graphics.strokeCircle(55, -55, 12);
      }
    }

    return container;
  }
}
