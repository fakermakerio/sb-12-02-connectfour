/** 
 * Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class ConnectFourGame {
	/**
	 * @param players	Array of Player objects
	 * @param width 	Number of columns in the board
	 * @param height 	Number of rows in the board
	 */
	constructor(players, width = 5, height = 5) {
		this.width = width;
		this.height = height;

		this.currentPlayerIndex = 0;
		this.players = players;

		this.gameover = true;

		this.board = [];

		this.initDOM();
		this.addEvents();
		this.updateNewGameForm();
	}

	get currentPlayer() {
		return this.players[this.currentPlayerIndex];
	}

	initDOM() {
		this.newGameForm = document.querySelector('#players-form');
		
		this.htmlGame = document.querySelector('#game');
		this.htmlBoard = document.querySelector('#board');
		this.makeHtmlBoard();
	}
	
	addEvents() {
		this.newGameForm.addEventListener('submit', (event) => this.handleNewGameFormSubmit(event));
		[...this.newGameForm.querySelectorAll('input')].forEach((input) => {
			input.addEventListener('input', (event) => this.handleNewGameFormInputChange(event) );
		});
	}

	/**
 	 * Creates the JavaScript logic board structure, where board 
	 * is an array of rows, and each row is array of cells  (board[y][x])
 	 */
	makeBoard() {
		for (let y = 0; y < this.height; y++) {
			this.board[y] = [];
			for (let x = 0; x < this.width; x++) {
				this.board[y][x] = null;
			}
		}
	}

	/**
	 * Makes the HTML table and row of column tops.
	 **/
	makeHtmlBoard() {

		// Create the top row for each column where players will click to drop their pieces
		const top = document.createElement('tr');
		top.addEventListener('click', (event) => this.handleClick(event));

		// Create cells within top row
		for (let x = 0; x < this.width; x++) {
			const headCell = document.createElement('th');
			headCell.setAttribute('id', x);
			top.append(headCell);
		}
		this.htmlBoard.querySelector('thead').append(top);

		// Create the actual game board's elements
		for (let y = 0; y < this.height; y++) {
			// Create row
			const row = document.createElement('tr');
			// Create each column within the row
			for (let x = 0; x < this.width; x++) {
				const cell = document.createElement('td');
				cell.setAttribute('id', `${y}-${x}`);
				row.append(cell);
			}
			this.htmlBoard.querySelector('tbody').append(row);
		}
	}

	addPlayer(player) {
		this.players.push(player);
	}

	/**
	 * Given column x, return top empty y (null if filled)
	 * @param x Column index
	 */
	findSpotForCol(x) {
		// Find first available row (work backwards)
		let y = this.height;
		while (y--) {
			// If this cell is null, it's available
			if (this.board[y][x] === null)
				return y;
		}
		return null;
	}

	/**
	 * Update DOM to place piece into HTML table of board
	 * @param y Row index
	 * @param x Column index
	 */
	placeInTable(y, x) {
		// TODO: make a div and insert into correct table cell
		const piece = document.createElement('div');
		// piece.innerText = this.currentPlayerIndex+1;
		piece.classList.add('piece');
		piece.style.backgroundColor = this.currentPlayer.color;

		// Get appropriate cell in table and add piece
		// (Need to add 1 to row due to placement row on top)
		const tableCell = this.htmlBoard.rows[y + 1].cells[x];
		tableCell.innerHTML = '';
		tableCell.appendChild(piece);
	}

	/**
	 * Starts a new game.
	 * @param newPlayers Array of new Player objects (optional). If unspecified, this.players will not be updated.
	 */
	newGame( newPlayers = null ) {

		if ( newPlayers !== null ) {
			this.players = newPlayers;
		}

		this.currentPlayerIndex = 0;

		this.gameover = false;
		this.htmlGame.classList.remove('gameover');

		// Rebuild game board data
		this.makeBoard();

		// Remove player pieces
		[...this.htmlBoard.querySelectorAll('.piece')].forEach((piece) => piece.remove());
	}

	/**
	 * Announce game end 
	 * @param msg Message to show to user
	 */
	endGame(msg) {
		this.gameover = true;
		this.htmlGame.classList.add('gameover');
		alert(msg);
	}

	/**
	 * Handle click of column top to play piece
	 * @param evt Mouse event object
	 */
	handleClick(evt) {
		// prevent playing when game is over
		if (this.gameover)
			return;

		// get x from ID of clicked cell
		const x = +evt.target.id;

		// get next spot in column (if none, ignore click)
		const y = this.findSpotForCol(x);
		if (y === null) {
			return;
		}

		// update in-memory board
		this.board[y][x] = this.currentPlayer;

		// place piece in board and add to HTML table
		this.placeInTable(y, x);

		// check for win
		if (this.checkForWin()) {
			this.currentPlayer.numberOfWins++;
			return this.endGame(`${this.currentPlayer.name} won!`);
		}

		// check for tie
		if (this.checkForTie()) {
			return this.endGame("It's a tie!");
		}

		this.nextPlayer();
	}

	handleNewGameFormInputChange(evt) {
		// Check for valid colors
		if( this.checkValidHexColor( evt.target ) ) {
			this.updateNewGameForm();
		}
	}

	handleNewGameFormSubmit(evt) {
		evt.preventDefault();

		// Get player colors from form
		const colorInputPlayer1 = this.newGameForm.querySelector('[name=colorPlayer1]');
		const colorInputPlayer2 = this.newGameForm.querySelector('[name=colorPlayer2]');
		
		// Create new players
		const newPlayers = [
			new Player("Player 1" , colorInputPlayer1.value) ,
			new Player("Player 2" , colorInputPlayer2.value)
		];

		// Start game
		this.newGame( newPlayers );
	}
	/**
	 * Checks the specified input for a valid hex formatted color string (e.g. #123abc)
	 * @param input Input element
	 */
	checkValidHexColor( input ) {
		// Hex color format regular expression (to keep it simple, must be in 6 digit format)
		const hexColorRegex = /^#[0-9a-f]{6}/i;

		// Check value and show custom message if it fails
		if ( input.value.match( hexColorRegex ) === null ) {
			input.setCustomValidity( 'Colors must be entered as a valid 6 digit hex value.\nExample: "#ff00ff"' );
			return false;
		} else {
			input.setCustomValidity('');
			return true;
		}
	}
	/**
	 * Updates the new game form to reflect inputs.
	 */
	updateNewGameForm() {
		const colorInputPlayer1 = this.newGameForm.querySelector('[name=colorPlayer1]');
		const colorInputPlayer2 = this.newGameForm.querySelector('[name=colorPlayer2]');
		const colorPreviewPlayer1 = this.newGameForm.querySelectorAll('.piece')[0];
		const colorPreviewPlayer2 = this.newGameForm.querySelectorAll('.piece')[1];
		colorPreviewPlayer1.style.backgroundColor = colorInputPlayer1.value;
		colorPreviewPlayer2.style.backgroundColor = colorInputPlayer2.value;
	}

	/**
	 * Sets the next player's turn
	 */
	nextPlayer() {
		if (this.currentPlayerIndex + 1 < this.players.length) {
			this.currentPlayerIndex++;
		} else {
			this.currentPlayerIndex = 0;
		}
	}

	/**
	 * Check board cell-by-cell for 'does a win start here?'
	 */
	checkForWin() {
		const _win = (cells) => {
			// Check four cells to see if they're all color of current player
			//  - cells: list of four (y, x) cells
			//  - returns true if all are legal coordinates & all match currentPlayer

			return cells.every(
				([y, x]) =>
					y >= 0 &&
					y < this.height &&
					x >= 0 &&
					x < this.width &&
					this.board[y][x] === this.currentPlayer
			);
		}

		// TODO: read and understand this code. Add comments to help you.
		// Loop through rows
		for (let y = 0; y < this.height; y++) {
			// Columns
			for (let x = 0; x < this.width; x++) {
				// Store coordinates for matching patterns
				const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
				const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
				const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
				const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

				if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
					return true;
				}
			}
		}
		return false;
	}

	checkForTie() {
		const value = this.board.every((cell) => cell === null);
		console.log("checkForTie() > ", value);
		return;
	}
}

class Player {
	constructor(name = 'Player', color = '#ff00ff') {
		this.name = name;
		this.color = color;
		this.numberOfWins = 0;
	}
}

const players = [
	new Player("Player 1", "#c52132"),
	new Player("Player 2", "#ffca24")
]
const game = new ConnectFourGame(players, 7, 6);
