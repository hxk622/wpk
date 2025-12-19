# Texas Hold'em Poker Shared Package

This is a shared package for the Texas Hold'em poker game system, containing common types, utilities, and constants used by both frontend and backend applications.

## Purpose

The shared package serves as a central repository for:
- Common TypeScript type definitions
- Utility functions shared between frontend and backend
- Constants and enums used across the system
- Game rules and logic that both frontend and backend need to reference

## Features

### Type Definitions
- Game room types
- User types
- Game session types
- Card and hand types
- AI analysis types

### Utility Functions
- Card deck creation and shuffling
- Hand strength calculation
- Money formatting
- Game state validation
- Helper functions for game logic

### Constants and Enums
- Card suits and ranks
- Game phases
- Player actions
- AI analysis constants

## Technology Stack

- **Language**: TypeScript
- **Build Tool**: TypeScript Compiler (tsc)
- **Dependencies**: uuid for generating unique IDs

## Project Structure

```
src/
├── types/          # TypeScript type definitions
│   ├── card.ts     # Card-related types
│   ├── game.ts     # Game-related types
│   ├── room.ts     # Room-related types
│   └── user.ts     # User-related types
├── utils/          # Utility functions
│   ├── cardUtils.ts   # Card deck and shuffling
│   ├── gameUtils.ts   # Game logic helpers
│   └── moneyUtils.ts  # Money formatting
└── index.ts        # Main export file
```

## Installation

```bash
npm install @poker/shared
```

## Usage

### Importing Types

```typescript
import { GameRoom, User, Card } from '@poker/shared';
```

### Using Utility Functions

```typescript
import { createDeck, shuffleDeck, formatMoney } from '@poker/shared';

// Create a new deck of cards
const deck = createDeck();

// Shuffle the deck
const shuffledDeck = shuffleDeck(deck);

// Format money for display
const formattedMoney = formatMoney(1000); // $1000.00
```

### Using Constants

```typescript
import { Suit, Rank, GamePhase, PlayerAction } from '@poker/shared';

// Check card suit
if (card.suit === Suit.HEARTS) {
  // Handle hearts
}

// Check game phase
if (gamePhase === GamePhase.FLOP) {
  // Handle flop phase
}
```

## Development

### Build the Package

```bash
npm run build
```

### Watch for Changes

```bash
npm run dev
```

### Run Tests

```bash
npm run test
```

## Versioning

This package follows semantic versioning:
- MAJOR version when breaking changes are made
- MINOR version when new functionality is added
- PATCH version when bug fixes are made

## License

MIT License

Copyright (c) 2024 Texas Hold'em Poker Game System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
