export type GameRegistryKey = "keep_playing_after_end" | "last_history_level";

export class GameRegistryManager {
  private static instance: GameRegistryManager;
  private registry: Map<GameRegistryKey, any> = new Map();

  private constructor() {}

  public static getInstance(): GameRegistryManager {
    if (!GameRegistryManager.instance) {
      GameRegistryManager.instance = new GameRegistryManager();
    }
    return GameRegistryManager.instance;
  }

  public set<V>(key: GameRegistryKey, value: V): void {
    this.registry.set(key, value);
  }

  public get<V>(key: GameRegistryKey): V | undefined {
    return this.registry.get(key) as V | undefined;
  }

  public has(key: GameRegistryKey): boolean {
    return this.registry.has(key);
  }

  public delete(key: GameRegistryKey): boolean {
    return this.registry.delete(key);
  }

  public clear(): void {
    this.registry.clear();
  }
}

export const gameRegistryManager = GameRegistryManager.getInstance();
gameRegistryManager.set("last_history_level", 5);
