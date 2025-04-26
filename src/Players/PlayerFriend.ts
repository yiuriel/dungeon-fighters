import Phaser from "phaser";
import { Player } from "./Player";

export class PlayerFriend extends Player {
  private player: Player;
  private followDistance: number = 5;
  private floatingOffset: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(
      scene,
      x,
      y,
      "player_friend",
      "player_friend",
      undefined,
      undefined,
      80
    );
    this.player = player;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setScale(1.5);
    this.setAlpha(0.8);
    this.createAnimations();
    this.play("player_friend_idle_down");
  }

  fadeToDeath() {
    // stop all movement
    this.setVelocity(0, 0);
    if (this.body) {
      this.body.enable = false;
    }

    // Create a particle effect
    const particles = this.scene.add.particles(this.x, this.y, "flares", {
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0.2 },
      lifespan: 400,
      quantity: 10,
      blendMode: "ADD",
      emitting: true,
    });

    this.scene.time.delayedCall(2000, () => {
      particles.stop();
    });

    // Fade out animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 3000,
      ease: "Power2",
      onComplete: () => {
        particles.destroy();
        this.destroy();
      },
    });
  }

  updateSpecific(): void {
    return;
  }

  update() {
    if (!this.active) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y - this.floatingOffset,
      this.player.x,
      this.player.y
    );

    if (distance > this.followDistance) {
      // Calculate direction vector
      const dx = this.player.x - this.x;
      const dy = this.player.y - (this.y - this.floatingOffset);

      // Normalize the vector
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / length;
      const normalizedDy = dy / length;

      // Apply velocity directly to move in both directions
      this.setVelocity(normalizedDx * this.speed, normalizedDy * this.speed);

      // Update animation based on movement direction
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.player.x,
        this.player.y
      );
      if (angle > -0.75 * Math.PI && angle < -0.25 * Math.PI) {
        this.play("player_friend_idle_up", true);
      } else if (angle > 0.25 * Math.PI && angle < 0.75 * Math.PI) {
        this.play("player_friend_idle_down", true);
      } else if (angle <= 0.25 * Math.PI && angle >= -0.25 * Math.PI) {
        this.play("player_friend_idle_right", true);
      } else {
        this.play("player_friend_idle_left", true);
      }
    } else {
      // Stop moving when close enough
      this.setVelocity(0, 0);
    }
  }

  createAnimations() {
    this.anims.create({
      key: "player_friend_idle_down",
      frames: this.anims.generateFrameNumbers("player_friend", {
        start: 1,
        end: 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "player_friend_idle_up",
      frames: this.anims.generateFrameNumbers("player_friend", {
        start: 10,
        end: 10,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "player_friend_idle_left",
      frames: this.anims.generateFrameNumbers("player_friend", {
        start: 4,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "player_friend_idle_right",
      frames: this.anims.generateFrameNumbers("player_friend", {
        start: 7,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }
}
