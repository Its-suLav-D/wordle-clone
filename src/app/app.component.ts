import { Component, OnInit, HostListener } from '@angular/core';
import { iif } from 'rxjs';
import { AppService } from './app.service';

interface Tile {
  color: string;
  value: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'wordle';

  WORD_LENGTH = 5;
  currentWord: string = '';
  currentGuess: string = '';

  board: any = [];
  guesses: any = [];
  letter_index: number = 0;

  setGuesses: any = [];
  current_row: number = 0;
  current_col: number = 0;

  game_won: boolean = false;

  game_state: string = '';

  current_match: number = 0;

  /**
   *
   */
  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.fetchRequest().subscribe((response) => {
      this.currentWord = response[Math.floor(Math.random() * response.length)];
    });
    this.guesses = new Array(6).fill(null);
    this.board = new Array(6)
      .fill({ color: '', value: '' })
      .map(() => new Array(5).fill({ color: '', value: '' }));
  }

  createRange(number: number, index: number): any[] {
    const isCurrentGuess =
      index === this.setGuesses.findIndex((val: any) => val === null);
    return new Array(number);
  }

  createTiles(number: number, index: number) {
    const tile = [];

    for (let i = 0; i < this.WORD_LENGTH; i++) {
      let char = this.currentWord[i];
      tile.push(char);
    }
    return tile;
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    if (this.game_won) {
      return;
    }
    this.handleClick(event.key);
  }

  handleClick(key: any) {
    if (key === 'Backspace') {
      this.currentGuess = this.currentGuess.slice(0, -1);
      this.current_col--;
      if (this.current_col < 0) {
        this.current_col = 0;
      }
      this.board[this.current_row][this.current_col] = {
        color: '',
        val: '',
      };
    } else if (key === 'Enter') {
      this.setGuesses.push(this.currentGuess);
      if (this.game_won === false) {
        this.compareGuess();
        this.currentGuess = '';
        this.current_row++;
        this.current_col = 0;
      }
    } else {
      if (this.current_col >= 5) {
        return;
      }
      this.updateBoard(key);
      this.currentGuess += key;
    }
  }

  updateBoard(char: string) {
    this.board[this.current_row][this.current_col] = { color: '', value: char };
    if (this.current_col < 5) {
      this.current_col++;
    }
  }

  compareGuess() {
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      if (this.currentWord[i].toLowerCase() === this.currentGuess[i]) {
        let obj = this.board[this.current_row][i];
        obj.color = 'green';
        this.current_match++;
      } else {
        //
        if (this.currentWord.toLowerCase().includes(this.currentGuess[i])) {
          this.board[this.current_row][i].color = 'partial';
        } else {
          this.board[this.current_row][i].color = 'incorrect';
        }
      }
    }
    console.log(this.current_match);

    this.gameEnd();
    this.current_match = 0;
  }

  gameEnd() {
    if (this.current_match === 5) {
      this.game_won = true;
      this.game_state = 'You Won!';
      return;
    }
    if (this.current_match <= 5 && this.setGuesses.length === 6) {
      this.game_won = true;
      this.game_state = 'You Lost!';
      return;
    }
  }
}
