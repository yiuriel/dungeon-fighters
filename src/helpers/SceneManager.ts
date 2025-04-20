export class SceneManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  fadeOut(duration: number = 500, color: number = 0x000000): Promise<void> {
    return new Promise((resolve) => {
      this.scene.cameras.main.fadeOut(
        duration,
        color,
        color,
        color,
        (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress === 1) {
            resolve();
          }
        }
      );
    });
  }

  fadeIn(duration: number = 500, color: number = 0x000000): Promise<void> {
    return new Promise((resolve) => {
      this.scene.cameras.main.fadeIn(
        duration,
        color,
        color,
        color,
        (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress === 1) {
            resolve();
          }
        }
      );
    });
  }
}
