var gameOver = false;
 
function handleGameOver(player)
{
    player.anims.play('turnRight');
    gameOver = true;
}
class Game extends Phaser.Scene {

  constructor() {
    super({ key: "Game" });
    this.handleGameOver = handleGameOver.bind(this);
  }
  

  preload() {
    this.load.image('BACKGROUND', 'assets/images/background.png');
    this.load.image('FOG', 'assets/images/fog.png');
    this.load.image('FOREGROUND', 'assets/images/foreground.png');
    this.load.image('TREES', 'assets/images/trees.png');
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('ground', "assets/images/ground.png");
 
    this.load.spritesheet("dude", "assets/images/zelda.png", {
      frameWidth: 63,
      frameHeight: 62,
    });
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
    this.platforms.create(posX, posY, 'platform');
}
   

    this.platforms.children.iterate(child => {
      child.body.allowGravity = false;
      child.body.immovable = true;
    });
    this.player = this.physics.add.sprite(300, 200, "dude");
    this.player.setCollideWorldBounds(true);
 
    this.ground = this.physics.add.staticGroup();
    this.ground
      .create(width, 416, 'ground')
      .setScale(2)
      .refreshBody();
    this.physics.add.collider(this.player, this.ground);
 
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 4 }),
      frameRate: 12,
      repeat: -1,
    });
 
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 9 }),
      frameRate: 12,
      repeat: -1,
    });
 
    this.anims.create({
      key: "turnRight",
      frames: [{ key: "dude", frame: 7 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "turnLeft",
      frames: [{ key: "dude", frame: 2 }],
      frameRate: 20,
    });
    this.physics.add.collider(this.player,this.platforms)
    this.cursors = this.input.keyboard.createCursorKeys();
  
  }

  update() {
    if (gameOver)
    {
        return;
    }
 
    this.bg.tilePositionX += 0.4;
    this.trees.tilePositionX += 0.56;
    this.fg.tilePositionX += 0.8;
    this.fog.tilePositionX += 2.8;
    this.player.x -= 1.6;
 
    if (this.player.x <= 31) {
      handleGameOver(this.player);
    }
 
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      console.log(this.player)
      this.player.setVelocityX(0);
      if (this.player?.anims?.currentFrame?.frame?.name >=5) {
        this.player.anims.play("turnRight");
      } else {
        this.player.anims.play("turnLeft");
      }
    }
 
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    this.platforms.children.iterate(child => {
      child.x += (this.bg.tilePositionX - this.bg.width) / 100; 
    });
  }

}
const gameConfig = {
  type: Phaser.CANVAS,
  width: 640,
  height: 416,
  pixelArt: true,
  scale: {
    parent: "game-container",
    width: 640,
    height: 416,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: true,
    },
  },
  backgroundColor: "#5c5b5b",
  scene: [Game],
};
const game = new Phaser.Game(gameConfig);
