class YouWin extends Phaser.Scene {
    constructor() {
        super({ key: 'youwin', backgroundColor: '#00c04b' });
    }

    // Carrega o botão de restart
    preload() {
        this.load.image('restart', 'assets/restart.png');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        // Configura o texto
        const textConfig = {
            color: '#000000',
            fontSize: 50,
            fontStyle: 'bold italic',
            fontFamily: 'Comic Sans MS',
        };

        // Cria o texto
        const message = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 2 * 15 - 20,
            'Você Venceu!',
            textConfig
        ).setOrigin(0.5);

        // Adiciona a imagem do botão de restart a tela
        const restartBt = this.add.image(
            this.game.config.width / 2,
            this.game.config.height / 2 + 100,
            'restart'
        ).setScale(0.5).setOrigin(0.5, 0.5).setInteractive();

        // Faz o botão de restart voltar à cena do jogo
        restartBt.on('pointerdown', function () {
            this.scene.get('jogo').score = 0; // Reset the score to zero
            this.scene.start('jogo');
        }, this);
    }
}
