import Phaser from "phaser";
import { Item, ItemType } from "./Item";
import { Player } from "../Players/Player";

export class Scepter extends Item {
  private static readonly BUFF_DURATION = 10000; // 10 seconds in milliseconds
  private static readonly MIN_DAMAGE_MULTIPLIER = 1.1;
  private static readonly MAX_DAMAGE_MULTIPLIER = 1.5;
  private buffTimer: Phaser.Time.TimerEvent | null = null;
  private powerUpBar: Phaser.GameObjects.Graphics | null = null;
  private multiplierText: Phaser.GameObjects.Text | null = null;
  private damageMultiplier: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "scepter", ItemType.SCEPTER);
    const frame = Phaser.Math.Between(0, 4);
    this.setFrame(frame);

    // Calculate damage multiplier based on frame (lerp from 1.1 to 1.5)
    this.damageMultiplier = Phaser.Math.Linear(
      Scepter.MIN_DAMAGE_MULTIPLIER,
      Scepter.MAX_DAMAGE_MULTIPLIER,
      frame / 4
    );
  }

  public canUse(player: Player): boolean {
    return player.getScepter() === null;
  }

  use(player: Player): void {
    super.use(player);
    // Apply damage multiplier
    player.setDamageMultiplier(this.damageMultiplier);
    player.setScepter(this);

    // Create power-up bar if it doesn't exist
    if (!this.powerUpBar) {
      this.powerUpBar = this.scene.add.graphics();
    }

    // Create or update multiplier text
    if (!this.multiplierText) {
      this.multiplierText = this.scene.add.text(0, 0, "", {
        fontSize: "12px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
      });
      this.multiplierText.setScrollFactor(0);
      this.multiplierText.setDepth(100);
    }

    // Clear any existing timer
    if (this.buffTimer) {
      this.buffTimer.remove();
    }

    // Make the item invisible and untouchable
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }

    // Set timer for buff duration
    this.buffTimer = this.scene.time.delayedCall(
      Scepter.BUFF_DURATION,
      () => {
        // Reset damage multiplier
        player.setDamageMultiplier(1.0);
        player.setScepter(null);

        // Remove the power-up bar
        if (this.powerUpBar) {
          this.powerUpBar.clear();
          this.powerUpBar = null;
        }

        // Remove the multiplier text
        if (this.multiplierText) {
          this.multiplierText.destroy();
          this.multiplierText = null;
        }

        // Destroy the item after the power-up finishes
        this.destroy();
      },
      [],
      this
    );

    // Update the power-up bar
    this.updatePowerUpBar(1.0);

    // Set up an event to update the bar
    this.scene.time.addEvent({
      delay: 100, // Update every 100ms
      callback: () => {
        if (this.buffTimer) {
          const progress =
            1 - this.buffTimer.getElapsed() / Scepter.BUFF_DURATION;
          this.updatePowerUpBar(progress);
        }
      },
      callbackScope: this,
      loop: true,
      repeat: Scepter.BUFF_DURATION / 100,
    });
  }

  private updatePowerUpBar(progress: number): void {
    if (
      !this.powerUpBar ||
      !this.scene ||
      !this.scene.cameras.main ||
      !this.active
    )
      return;

    const width = 200;
    const height = 15;
    const x = this.scene.cameras.main.width / 2 - width / 2;
    const y = this.scene.cameras.main.height - 30;

    this.powerUpBar.clear();
    this.powerUpBar.setScrollFactor(0);

    // Draw background
    this.powerUpBar.fillStyle(0x222222, 0.8);
    this.powerUpBar.fillRect(x, y, width, height);

    // Draw progress
    this.powerUpBar.fillStyle(0xffaa00, 1);
    this.powerUpBar.fillRect(x, y, width * progress, height);

    // Draw border
    this.powerUpBar.lineStyle(2, 0xffffff, 1);
    this.powerUpBar.strokeRect(x, y, width, height);

    // Update multiplier text
    if (this.multiplierText) {
      this.multiplierText.setText(`×${this.damageMultiplier.toFixed(1)}`);
      this.multiplierText.setPosition(
        x + width / 2 - this.multiplierText.width / 2,
        y + height / 2 - this.multiplierText.height / 2
      );
    }
  }

  destroy(_?: boolean) {
    super.destroy();
    if (this.buffTimer) {
      this.buffTimer.remove();
    }
    if (this.powerUpBar) {
      this.powerUpBar.destroy();
    }
    if (this.multiplierText) {
      this.multiplierText.destroy();
    }
  }
}
