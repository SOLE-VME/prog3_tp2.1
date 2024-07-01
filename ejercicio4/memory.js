class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.isMatched = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }

    publicUnflip() { 
        this.#unflip();
    }

    toggleFlip() {
        if (this.isFlipped) {
            this.publicUnflip(); 
            this.isFlipped = false;
        } else {
            this.#flip();
            this.isFlipped = true;
        }
    }

    matchedCards(otherCard) {
        return this.name === otherCard.name;
    }

    setMatched() {
        this.isMatched = true;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);
        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    reset() {
        this.cards.forEach(card => {
            card.isFlipped = false;
            card.isMatched = false;
            card.publicUnflip(); 
        });
        this.shuffleCards();
        this.render();
    }
}


class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.moveCount = 0;
        this.startTime = null;
        this.intervalId = null;
        this.score = 0;
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert("La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms");
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.startTimer();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);
            this.moveCount++;
            this.updateMoveCount();
            this.updateScore();

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        if (this.flippedCards[0].matchedCards(this.flippedCards[1])) {
            this.flippedCards.forEach(card => card.setMatched());
            this.matchedCards.push(...this.flippedCards);
            this.flippedCards = [];
            this.updateScore();
        } else {
            setTimeout(() => {
                this.flippedCards.forEach(card => card.toggleFlip());
                this.flippedCards = [];
            },  this.flipDuration);
        }
    }

    resetGame() {
        this.board.reset();
        this.matchedCards = [];
        this.flippedCards = [];
        this.moveCount = 0;
        this.updateMoveCount();
        this.stopTimer();
        this.startTimer();
        this.stopTimer();
        this.startTimer();
        this.score = 0;
        this.updateScore();
    }

    updateMoveCount() {
        document.getElementById("move-count").textContent = this.moveCount;
    }

    updateScore() {
        const elapsedTime = this.getElapsedTime();
        const scoreMultiplier = 1000 / (this.moveCount + 1);
        this.score = Math.floor(scoreMultiplier / elapsedTime);
        document.getElementById("score").textContent = this.score;
    }

    getElapsedTime() {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - this.startTime;
        return elapsedTime / 1000;
    }

    startTimer() {
        this.startTime = new Date().getTime();
        this.intervalId = setInterval(() => this.updateTimer(), 1000);
    }

    stopTimer() {
        clearInterval(this.intervalId);
    }

    updateTimer() {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - this.startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        document.getElementById("timer").textContent = seconds;
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);
    

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();

    
    });
    
});
