import Phaser from 'phaser';

export type ActionName = 'left' | 'right' | 'up' | 'down' | 'attack' | 'ability1' | 'ability2' | 'dodge' | 'ultimate';

type KeyBindings = Record<ActionName, string>;

const KEY_BINDINGS: KeyBindings[] = [
  // Player 1: WASD + nearby keys
  {
    left: 'A',
    right: 'D',
    up: 'W',
    down: 'S',
    attack: 'F',
    ability1: 'Q',
    ability2: 'E',
    dodge: 'SPACE',
    ultimate: 'R'
  },
  // Player 2: Arrow keys + nearby keys
  {
    left: 'LEFT',
    right: 'RIGHT',
    up: 'UP',
    down: 'DOWN',
    attack: 'NUMPAD_ONE',
    ability1: 'NUMPAD_FOUR',
    ability2: 'NUMPAD_FIVE',
    dodge: 'NUMPAD_ZERO',
    ultimate: 'NUMPAD_TWO'
  }
];

export class InputManager {
  private scene: Phaser.Scene;
  public playerIndex: number;
  private keys: Partial<Record<ActionName, Phaser.Input.Keyboard.Key>>;
  public enabled: boolean;

  constructor(scene: Phaser.Scene, playerIndex: number) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.keys = {};
    this.enabled = true;

    const bindings = KEY_BINDINGS[playerIndex] || KEY_BINDINGS[0];
    for (const [action, keyName] of Object.entries(bindings)) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[keyName as keyof typeof Phaser.Input.Keyboard.KeyCodes];
      if (keyCode !== undefined && scene.input.keyboard) {
        this.keys[action as ActionName] = scene.input.keyboard.addKey(keyCode);
      }
    }
  }

  isDown(action: ActionName): boolean {
    if (!this.enabled) return false;
    const key = this.keys[action];
    return key ? key.isDown : false;
  }

  justPressed(action: ActionName): boolean {
    if (!this.enabled) return false;
    const key = this.keys[action];
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }

  getHorizontal(): number {
    if (!this.enabled) return 0;
    let h = 0;
    if (this.isDown('left')) h -= 1;
    if (this.isDown('right')) h += 1;
    return h;
  }

  disable(): void { this.enabled = false; }
  enable(): void { this.enabled = true; }
}

export class AIInputManager extends InputManager {
  private virtualDown: Set<ActionName> = new Set();
  private virtualJustPressed: Set<ActionName> = new Set();

  constructor(scene: Phaser.Scene, playerIndex: number) {
    super(scene, playerIndex);
  }

  isDown(action: ActionName): boolean {
    if (!this.enabled) return false;
    return this.virtualDown.has(action);
  }

  justPressed(action: ActionName): boolean {
    if (!this.enabled) return false;
    return this.virtualJustPressed.has(action);
  }

  getHorizontal(): number {
    if (!this.enabled) return 0;
    let h = 0;
    if (this.virtualDown.has('left')) h -= 1;
    if (this.virtualDown.has('right')) h += 1;
    return h;
  }

  setDown(action: ActionName, value: boolean): void {
    if (value) this.virtualDown.add(action);
    else this.virtualDown.delete(action);
  }

  setJustPressed(action: ActionName, value: boolean): void {
    if (value) this.virtualJustPressed.add(action);
    else this.virtualJustPressed.delete(action);
  }

  clearAll(): void {
    this.virtualDown.clear();
    this.virtualJustPressed.clear();
  }
}
