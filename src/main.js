const AssetKeys = {
  BACKGROUND: "BACKGROUND",
  FOG: "FOG",
  FOREGROUND: "FOREGROUND",
  TREES: "TREES",
  GROUND: "GROUND",
};

var gameOver = false;
var death = false;
var score = 0;
var scoreText;
var player;
var coin;
var ground;
var goomba;
var platforms;
var coins = [];

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
      debug: false,
    },
  },
  backgroundColor: "#5c5b5b",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

function preload() {
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
  this.load.spritesheet("goomba", "assets/images/goomba2.png", {
    frameWidth: 55,
    frameHeight: 40,
  });
}

function create() {
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

  scoreText = this.add.text(0, 0, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  player = this.physics.add.sprite(300, 200, "dude");
  player.setSize(40, 60);
  player.setCollideWorldBounds(true);

  ground = this.physics.add.staticGroup();
  ground.create(width, 416, AssetKeys.GROUND).setScale(2).refreshBody();

/*   goomba = this.physics.add.sprite(300, 350, "goomba");
  this.physics.add.collider(goomba, platforms);
  this.physics.add.collider(goomba, ground);
  goomba.setCollideWorldBounds(false);
  this.physics.add.overlap(player, goomba, handleCollision, null, this); */

  function createGoomba() {
    if (gameOver) {
      return;
    }
    var y = Phaser.Math.Between(0, 350);
    goomba = this.physics.add.sprite(600, y, "goomba");
    this.physics.add.collider(goomba, platforms);
    this.physics.add.collider(goomba, ground);
    goomba.setCollideWorldBounds(false);
    this.physics.add.overlap(player, goomba, handleCollision, null, this);
    this.time.delayedCall(2500, createGoomba, [], this);
  }

  createGoomba.call(this);

  //plateformes
  const spacingX = 250;
  platforms = this.physics.add.group();

  for (let i = 0; i < 50; i++) {
    const posX = i * spacingX;
    const posY = Phaser.Math.Between(100, 350);
    platforms.create(posX, posY, "platform");
    coin = this.physics.add.sprite(posX, posY-50, "coin");
    coin.body.allowGravity = false;
    coins.push(coin);
  }

  platforms.children.iterate((child) => {
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
    key: "dead",
    frames: [{ key: "goomba", frame: 3 }],
    frameRate: 20,
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
  for(let x = 0; x < coins.length; x ++){
    console.log('yes')
    this.physics.add.overlap(player, coins[x], function() { collectCoin(x) }, null, this);
  }
  this.physics.add.overlap(player, coin, collectCoin, null, this);
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, ground);
  this.physics.add.collider(coin, platforms);
  this.physics.add.collider(coin, ground);
}

function update() {
  if (death) {
    goomba.anims.play("dead", true);
    setTimeout(() => {
      goomba.disableBody(true, true);
      death = false
    }, 200);
  } else {
    goomba.anims.play("attack", true);
  }
  if (gameOver) {
    return;
  }
  if (player.x <= 25) {
    handleGameOver();
  }

  //deplacement des sprites
  this.bg.tilePositionX += 0.4;
  this.trees.tilePositionX += 0.56;
  this.fg.tilePositionX += 0.8;
  this.fog.tilePositionX += 2.8;

  platforms.children.iterate((child) => {
    child.x -= 5;
  });
<<<<<<< HEAD
  coins.forEach((coin) => {
    coin.anims.play("turn",true);
    coin.x -= 5;
  });

  //goomba.x -= 8;
=======
  goomba.x -= 8;
>>>>>>> charle
  player.x -= 1.6;

  player.anims.play("right", true);

  //controle
  if (this.cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    if (player?.anims?.currentFrame?.frame?.name >= 5) {
      player.anims.play("turnRight");
    } else {
      player.anims.play("turnLeft");
    }
  }
  if (this.cursors.space.isDown && player.body.touching.down) {
    player.setVelocityY(-600);
  }
}

function handleGameOver() {
  player.disableBody(true, true);
  gameOver = true;
}

function collectCoin(x) {
  
  coins[x].disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);
}

function handleCollision() {
  if (death) {
    return;
  }
  // Determine the side of collision
  const playerBounds = player.getBounds();
  const goombaBounds = goomba.getBounds();

  const playerBottom = playerBounds.bottom;
  const goombaBottom = goombaBounds.bottom;
  const playerCenterX = playerBounds.centerX;
  const goombaCenterX = goombaBounds.centerX;
  const offsetX = playerCenterX - goombaCenterX;

  if (Math.abs(offsetX) > Math.abs(playerBounds.width / 2)) {
    // Player collided from the left or right side of the enemy
    if (playerBottom < goombaBottom - 10) {
      killEnemy();
    } else {
      handleGameOver();
    }
  } else {
    // Player collided from the top or bottom side of the enemy
    if (playerBottom < goombaBottom) {
      killEnemy();
    } else {
      handleGameOver();
    }
  }
}
function killEnemy() {
  death = true;
}

const game = new Phaser.Game(gameConfig);
