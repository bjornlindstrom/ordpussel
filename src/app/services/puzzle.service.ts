import { Injectable } from '@angular/core';

export interface WordPosition {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface Puzzle {
  grid: string[][];
  words: string[];
  positions: { [word: string]: WordPosition };
}

const WORD_COUNTS: { [size: number]: [number, number] } = {
  4: [3, 5],
  6: [5, 7],
  8: [7, 10],
  10: [8, 12],
};

const DIRECTIONS = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

const WORD_BANK = [
  'BANAN', 'BLOMMA', 'BONDE', 'BRAND', 'BRONS', 'BRYTA', 'DAMM', 'DJUNG',
  'DRIVA', 'DUNGE', 'ELDIG', 'ENKEL', 'FABEL', 'FAGER', 'FALLA', 'FAMLA',
  'FEBER', 'FEMMA', 'FEST', 'FLAGG', 'FLOD', 'FLYGA', 'FNASK', 'FODER',
  'FOKUS', 'FORSA', 'FRAKK', 'FROST', 'FRUKT', 'FUSKA', 'GALEN', 'GLANS',
  'GLASS', 'GNETA', 'GRIPA', 'GRODA', 'GRUVA', 'GRYMT',
  'GUMMI', 'GUNGA', 'HAMNA', 'HELGA', 'HJORD', 'HUGGA',
  'HUSET', 'HYLLA', 'INGEN', 'IRONI', 'JAGAR', 'JUBEL', 'JUICE',
  'KAFFE', 'KALLA', 'KARTA', 'KASTA', 'KLANG', 'KLARA', 'KLIMP', 'KLOSS',
  'KNEKT', 'KNIPA', 'KNUFF', 'KONTO', 'KORSA', 'KRAFT', 'KRAMA', 'KRANS',
  'KRETS', 'KRITA', 'KRONA', 'KRUPP', 'KRYSS', 'KULOR', 'KUMLA', 'KVART',
  'LAGER', 'LAMPA', 'LEJON', 'LEVER', 'LILJA', 'LIMPA', 'LINJE', 'LISTA',
  'LJUNG', 'LJUVA', 'LOCKA', 'LUGNA', 'LUNCH', 'LYSER', 'MANGO', 'MASKA',
  'MATTA', 'MEDAL', 'MELON', 'MIDJA', 'MJUKA', 'MODIG', 'MORAL', 'MUREN',
  'MUSIK', 'NAFTA', 'NAKEN', 'NATUR', 'NORSK', 'NYHET', 'NYMFA', 'OCEAN',
  'OFFER', 'OPERA', 'OVISS', 'PANGA', 'PENNA', 'PIANO', 'PIGAN', 'PLATS',
  'POLIS', 'POMPA', 'POSTA', 'PRICK', 'PROVA', 'PUNKT', 'PURKA', 'PYTTE',
  'RADAR', 'RANKA', 'REKYL', 'RESAN', 'RINGA', 'RODDA', 'ROLIG',
  'RUBBA', 'RUSKA', 'SAGOR', 'SALTA', 'SEGLA', 'SJUKT', 'SKALA', 'SKARP',
  'SKILD', 'SKIVA', 'SKOLA', 'SKOPA', 'SKUGG', 'SLANG', 'SLOTT', 'SMART',
  'SMILA', 'SNABB', 'SNYGG', 'SOLAR', 'SPELA', 'SPORT', 'STACK',
  'STALL', 'STARK', 'STOCK', 'STOLT', 'STORM', 'STUDS', 'STUND',
  'SVAMP', 'SVART', 'SVING', 'SYREN', 'TAVLA', 'TIMMA', 'TJUGO',
  'TOMMA', 'TRAST', 'TROLL', 'TRUMP', 'TUNGA', 'TVEKA', 'UGGLA', 'UNDER',
  'VAKEN', 'VALLA', 'VECKA', 'VIRKA', 'YNGEL', 'ZEBRA',
  // Words with ÄÖÅ
  'ÄNGEL', 'ÄPPLE', 'ÄRLIG', 'ÄMNE', 'ÄLSKA', 'ÄNDRA', 'ÄVENTYR',
  'ÖPPEN', 'ÖDLA', 'ÖNSKAN', 'ÖVNING', 'ÖKEN', 'ÖRING',
  'ÅLDERN', 'ÅSKA', 'ÅNGEST', 'ÅSNA', 'ÅTERSE',
  'BÄVER', 'BÄLTE', 'BÖLJA', 'DÖRR', 'FÅGEL', 'FÄRG', 'FÖLJA',
  'GRÄS', 'GÖRA', 'HÄST', 'HÖST', 'JÄRN', 'KÖPA', 'KÄLLA',
  'LÄSA', 'LÖSA', 'LÄPP', 'MJÖL', 'MÖSSA', 'NÄSA', 'NÖJE',
  'PÄRON', 'RÄKA', 'RÖKA', 'RÄDD', 'SJÖ', 'SKÄR', 'SNÖRE',
  'STRÖM', 'STÄDA', 'SÖKA', 'TÅLA', 'TRÄD', 'VÄGG', 'VÄLJA',
  'VÅGA', 'ÄNDE', 'BJÖRK', 'FJÄLL', 'FLÖDE', 'FÖRSÖK', 'HÖNA',
  'KÄRLEK', 'LÄNGTA', 'MÄNNISKA', 'MÖJLIG', 'NÄTTER', 'PRÖVA',
  'RÄNTA', 'SKÖLD', 'SPÖKE', 'STÖRA', 'SVÅR', 'TJÄR', 'TÄRNING',
  'VÄRLD', 'VÅNING', 'VÄNTA', 'YRKE', 'ÅLDER'
];

const FILL_LETTERS = 'ABCDEFGHIJKLMNOPRSTUVÅÄÖAEIORSTLN';

@Injectable({ providedIn: 'root' })
export class PuzzleService {

  generatePuzzle(gridSize: number = 10): Puzzle {
    const grid: string[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill('')
    );
    const positions: { [word: string]: WordPosition } = {};

    const eligible = WORD_BANK.filter(w => w.length <= gridSize);
    const shuffled = [...eligible];
    this.shuffle(shuffled);

    const [minWords, maxWords] = WORD_COUNTS[gridSize] ?? [3, 5];
    const targetWords = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    let placed = 0;

    for (const word of shuffled) {
      if (placed >= targetWords) break;
      if (this.tryPlaceWord(grid, word, positions, gridSize)) {
        placed++;
      }
    }

    this.fillEmptyCells(grid, gridSize);

    return { grid, words: Object.keys(positions), positions };
  }

  validate(
    startRow: number, startCol: number, endRow: number, endCol: number,
    positions: { [word: string]: WordPosition }
  ): { found: boolean; word: string | null } {
    for (const [word, pos] of Object.entries(positions)) {
      const forwardMatch =
        startRow === pos.startRow && startCol === pos.startCol &&
        endRow === pos.endRow && endCol === pos.endCol;
      const reverseMatch =
        startRow === pos.endRow && startCol === pos.endCol &&
        endRow === pos.startRow && endCol === pos.startCol;
      if (forwardMatch || reverseMatch) {
        return { found: true, word };
      }
    }
    return { found: false, word: null };
  }

  private tryPlaceWord(grid: string[][], word: string, positions: { [word: string]: WordPosition }, gridSize: number): boolean {
    const dirs = [...DIRECTIONS];
    this.shuffle(dirs);

    const starts: [number, number][] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        starts.push([r, c]);
      }
    }
    this.shuffle(starts);

    for (const [r, c] of starts) {
      for (const [dr, dc] of dirs) {
        if (this.canPlace(grid, word, r, c, dr, dc, gridSize)) {
          this.placeWord(grid, word, r, c, dr, dc);
          positions[word] = {
            startRow: r,
            startCol: c,
            endRow: r + dr * (word.length - 1),
            endCol: c + dc * (word.length - 1)
          };
          return true;
        }
      }
    }
    return false;
  }

  private canPlace(grid: string[][], word: string, row: number, col: number, dRow: number, dCol: number, gridSize: number): boolean {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
  }

  private placeWord(grid: string[][], word: string, row: number, col: number, dRow: number, dCol: number): void {
    for (let i = 0; i < word.length; i++) {
      grid[row + i * dRow][col + i * dCol] = word[i];
    }
  }

  private fillEmptyCells(grid: string[][], gridSize: number): void {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = FILL_LETTERS[Math.floor(Math.random() * FILL_LETTERS.length)];
        }
      }
    }
  }

  private shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
