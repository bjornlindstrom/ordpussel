import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-word-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-list.component.html',
  styleUrl: './word-list.component.css'
})
export class WordListComponent {
  @Input() words: string[] = [];
  @Input() foundWords: Set<string> = new Set();

  get remainingCount(): number {
    return this.words.length - this.foundWords.size;
  }
}
