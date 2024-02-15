const AssetKeys = {
  BACKGROUND: 'BACKGROUND',
  FOG: 'FOG',
  FOREGROUND: 'FOREGROUND',
  TREES: 'TREES',
};

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    this.load.image(AssetKeys.BACKGROUND, 'assets/images/background.png');
    this.load.image(AssetKeys.FOG, 'assets/images/fog.png');
    this.load.image(AssetKeys.FOREGROUND, 'assets/images/foreground.png');
    this.load.image(AssetKeys.TREES, 'assets/images/trees.png');
  }

  create() {
    const { height, width } = this.scale;

    this.bg = this.add.tileSprite(0, 0, width, height, AssetKeys.BACKGROUND).setScale(2);
    this.trees = this.add.tileSprite(0, 0, width, height, AssetKeys.TREES).setScale(2);
    this.fg = this.add.tileSprite(0, 0, width, height, AssetKeys.FOREGROUND).setScale(2);
    this.fog = this.add.tileSprite(0, 0, width, height, AssetKeys.FOG).setScale(2);
  }

  update() {
    this.bg.tilePositionX += 0.1;
    this.trees.tilePositionX += 0.14;
    this.fg.tilePositionX += 0.2;
    this.fog.tilePositionX += 0.7;
  }
}

const gameConfig = {
  type: Phaser.CANVAS,
  pixelArt: true,
  scale: {
    parent: 'game-container',
    width: 640,
    height: 416,
  },
  backgroundColor: '#5c5b5b',
  scene: [Game],
};

const game = new Phaser.Game(gameConfig);
