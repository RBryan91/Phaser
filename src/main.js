const AssetKeys = {
  BACKGROUND: "BACKGROUND",
  FOG: "FOG",
  FOREGROUND: "FOREGROUND",
  TREES: "TREES",
  GROUND: "GROUND",
};

var gameOver = false;
var score = 0;
var scoreText;

function handleGameOver(player) {
  player.anims.play("turnRight");
  gameOver = true;
}

function collectCoin(coin) {
  this.coin.disableBody(true, true);

  //  Add and update the score
  score += 10;
  this.scoreText.setText("Score: " + score);
}

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
    this.handleGameOver = handleGameOver.bind(this);
    this.collectCoin = collectCoin.bind(this);
  }

  preload() {
    this.load.image(AssetKeys.BACKGROUND, "assets/images/background.png");
    this.load.image(AssetKeys.FOG, "assets/images/fog.png");
    this.load.image(AssetKeys.FOREGROUND, "assets/images/foreground.png");
    this.load.image(AssetKeys.TREES, "assets/images/trees.png");
    this.load.image(AssetKeys.GROUND, "assets/images/ground.png");
    this.load.image("platform", "assets/images/platform.png");

    this.load.spritesheet("dude", "assets/images/zelda.png", {
      frameWidth: 63,
      frameHeight: 62,
    });
    this.load.spritesheet("coin", "assets/images/coin.png", {
      frameWidth: 37,
      frameHeight: 29,
    });
    this.load.spritesheet("goomba", "assets/images/goomba.png", {
      frameWidth: 55,
      frameHeight: 40,
    });
  }

  create() {
    //config
    const width = gameConfig.scale.width;
    const height = gameConfig.scale.height;

    //creation du monde

    this.bg = this.add
      .tileSprite(0, 0, width, height, AssetKeys.BACKGROUND)
      .setScale(2);
    this.trees = this.add
      .tileSprite(0, 0, width, height, AssetKeys.TREES)
      .setScale(2);
    this.fg = this.add
      .tileSprite(0, 0, width, height, AssetKeys.FOREGROUND)
      .setScale(2);
    this.fog = this.add
      .tileSprite(0, 0, width, height, AssetKeys.FOG)
      .setScale(2);

    this.scoreText = this.add.text(0, 0, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    this.player = this.physics.add.sprite(300, 200, "dude");
    this.player.setSize(40, 60);
    this.player.setCollideWorldBounds(true);


    this.goomba = this.physics.add.sprite(600, 300, "goomba");
    this.goomba.setCollideWorldBounds(true);
    this.goomba.setSize(30, 37);

    this.ground = this.physics.add.staticGroup();
    this.ground.create(width, 416, AssetKeys.GROUND).setScale(2).refreshBody();

    //plateformes
    const spacingX = 250;
    this.platforms = this.physics.add.group();

     this.coins = [];
    for (let i = 0; i < 10; i++) {
      const posX = i * spacingX;
      const posY = Phaser.Math.Between(100, 350);
      this.platforms.create(posX, posY, "platform");
      this.coin = this.physics.add.sprite(posX, posY-50, "coin");
      this.physics.add.overlap(this.player, this.coin, collectCoin, null, this);
      this.coin.body.allowGravity = false;
      this.coins.push(this.coin);
    }

    this.platforms.children.iterate((child) => {
      child.body.allowGravity = false;
      child.body.immovable = true;
    });

    //creation des animations

    this.anims.create({
      key: "turn",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNumbers("goomba", { start: 0, end: 2 }),
      frameRate: 12,
      repeat: -1,
    });

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

    this.cursors = this.input.keyboard.createCursorKeys();

    //add physics

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.coin, this.platforms);
    this.physics.add.collider(this.coin, this.ground);
    this.physics.add.collider(this.goomba, this.platforms);
    this.physics.add.collider(this.goomba, this.ground);
    this.physics.add.collider(this.player, this.coin);
    this.physics.add.collider(this.player, this.goomba);
  }

  update() {
    if (gameOver) {
      return;
    }
    if (this.player.x <= 31) {
      handleGameOver(this.player);
    }

    //deplacement des sprites
    this.bg.tilePositionX += 0.4;
    this.trees.tilePositionX += 0.56;
    this.fg.tilePositionX += 0.8;
    this.fog.tilePositionX += 2.8;

    this.platforms.children.iterate((child) => {
      child.x -= 5;
    });

    this.player.x -= 1.6;

    this.coins.forEach((coin) => {
      coin.anims.play("turn",true);
      coin.x -= 5;
    });
    this.goomba.anims.play("attack", true);

    //controle
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      if (this.player?.anims?.currentFrame?.frame?.name >= 5) {
        this.player.anims.play("turnRight");
      } else {
        this.player.anims.play("turnLeft");
      }
    }
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-600);
    }
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
      gravity: { y: 1000 },
      debug: true,
    },
  },
  backgroundColor: "#5c5b5b",
  scene: [Game],
};

const game = new Phaser.Game(gameConfig);