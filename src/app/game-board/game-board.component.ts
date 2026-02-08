import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  @Input() grid: string[][] = [];
  @Input() foundCells: Set<string> = new Set();
  @Output() cellsSelected = new EventEmitter<{ startRow: number; startCol: number; endRow: number; endCol: number }>();

  startCell: { row: number; col: number } | null = null;
  hoverCell: { row: number; col: number } | null = null;

  onCellClick(row: number, col: number): void {
    if (!this.startCell) {
      this.startCell = { row, col };
    } else {
      this.cellsSelected.emit({
        startRow: this.startCell.row,
        startCol: this.startCell.col,
        endRow: row,
        endCol: col
      });
      this.startCell = null;
      this.hoverCell = null;
    }
  }

  onCellHover(row: number, col: number): void {
    if (this.startCell) {
      this.hoverCell = { row, col };
    }
  }

  onTouchCell(event: TouchEvent, row: number, col: number): void {
    event.preventDefault();
    this.onCellClick(row, col);
  }

  isStartCell(row: number, col: number): boolean {
    return this.startCell?.row === row && this.startCell?.col === col;
  }

  isFoundCell(row: number, col: number): boolean {
    return this.foundCells.has(`${row},${col}`);
  }

  isPreviewCell(row: number, col: number): boolean {
    if (!this.startCell || !this.hoverCell) return false;
    const cells = this.getCellsBetween(
      this.startCell.row, this.startCell.col,
      this.hoverCell.row, this.hoverCell.col
    );
    return cells.some(c => c.row === row && c.col === col);
  }

  @HostListener('document:keydown.escape')
  cancelSelection(): void {
    this.startCell = null;
    this.hoverCell = null;
  }

  private getCellsBetween(r1: number, c1: number, r2: number, c2: number): { row: number; col: number }[] {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    const steps = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
    const cells: { row: number; col: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      cells.push({ row: r1 + i * dr, col: c1 + i * dc });
    }
    return cells;
  }
}
