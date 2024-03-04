class Jogo extends Phaser.Scene {
    constructor() {
        super({ key: 'jogo' });
        this.score = 0;
        this.scoreText = null;
        this.hotdogList = [];
        this.player = null;
        this.platforms = null;
        this.staticHotDog = null;
        this.timer = null;
        this.instructionText = null;
        this.cursors = null;
    }

    // Carrega imagens utilizadas no jogo
    preload() {
        this.load.image('background', 'assets/background.jpeg');
        this.load.spritesheet('sans', 'assets/sans.png', { frameWidth: 25, frameHeight: 32 });
        this.load.image('hotdog', 'assets/hotdog.png');
        this.load.image('platform', 'assets/platform.png');
    }

    // Cria variáveis e o fundo do jogo
    create() {
        this.add.image(200, 149, 'background');
        this.createPlatforms();
        this.createPlayer();
        this.createAnimations();
        this.createUI();
        this.spawnStaticHotDog();
        this.setupTimer();
    }

    // Faz com que o jogador se movimente
    update() {
        this.handlePlayerMovement();

        // Se o jogador cair embaixo das platafotmas, a cena reinicia
        if (this.player.y > 380) {
            this.scene.restart();
        }
    }

    // Cria as plataformas
    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // Cria as plataformas laterais utilizando For
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 5; i++) {
                const x = 100 + i * 200;
                const y = 350 - j * 100;
                const platform = this.platforms.create(x, y, 'platform').setOrigin(0.5, 0.5);
                platform.body.allowGravity = false;
            }
        }

        // Cria a plataforma do meio
        const middleBottomPlatform = this.platforms.create(this.physics.world.bounds.width / 2, this.physics.world.bounds.height - 16, 'platform').setOrigin(0.5, 0.5);
        middleBottomPlatform.body.allowGravity = false;
    }

    // Cria o sprite do jogador
    createPlayer() {
        this.player = this.physics.add.sprite(200, 32, 'sans').setCollideWorldBounds(true);
        this.player.body.setSize(25, 32, true);
        this.physics.add.collider(this.player, this.platforms);
    }

    // Cria as animações do jogador
    createAnimations() {
        this.anims.create({
            key: 'MCstand',
            frames: this.anims.generateFrameNumbers('sans', { start: 0, end: 0 }),
        });

        this.anims.create({
            key: 'MCleft',
            frames: this.anims.generateFrameNumbers('sans', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'MCright',
            frames: this.anims.generateFrameNumbers('sans', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'MCspin',
            frames: this.anims.generateFrameNumbers('sans', { start: 9, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    // Cria textos presentes no jogo
    createUI() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.instructionText = this.add.text(
            this.game.config.width / 2,
            16,
            'Use as setas do teclado para se mexer',
            { fontSize: '12px', fill: '#fff' }
        ).setOrigin(0.5);

        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff'
        });
    }


    // Cria movimentação do jogador e faz animações rodarem enquanto o jogador se move
    handlePlayerMovement() {
        const velocityX = (this.cursors.left.isDown ? -160 : (this.cursors.right.isDown ? 160 : 0));

        this.player.setVelocityX(velocityX);

        if (velocityX < 0) this.player.anims.play('MCleft', true);
        else if (velocityX > 0) this.player.anims.play('MCright', true);
        else this.player.anims.play('MCstand');

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-260);
        }

        if (!this.player.body.touching.down) {
            this.player.setAngularVelocity(350);
            this.player.anims.play('MCspin', true);
        } else {
            this.player.setAngularVelocity(0);
            this.player.setRotation(0);
        }
    }


    // Cria o hotdog na cena
    spawnStaticHotDog() {
        const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
        const y = Phaser.Math.Between(0, this.physics.world.bounds.height);

        this.staticHotDog = this.physics.add.sprite(x, y, 'hotdog');
        this.staticHotDog.setImmovable(true);
        this.staticHotDog.body.allowGravity = false;

        this.physics.add.collider(this.player, this.staticHotDog, this.collectHotDog, null, this);
    }

    // Faz o Hotdog ser coletado
    collectHotDog() {
        this.score++;
        this.scoreText.setText('Score: ' + this.score).setFill('#ff0'); // Atualiza o texto de pontuação

        // Faz o texto brilhar quando hotdog é coletado
        const flashTween = this.tweens.add({
            targets: this.scoreText,
            duration: 800,
            alpha: 0.1,
            onComplete: () => {
                this.scoreText.setFill('#fff');
                this.scoreText.setAlpha(1);
            },
        });

        const prevX = this.staticHotDog.x;
        const prevY = this.staticHotDog.y;

        this.hotdogList.push({ x: prevX, y: prevY });

        this.staticHotDog.destroy();
        this.spawnStaticHotDog();

        // Destrói texto de instrução após coletar um hotdog
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null;
        }

        // Troca de cena após o jogador coletar 10 hotdogs
        if (this.score >= 10) {
            this.scene.start('youwin', { score: this.score, hotdogList: this.hotdogList });
        }

        this.timer.paused = true;

        this.time.delayedCall(1000, () => {
            this.timer.paused = false;
            flashTween.stop();
        });

        this.timer.reset({
            delay: 5000,
            callback: this.moveHotDog,
            callbackScope: this,
            loop: true,
        });
    }

    // Cria um timer para o hotdog
    setupTimer() {
        this.timer = this.time.addEvent({
            delay: 5000,
            callback: this.moveHotDog,
            callbackScope: this,
            loop: true,
        });
    }

    // Se o jogador não coletar o hotdog em cinco segundos, move ele de posição
    moveHotDog() {
        const prevX = this.staticHotDog.x;
        const prevY = this.staticHotDog.y;
        this.hotdogList.push({ x: prevX, y: prevY });
        this.staticHotDog.destroy();
        this.spawnStaticHotDog();
    }
}
