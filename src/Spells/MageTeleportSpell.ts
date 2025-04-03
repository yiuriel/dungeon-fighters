import Phaser from "phaser";
import { Mage } from "../Players/Mage";

export class MageTeleportSpell extends Phaser.GameObjects.Sprite {
  private caster: Mage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Mage
  ) {
    super(scene, x, y, texture);
    this.caster = caster;

    this.createAnimations();
  }

  public static canTeleport(
    scene: Phaser.Scene,
    facing: string,
    teleportDistance: number,
    targetX: number,
    targetY: number
  ): boolean {
    // Calculate target position based on facing direction
    if (facing === "up") {
      targetY -= teleportDistance;
    } else if (facing === "down") {
      targetY += teleportDistance;
    } else if (facing === "left") {
      targetX -= teleportDistance;
    } else if (facing === "right") {
      targetX += teleportDistance;
    }

    // Check for wall collisions at the target position
    const walls = scene.physics.world.staticBodies.getArray();
    // Get the map boundaries
    const mapWidth = scene.cameras.main.width;
    const mapHeight = scene.cameras.main.height;
    const wallThickness = 20;

    // Check if teleport destination is within map bounds
    const withinBounds =
      targetX >= wallThickness &&
      targetX <= mapWidth - wallThickness &&
      targetY >= wallThickness &&
      targetY <= mapHeight - wallThickness;

    // Check for wall collisions
    const noWallCollisions = !walls.some((wall) => {
      const wallBody = wall.gameObject.body;
      return (
        wallBody &&
        wallBody instanceof Phaser.Physics.Arcade.Body &&
        Phaser.Geom.Rectangle.Overlaps(
          new Phaser.Geom.Rectangle(targetX - 8, targetY - 12, 16, 24),
          new Phaser.Geom.Rectangle(
            wallBody.x,
            wallBody.y,
            wallBody.width,
            wallBody.height
          )
        )
      );
    });

    return withinBounds && noWallCollisions;
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_teleport_spell`,
        {
          start: 0,
          end: 23,
        }
      ),
      frameRate: 32,
      repeat: 0,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_teleport_spell`,
        {
          start: 23,
          end: 0,
        }
      ),
      frameRate: 32,
      repeat: 0,
    });
  }

  startTeleport(x: number, y: number): void {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // Set size and depth to appear above other sprites
    this.setScale(0.75);

    this.x = x;
    this.y = y;
    this.play(this.getStartAnimationKey());
  }

  endTeleport(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
      this.destroy();
    });
  }

  getStartAnimationKey(): string {
    return `${this.caster.getPrefix()}_teleport_start`;
  }

  getEndAnimationKey(): string {
    return `${this.caster.getPrefix()}_teleport_end`;
  }
}
