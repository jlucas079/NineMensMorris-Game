module.exports.board_server = class board_server{
	constructor(square, position, startingPlayer) {
		this.square = square;
		this.position = position;
		this.player = startingPlayer;
		this.putPhase = true; // if we are in the put phase
		this.winner = 0;
		this.lastmove = [[[-1, -1], [-1, -1]], [[-1, -1], [-1, -1]]]; // a record of each player's last move
		this.playerPieces = [0, 0]; // a count of each player's pieces
		this.board = this.createBoard(square, position);
	}

	// creating the 2D array that will represent the game
	createBoard(square,position) {
		let board = [];
		for (let i=0;i<square;i++){
			let line = [];
			for (let j=0;j<position;j++){
				line.push(0);
			}
			board.push(line);
		}
		return board;	
	}

	// can the player put a piece on this space
	CanPut(r, c) {
		//Check is Empty
		if (this.board[r][c] != 0) {
			return false;
		}
            /*
	
		this.board[r][c] = this.player;
	
		//Check Horizontal
		let min = Math.max(0, c - 3);
		let max = Math.min(this.position - 4, c);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[r][i] &&
				this.board[r][i] == this.board[r][i + 1] &&
				this.board[r][i + 1] == this.board[r][i + 2] &&
				this.board[r][i + 2] == this.board[r][i + 3]
			) {
				this.board[r][c] = 0;
				return false;
			}
		}
	
		// Check Vertical
		min = Math.max(0, r - 3);
		max = Math.min(this.square - 4, r);
	
		for (let i = min; i <= max; i++) {
			if (
				this.player == this.board[i][c] &&
				this.board[i][c] == this.board[i + 1][c] &&
				this.board[i + 1][c] == this.board[i + 2][c] &&
				this.board[i + 2][c] == this.board[i + 3][c]
			) {
				this.board[r][c] = 0;
				return false;
			}
		}
            */
		this.board[r][c] = 0;
		return true;
	}
	
	// puting a player's piece on the space
	Put(r,c){
		this.board[r][c] = this.player;
		if (this.putPhase){this.playerPieces[this.player-1]++;}
		if (this.playerPieces[0] + this.playerPieces[1] == 18){this.putPhase = false;}
	}

	// can the player select a piece
	canPick(r, c) {
		return this.board[r][c] == this.player;
	}

	// is this move a repeat of the last one
	Repeat(rselected, cselected, r, c) {
		return (
			this.lastmove[this.player-1][0][0] == r &&
			this.lastmove[this.player-1][0][1] == c &&
			this.lastmove[this.player-1][1][0] == rselected &&
			this.lastmove[this.player-1][1][1] == cselected
		);
	}

	// moving a player's piece
	Move(rselected,cselected,r,c){
		this.board[r][c] = this.player;
		this.board[rselected][cselected] = 0;
		this.lastmove[this.player-1][0][0] = rselected;
		this.lastmove[this.player-1][0][1] = cselected;
		this.lastmove[this.player-1][1][0] = r;
		this.lastmove[this.player-1][1][1] = c;
	}

    
	// does this move create a line of 3
    createsLine(square, position) {
        // 1. Check for a line in the same square
        if (this.checkSameSquareLine(square, position)) {
            return true;
        }
    
        // 2. Check for a line across different squares in the same position
        if (this.checkSamePositionDifferentSquares(square, position)) {
            return true;
        }
    
        return false;
    }
    
    // Helper function to check for 3 pieces in a line within the same square
    checkSameSquareLine(square, position) {
        const adjacentPositions = {
            0: [1, 2], // Clockwise 0 -> 1 -> 2
            1: [0, 2],
            2: [1, 0],
            3: [4, 5], // Clockwise 3 -> 4 -> 5
            4: [3, 5],
            5: [4, 3],
            6: [7, 0], // Counterclockwise 6 -> 7 -> 0
            7: [6, 0]
        };
    
        // Check if the current position forms a line with its adjacent positions
        const [posA, posB] = adjacentPositions[position];
        if (
            this.board[square][position] == this.board[square][posA] &&
            this.board[square][posA] == this.board[square][posB]
        ) {
            return true;
        }
        return false;
    }
    
    // Helper function to check for 3 pieces in the same position across different squares
    checkSamePositionDifferentSquares(currentSquare, position) {
        let count = 0; // Counter for pieces in the same position across squares
    
        for (let square = 0; square < this.squares; square++) {
            if (this.board[square][position] == this.board[currentSquare][position] &&
                this.board[square][position] != 0) {
                count++;
            }
        }
    
        return count >= 3; // If 3 pieces are found, return true
    }
    

	// can a player make this move
	CanMove(rselected, cselected,r,c) {
		if (this.Repeat(rselected,cselected,r,c)){return false;}
		if ((r == rselected && Math.abs(c - cselected) == 1) || (c == cselected && Math.abs(r - rselected) == 1) || ((r==rselected && ((cselected==7 && c==0) || (c==7 && cselected==0))))) {
			this.board[rselected][cselected] = 0;
			if (this.CanPut(r,c)){
				this.board[rselected][cselected] = this.player;
				return true;
			}
			this.board[rselected][cselected] = this.player;
		}
		return false;
	}


	// can a player remove this piece
	CanRemove(r,c){
		return this.board[r][c] == 3 - this.player;
	}

	// removing a opponent's piece
	Remove(r,c){
		this.board[r][c] = 0;
		this.playerPieces[2-this.player]--;
	}

	// changing wich player plays next
	changePlayer(){
		this.player = 3-this.player;
	}

	// does this player have any moves left
	hasMoves() {
		for (let i = 0; i < this.square; i++) {
			for (let j = 0; j < this.position; j++) {
				if (this.board[i][j] == this.player) {
					if (i > 0) {
						if (this.CanMove(i,j,i-1,j)){
							return true;
						}
					}
					if (i < this.square - 1) {
						if (this.CanMove(i,j,i+1,j)){
							return true;
						}
					}
					if (j > 0) {
						if (this.CanMove(i,j,i,j-1)){
							return true;
						}
					}
					if (j < this.position - 1) {
						if (this.CanMove(i,j,i,j+1)){
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	// is the game over
	checkWinner() {
		if (
			this.playerPieces[this.player - 1] <= 2 ||
			!this.hasMoves()
		) {
			this.winner = 3 - this.player;
		}
	}
}

module.exports.copy_2darray = function copy_2darray(array) {
	let copy = [];
	for (let i = 0; i < array.length; i++) {
		copy[i] = array[i].slice();
	}
	return copy;
}