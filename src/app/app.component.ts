import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBoardComponent } from './game-board/game-board.component';
import { WordListComponent } from './word-list/word-list.component';
import { PuzzleService, WordPosition } from './services/puzzle.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameBoardComponent, WordListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  grid: string[][] = [];
  words: string[] = [];
  positions: { [word: string]: WordPosition } = {};
  foundWords = new Set<string>();
  foundCells = new Set<string>();
  message = '';
  gridSize = 10;
  gridSizes = [4, 6, 8, 10];
  completedCount = 0;

  private readonly STORAGE_KEY = 'wordSearchCompleted';
  private readonly SIZE_KEY = 'wordSearchGridSize';

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.completedCount = parseInt(localStorage.getItem(this.STORAGE_KEY) ?? '0', 10) || 0;
    const savedSize = parseInt(localStorage.getItem(this.SIZE_KEY) ?? '', 10);
    if (this.gridSizes.includes(savedSize)) {
      this.gridSize = savedSize;
    }
    this.newGame();
  }

  newGame(): void {
    this.message = '';
    this.foundWords = new Set();
    this.foundCells = new Set();
    const puzzle = this.puzzleService.generatePuzzle(this.gridSize);
    this.grid = puzzle.grid;
    this.words = puzzle.words;
    this.positions = puzzle.positions;
  }

  setGridSize(size: number): void {
    this.gridSize = size;
    localStorage.setItem(this.SIZE_KEY, size.toString());
    this.newGame();
  }

  onCellsSelected(selection: { startRow: number; startCol: number; endRow: number; endCol: number }): void {
    const result = this.puzzleService.validate(
      selection.startRow, selection.startCol,
      selection.endRow, selection.endCol,
      this.positions
    );
    if (result.found && result.word) {
      this.foundWords = new Set(this.foundWords).add(result.word);
      this.markFoundCells(result.word);
      if (this.foundWords.size === this.words.length) {
        this.completedCount++;
        localStorage.setItem(this.STORAGE_KEY, this.completedCount.toString());
        this.message = 'Congratulations! You found all the words!';
      }
    }
  }

  private markFoundCells(word: string): void {
    const pos = this.positions[word];
    if (!pos) return;
    const dr = Math.sign(pos.endRow - pos.startRow);
    const dc = Math.sign(pos.endCol - pos.startCol);
    const steps = Math.max(Math.abs(pos.endRow - pos.startRow), Math.abs(pos.endCol - pos.startCol));
    const newCells = new Set(this.foundCells);
    for (let i = 0; i <= steps; i++) {
      newCells.add(`${pos.startRow + i * dr},${pos.startCol + i * dc}`);
    }
    this.foundCells = newCells;
  }
}
