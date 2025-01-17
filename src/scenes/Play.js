class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    create() {
        //place tile sprite
        this.starfield = this.add
            .tileSprite(
                0,
                0,
                game.config.width,
                game.config.height,
                "starfield"
            )
            .setOrigin(0, 0);

        //green UI background
        this.add
            .rectangle(
                0,
                borderUISize + borderPadding,
                game.config.width,
                borderUISize * 2,
                0x00ff00
            )
            .setOrigin(0, 0);

        //white borders
        this.add
            .rectangle(0, 0, game.config.width, borderUISize, 0xffffff)
            .setOrigin(0, 0);
        this.add
            .rectangle(
                0,
                game.config.height - borderUISize,
                game.config.width,
                borderUISize,
                0xffffff
            )
            .setOrigin(0, 0);
        this.add
            .rectangle(0, 0, borderUISize, game.config.height, 0xffffff)
            .setOrigin(0, 0);
        this.add
            .rectangle(
                game.config.width - borderUISize,
                0,
                borderUISize,
                game.config.height,
                0xffffff
            )
            .setOrigin(0, 0);

        //creating player
        this.p1Rocket = new Rocket(
            this,
            game.config.width / 2,
            game.config.height - borderPadding - borderUISize,
            "rocket"
        ).setOrigin(0.5, 0);

        //creating spaceships
        this.ship01 = new Spaceship(
            this,
            game.config.width + borderUISize * 6,
            borderUISize * 4,
            "spaceship",
            0,
            30
        ).setOrigin(0, 0);
        this.ship02 = new Spaceship(
            this,
            game.config.width + borderUISize * 3,
            borderUISize * 5 + borderPadding * 2,
            "spaceship",
            0,
            20
        ).setOrigin(0, 0);
        this.ship03 = new Spaceship(
            this,
            game.config.width,
            borderUISize * 6 + borderPadding * 4,
            "spaceship",
            0,
            10
        ).setOrigin(0, 0);

        //define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        keyRIGHT = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );

        this.p1Score = 0;
        // display score
        let scoreConfig = {
            fontFamily: "Courier",
            fontSize: "28px",
            backgroundColor: "#F3B141",
            color: "#843605",
            align: "right",
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100,
        };

        this.scoreLeft = this.add.text(
            borderUISize + borderPadding,
            borderUISize + borderPadding * 2,
            this.p1Score,
            scoreConfig
        );

        this.gameOver = false;

        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.timer = game.settings.gameTimer;
        this.clock = this.time.delayedCall(
            this.timer,
            () => {
                this.add
                    .text(
                        game.config.width / 2,
                        game.config.height / 2,
                        "GAME OVER",
                        scoreConfig
                    )
                    .setOrigin(0.5);
                this.add
                    .text(
                        game.config.width / 2,
                        game.config.height / 2 + 64,
                        "Press (R) to Restart or <- for Menu",
                        scoreConfig
                    )
                    .setOrigin(0.5);
                this.gameOver = true;
            },
            null,
            this
        );
    }

    update() {
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.scene.restart();
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        this.starfield.tilePositionX -= 3;
        if (!this.gameOver) {
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }

        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            //console.log("kaboom ship 1");
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            //console.log("kaboom ship 2");
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship03)) {
            //console.log("kaboom ship 3");
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
    }

    checkCollision(rocket, ship) {
        if (
            rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.y + rocket.height > ship.y
        ) {
            return true;
        }
        return false;
    }

    shipExplode(ship) {
        //hide ship
        ship.alpha = 0;

        //create explosion at ship
        let boom = this.add.sprite(ship.x, ship.y, "explosion").setOrigin(0, 0);
        boom.anims.play("explode");
        boom.on("animationcomplete", () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        this.p1Score += ship.points;

        this.scoreLeft.text = this.p1Score;

        this.sound.play("sfx-explosion");
    }
}
