window.app = new Vue({
    el: '#app',

    data: {
        playersCount: 4,
        playersData: [
            {
                name: "Игрок 1",
                score: 0
            },
            {
                name: "Игрок 2",
                score: 0
            },
            {
                name: "Игрок 3",
                score: 0
            },
            {
                name: "Игрок 4",
                score: 0
            }
        ],

        buttonBindings: {
            'KeyF': 0,
            'KeyG': 1,
            'KeyV': 2,
            'KeyB': 3,
        },

        resetKey: 'R',

        keyBindingSettings: {
            0: 'F', 1: 'G', 2: 'V', 3: 'B'
        },

        controlKeys: {},

        isBlocking: true,
        isBlocked: false,

        gameMode: 'si',

        points: [1, 2, 3, 4, 5],
        currentRound: 0,

        pointsQ: 10,
        pointsM: 1,
        maxM: 1,

        playersPressed: [],
        currentPlayerIndex: -1,

        showSettings: false,
        sounds: {
            ding: new Audio('./static/sound/ding.mp3'),
            beep: new Audio('./static/sound/beep.mp3')
        }
    },

    mounted: function () {
        window.addEventListener('keydown', this.buttonPressed);
        this.controlKeys = {
            'Space': {func: this.reset, params: []},
            'ArrowRight': {func: this.changeRound, params: [1]},
            'ArrowLeft': {func: this.changeRound, params: [-1]},
            'ArrowUp': {func: this.changeMultiplier, params: [1]},
            'ArrowDown': {func: this.changeMultiplier, params: [-1]},
            'Equal': {func: this.changePoints, params: [1]},
            'Minus': {func: this.changePoints, params: [-1]}
        }
    },

    methods: {
        buttonPressed: function (event) {
            //console.log(event.code);
            if (event.code in this.controlKeys) {
                this.callFunc(this.controlKeys[event.code]);
            } else if (event.code === 'Key' + this.resetKey) {
                this.reset()
            } else if (!this.isBlocked) {
                var pi = this.playerIndex(event.code);
                if (pi !== undefined && this.playersPressed.indexOf(pi) < 0) {
                    this.isBlocked = this.isBlocking;
                    this.sounds.ding.play();
                    this.playersPressed.push(pi);
                }
            }
        },

        playerIndex: function (keyCode) {
            return this.buttonBindings[keyCode];
        },

        callFunc(data) {
            data.func.apply(this, data.params);
        },

        reset: function () {
            this.isBlocked = false;
            this.playersPressed = [];
            this.currentPlayerIndex = -1;
        },

        restart: function () {
            this.reset();
            this.playersData.forEach(function (player) {
                player.score = 0;
            });
            this.currentRound = 0;

        },

        changeRound: function (delta) {
            this.currentRound = ((this.currentRound + delta) + this.points.length) % this.points.length;
        },

        changeMultiplier: function (delta) {
            this.pointsM = 1 + ((this.pointsM - 1 + delta) + this.maxM) % this.maxM;
        },

        toggleEdit: function (index) {
            this.playersData[index].edit = !this.playersData[index].edit;
            this.$forceUpdate();
        },

        toggleSettings: function () {
            this.showSettings = !this.showSettings;
            this.$forceUpdate();
        },

        changePoints: function (delta) {

            if (this.currentPlayerIndex < this.playersPressed.length - 1) {
                this.isBlocked = false;
                this.currentPlayerIndex++;
                this.playersData[this.playersPressed[this.currentPlayerIndex]].score += (this.currentRoundPoints * delta);
            }
            if (delta > 0) {
                this.changeRound(1);
                this.reset();
            } else {
                this.sounds.beep.play()
            }
        }

    },

    watch: {
        gameMode: {
            handler: function () {
                //console.log(this.gameMode);

                this.restart();

                if (this.gameMode === 'si') {
                    this.isBlocking = true;
                    this.pointsQ = 10;
                    this.pointsM = 1;
                    this.maxM = 1;
                }

                if (this.gameMode === 'hamsa') {
                    this.isBlocking = false;
                    this.pointsQ = 100;
                    this.pointsM = 1;
                    this.maxM = 4;
                }
            },
            immediate: true
        },

        keyBindingSettings: {
            handler: function () {

                this.buttonBindings = {};
                for (var pi = 0; pi < this.playersCount; pi++){
                    this.buttonBindings['Key' + this.keyBindingSettings[pi].toUpperCase()] = pi
                }
                //console.log('REBINDING', this.buttonBindings);
            },
            deep: true
        },

        playersCount: {
            handler: function() {
                this.playersData = [];
                var bb = {};
                for (var i = 0; i<this.playersCount; i++){
                    this.playersData.push({
                        name: 'Игрок ' + (i+1),
                        score: 0
                    });
                    bb[i] = '' + (i+1);
                }
                this.keyBindingSettings = bb;
                this.restart()
            }
        }
    },

    computed: {
        currentRoundPoints: function () {
            return this.points[this.currentRound] * this.pointsQ * this.pointsM;
        },

        currentPlayer: function () {
            return this.playersPressed[this.currentPlayerIndex + 1];
        },

        currentPlayerName: function () {
            var player = this.playersData[this.playersPressed[this.currentPlayerIndex + 1]];
            return player ? player.name : '';
        },

        players: function () {
            var _this = this;

            return this.playersData.map(function (player, idx) {

                if (_this.isBlocking) {
                    player.active = _this.isBlocked && (_this.playersPressed.indexOf(idx) > -1) && (_this.playersPressed[_this.playersPressed.length - 1] === idx);
                } else {
                    player.active = (_this.playersPressed.slice(_this.currentPlayerIndex + 1).indexOf(idx) > -1) && (_this.currentPlayerIndex < _this.playersPressed.length - 1);
                }

                player.locked = (_this.playersPressed.slice(0, _this.currentPlayerIndex + 1).indexOf(idx) > -1);
                //console.log(player);
                return player
            })
        },

        pressesQueue: function () {
            return this.playersPressed.slice(this.currentPlayerIndex + 1)
        }
    }

});