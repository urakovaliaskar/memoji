function setAction(context, type, className) {
	context.cardsSelected[0].node.classList[type](className);
	context.cardsSelected[1].node.classList[type](className);
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function Card(id, content) {
	this.value = content;
	this.id = id;
}

Card.prototype.createNode = function () {
	this.node = document.createElement('div');
	this.node.setAttribute('id', this.id);
	this.node.classList.add('card');
	this.node.innerHTML = `<div class="side front">${this.value}</div><div class="side back"></div>`;
	return this.node;
};

function Game() {
	this.playground = document.getElementById('playground');
	const memoji = this.playground.dataset.memoji.split(' ');
	this.values = shuffleArray([...memoji, ...memoji]);
	this.timer = document.getElementById('timer');
	this.duration = this.timer.dataset.duration;
	this.messages = {
		win:
			'<div class="messageBox"><h2 class="messageText"><span>W</span><span>i</span><span>n</span></h2><button class="messageButton">Play again</button></div>',
		lose:
			'<div class="messageBox"><h2 class="messageText"><span>L</span><span>o</span><span>s</span><span>e</span></h2><button class="messageButton">Try again</button></div>',
	};

	this.cards = {};
	this.cardsSelected = [];
	this.cardsFlipped = 0;
	this.isStarted = false;
}
Game.prototype.setPlayground = function (gameObj) {
	gameObj.playground.innerHTML = '';
	for (var i = 0; i < gameObj.values.length; i++) {
		gameObj.cards[i] = new Card(i, gameObj.values[i]);
		gameObj.playground.appendChild(gameObj.cards[i].createNode());
	}

	//Выставляем таймер
	if (gameObj.duration % 60 < 10) {
		gameObj.timer.innerText =
			Math.floor(gameObj.duration / 60) + ':0' + (gameObj.duration % 60);
	} else {
		gameObj.timer.innerText =
			Math.floor(gameObj.duration / 60) + ':' + (gameObj.duration % 60);
	}
};
Game.prototype.runTimer = function (gameObj) {
	var seconds = gameObj.duration,
		timer = gameObj.timer;

	gameObj.timerRender = setInterval(function () {
		seconds--;
		if (seconds >= 10) {
			timer.innerText = '0:' + seconds;
		} else if (seconds < 10 && seconds > 0) {
			timer.innerText = '0:0' + seconds;
		} else if (seconds == 0) {
			timer.innerText = '0:0' + seconds;
			clearInterval(gameObj.timerRender);
		}
	}, 1000);

	gameObj.timerOut = setTimeout(function () {
		if (gameObj.cardsFlipped !== gameObj.values.length) {
			gameObj.showResult(gameObj, 'lose');
		}
	}, seconds * 1000);
};
Game.prototype.showResult = function (gameObj, result) {
	clearInterval(gameObj.timerRender);

	var node = document.createElement('div');
	node.setAttribute('id', 'message');
	node.innerHTML = gameObj.messages[result];
	gameObj.playground.appendChild(node);
};
Game.prototype.reset = function (gameObj) {
	clearTimeout(gameObj.timerOut);
	clearInterval(gameObj.timerRender);
	gameObj.cards = {};
	gameObj.cardsSelected = [];
	gameObj.cardsFlipped = 0;
	gameObj.isStarted = false;
};
Game.prototype.start = function () {
	this.setPlayground(this);

	var self = this;

	this.playground.addEventListener('click', function (event) {
		const { target: t } = event;
		if (t.classList.contains('side')) {
			var target = self.cards[t.parentNode.id];

			if (!self.isStarted) {
				self.isStarted = true;
				self.runTimer(self);
			}

			if (target.node.classList.contains('rotate')) return;

			if (
				!target.node.classList.contains('rotate') &&
				self.cardsSelected.length < 2
			) {
				target.node.classList.add('rotate');

				if (self.cardsSelected.length == 0) {
					self.cardsSelected[0] = target;
				} else if (self.cardsSelected.length == 1) {
					self.cardsSelected[1] = target;

					if (self.cardsSelected[0].value == self.cardsSelected[1].value) {
						setAction(self, 'add', 'match');

						self.cardsSelected = [];
						self.cardsFlipped += 2;

						if (self.cardsFlipped == self.values.length)
							self.showResult(self, 'win');
					} else {
						setAction(self, 'add', 'mismatch');
					}
				}
			} else if (
				!target.node.classList.contains('rotate') &&
				self.cardsSelected.length == 2
			) {
				setAction(self, 'remove', 'rotate');
				setAction(self, 'remove', 'mismatch');
				self.cardsSelected = [];
				target.node.classList.add('rotate');
				self.cardsSelected[0] = target;
			}
		}

		if (t.tagName == 'BUTTON') {
			self.reset(self);
			self.setPlayground(self);
		}
	});
};

var myGame = new Game();
myGame.start();
