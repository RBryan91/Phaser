class Game extends Phaser.Scene {

  preload() {
    this.load.image('BACKGROUND', 'assets/images/background.png');
    this.load.image('FOG', 'assets/images/fog.png');
    this.load.image('FOREGROUND', 'assets/images/foreground.png');
    this.load.image('TREES', 'assets/images/trees.png');
    this.load.image('ground', 'assets/images/platform.png');
  }

  create() {
    const height = gameConfig.scale.height; 
    const width = gameConfig.scale.width;

    this.bg = this.add.tileSprite(0, 0, width, height,'BACKGROUND').setScale(2);
    this.trees = this.add.tileSprite(0, 0, width, height, 'TREES').setScale(2);
    this.fg = this.add.tileSprite(0, 0, width, height, 'FOREGROUND').setScale(2);
    this.fog = this.add.tileSprite(0, 0, width, height, 'FOG').setScale(2);
    this.platforms = this.physics.add.group(); 

    const spacingX = 250; 

for (let i = 0; i < 999; i++) {
    const posX = i * spacingX;
    const posY = Phaser.Math.Between(50, 400);
    this.platforms.create(posX, posY, 'ground');
}
   

    this.platforms.children.iterate(child => {
      child.body.allowGravity = false;
      child.body.immovable = true;
    });
    //this.physics.add.collider(this.player,this.platforms)
  
  }

  update() {
    this.bg.tilePositionX += 0.1;
    this.trees.tilePositionX += 0.14;
    this.fg.tilePositionX += 0.2;
    this.fog.tilePositionX += 0.7;

    this.platforms.children.iterate(child => {
      child.x += (this.bg.tilePositionX - this.bg.width) / 500; 
    });
  }
}

const gameConfig = {
  type: Phaser.CANVAS,
  width: 800,
  height: 460,
  pixelArt: true,
  scale: {
    parent: 'game-container',
    width: 800,
    height: 460,
  },
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 500 },
        debug: true
    }
},
  backgroundColor: '#5c5b5b',
  scene: [Game],
};

const game = new Phaser.Game(gameConfig);
