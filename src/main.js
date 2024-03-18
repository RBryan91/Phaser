var gameOver = false;
var death = {
  active: false,
  enemy: null,
};
var score = 0;
var count = 0;
var level = 0;
var scoreText;
var levelText;
var player;
var coin;
var ground;
var goomba;
var platforms;
var rush;
var retryButton;
var bat;
var traps;
var batExists = false;
var previousPosY = null;
var soundtrack;
var coinSound;
var gameOverSound;
var enemyDieSound;

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
      gravity: { y: 1200 },
      debug: true,
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
  this.load.image("background", "assets/images/background.png");
  this.load.image("fog", "assets/images/fog.png");
  this.load.image("foreground", "assets/images/foreground.png");
  this.load.image("trees", "assets/images/trees.png");
  this.load.image("ground", "assets/images/ground.png");
  this.load.image("platform", "assets/images/platform.png");
  this.load.image("rush", "assets/images/rush.png");
  this.load.image("restart", "assets/images/restart.png");
  this.load.image("trap", "assets/images/pique.png");

  this.load.audio("soundtrack", "assets/sounds/soundtrack.mp3");
  this.load.audio("coinSound", "assets/sounds/coin.mp3");
  this.load.audio("gameOverSound", "assets/sounds/gameOver.mp3");
  this.load.audio("enemyDieSound", "assets/sounds/enemyDie.mp3");

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
  this.load.spritesheet("bat", "assets/images/bat2.png", {
    frameWidth: 74,
    frameHeight: 37,
  });
}

function create() {
  //config
  const width = gameConfig.scale.width;
  const height = gameConfig.scale.height;

  soundtrack = this.sound.add("soundtrack", { loop: true });
  coinSound = this.sound.add("coinSound", { loop: false });
  gameOverSound = this.sound.add("gameOverSound", { loop: false });
  enemyDieSound = this.sound.add("enemyDieSound",{loop:false})
  soundtrack.play()

  //creation du monde
  this.bg = this.add.tileSprite(0, 0, width, height, "background").setScale(2);
  this.trees = this.add.tileSprite(0, 0, width, height, "trees").setScale(2);
  this.fg = this.add.tileSprite(0, 0, width, height, "foreground").setScale(2);
  this.fog = this.add.tileSprite(0, 0, width, height, "fog").setScale(2);

  scoreText = this.add.text(0, 0, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });
  levelText = this.add.text(470, 0, "Level: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  player = this.physics.add.sprite(300, 200, "dude");
  player.setSize(35, 50);
  player.setCollideWorldBounds(true);

  ground = this.physics.add.staticGroup();
  ground.create(width, 416, "ground").setScale(2).refreshBody();

  createGoomba.call(this);

  platforms = this.physics.add.group();
  traps = this.physics.add.group();

  createPlatformAndCoin.call(this);

  retryButton = this.add
    .sprite(330, 208, "restart")
    .setInteractive()
    .setVisible(false)
    .setDepth(5);
  retryButton.on("pointerdown", function () {
    if (gameOver) {
      restartGame();
    }
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
    key: "fly",
    frames: this.anims.generateFrameNumbers("bat", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "deadBat",
    frames: [{ key: "bat", frame: 4 }],
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
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, ground);

}

function update() {
  if (gameOver) {
    return;
  }

  //gestion mort d'un monstre
  if (death.active) {
    if (death.enemy === "goomba") {
      goomba.anims.play("dead", true);
      setTimeout(() => {
        goomba.disableBody(true, true);
        death.active = false;
      }, 200);
    } else {
      bat.anims.play("deadBat", true);
      bat.body.allowGravity = true;
      setTimeout(() => {
        death.active = false;
      }, 500);
    }
  } else {
    goomba.anims.play("attack", true);
  }

  if (player.x <= 20) {
    handleGameOver();
  }

  //deplacement des sprites
  this.bg.tilePositionX += 0.4;
  this.trees.tilePositionX += 0.56;
  this.fg.tilePositionX += 0.8;
  this.fog.tilePositionX += 2.8;

    platforms.children.iterate((child) => {
      child.x -= (5 + level);
    });
  
  traps.children.iterate((child) => {
    child.x -= (5 + level);
  });

  coin.anims.play("turn", true);
  coin.x -= (5 + level);

  player.x -= 1.6;

  goomba.x -= 10;
  rush.x -= 10;

  if (bat) {
    if (!death.active) bat.anims.play("fly", true);
    bat.x -= 7;
    if (bat.x < 0) {
      batExists = false;
    }
  }

  //controle
  if (this.cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(200);
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
  gameOverSound.play();
  player.disableBody(true, true);
  gameOver = true;
  retryButton.setVisible(true);
  soundtrack.pause();
  soundtrack.resume();
}

function collectCoin() {
  coinSound.play()
  coin.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);
  console.log(score)
  console.log(score % 50 === 0)
  if (score % 50 === 0 && score !== 0) {
    console.log("ça rentre")
    level += 1;
    levelText.setText("Level : " + level)
  }
}

function handleCollision(enemy) {
  if (death.active) {
    return;
  }
  const playerBounds = player.getBounds();
  const enemyBounds = enemy.getBounds();

  const playerBottom = playerBounds.bottom;
  const enemyBottom = enemyBounds.bottom;
  const playerCenterX = playerBounds.centerX;
  const enemyCenterX = enemyBounds.centerX;
  const offsetX = playerCenterX - enemyCenterX;

  if (Math.abs(offsetX) > Math.abs(playerBounds.width / 2)) {
    if (playerBottom < enemyBottom - 10) {
      killEnemy(enemy);
    } else {
      handleGameOver();
    }
  } else {
    if (playerBottom < enemyBottom) {
      killEnemy(enemy);
    } else {
      handleGameOver();
    }
  }
}
function killEnemy(enemy) {
  enemyDieSound.play();
  death.active = true;
  death.enemy = enemy.texture.key;
  if (enemy.texture.key === "goomba") rush.destroy();
  score += 10;
  scoreText.setText("Score: " + score);
  if (score % 50 === 0 && score !== 0) {
    console.log("ça rentre")
    level += 1;
    levelText.setText("Level : " + level)
  }
}

function createGoomba() {
  if (gameOver) {
    return;
  }
  rush = this.add.image(0, 0, "rush");
  goomba = this.physics.add.sprite(600, 375, "goomba");
  goomba.setSize(30, 30);
  rush.setPosition(goomba.x + 75, goomba.y);
  this.physics.add.collider(goomba, platforms);
  this.physics.add.collider(goomba, ground);
  goomba.setCollideWorldBounds(false);
  this.physics.add.overlap(
    player,
    goomba,
    function () {
      handleCollision(goomba);
    },
    null,
    this
  );
  this.time.delayedCall(1500, createGoomba, [], this);
}

function createPlatformAndCoin() {
  if (gameOver) {
    return;
  }
  const posX = game.config.width + 100;
  let posY;
  do {
    posY = Phaser.Math.Between(150, 300);
  } while (posY >= previousPosY - 75 && posY <= previousPosY + 75);
  previousPosY = posY;
  let posYbis;
  do {
    posYbis = Phaser.Math.Between(50, 350);
  } while (posYbis >= posY - 50 && posYbis <= posY + 50);
  const platform = platforms.create(posX, posY, "platform");
  platform.setSize(170, 25);
  platform.setOffset(10, 2);
  const PosXVariable = posX + Phaser.Math.Between(-60, 60);
  if (count % 3 === 0) {
    coin = this.physics.add.sprite(posX, posY - 50, "coin");
    coin.setSize(25, 25);
    coin.setOffset(3, 2);
    coin.body.allowGravity = false;
    this.physics.add.overlap(player, coin, collectCoin, null, this);
  } else {
    let NombreX = Phaser.Math.Between(1, 3);
    if (NombreX === 2) {
      const trap = traps.create(PosXVariable, posY - 28, "trap");
      trap.setSize(35, 15);
      trap.setOffset(5, 8);
      trap.body.allowGravity = false;
      trap.body.immovable = true;
      this.physics.add.overlap(player, trap, handleGameOver, null, this);
    }
  }

  count++;

  if (!batExists) {
    var rand = Phaser.Math.Between(1, 2);
    if (rand === 1) {
      bat = this.physics.add.sprite(posX, posYbis, "bat");
      bat.setSize(20, 20);
      bat.setCollideWorldBounds(false);
      bat.body.allowGravity = false;
      this.physics.add.overlap(
        player,
        bat,
        function () {
          handleCollision(bat);
        },
        null,
        this
      );
      batExists = true;
    }
  }

  platform.body.allowGravity = false;
  platform.body.immovable = true;
  coin.body.allowGravity = false;

  this.time.delayedCall(1000, createPlatformAndCoin, [], this);
}

function restartGame() {
  gameOver = false;
  death.active = false;
  death.enemy = null;
  score = 0;
  level = 0;
  count = 0;
  batExists = false;

  game.destroy(true);
  game = new Phaser.Game(gameConfig);
}

let game = null;

function startGame() {
  document.getElementById("play-button").style.display = "none";

  if (game) {
    game.destroy();
  }
  game = new Phaser.Game(gameConfig);
}

document.getElementById("play-button").addEventListener("click", startGame);
