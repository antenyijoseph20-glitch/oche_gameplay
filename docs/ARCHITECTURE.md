# Oche: Mystery Island — Software Architecture

## 1. Document Purpose

This document describes the software architecture of Oche: Mystery Island.

It explains the project structure, module responsibilities, game-state management, application flow, and separation between user interaction, game rules, and automated testing.

The project provides two independent playable implementations:

1. A Python command-line application.
2. A browser-based application built with HTML, CSS, and JavaScript.

Each implementation manages its own game state and gameplay logic.

The architecture is intentionally simple and modular so that the project remains understandable, testable, and maintainable.

## 2. Architecture Overview

The project contains two separate application paths.

### 2.1 Command-Line Architecture

The Python command-line application uses:

- `main.py` — terminal interface and application control.
- `game.py` — Python game rules and player-state management.
- `tests/` — automated tests for the Python implementation.

Component relationship:

```text
                 PLAYER
                    |
                    v
             +-------------+
             |   main.py   |
             |             |
             | User input  |
             | Menus       |
             | Game loop   |
             | Display     |
             +-------------+
                    |
             Player actions
                    |
                    v
             +-------------+
             |   game.py   |
             |             |
             | Game rules  |
             | Validation  |
             | State       |
             | Energy      |
             | Inventory   |
             +-------------+
                    |
              Game results
                    |
                    v
             +-------------+
             |   main.py   |
             |             |
             | Show result |
             +-------------+

                    |
                    v
             +------------------+
             |      tests/      |
             |                  |
             | test_game.py     |
             | test_main.py     |
             +------------------+
```

The terminal interface communicates with the Python game engine. Automated tests verify the Python game rules and command-line behavior.

### 2.2 Browser Architecture

The browser application uses:

- `web/index.html` — page structure and game interface.
- `web/styles.css` — visual presentation, layout, and animations.
- `web/game.js` — browser game logic, player state, and interactions.

Component relationship:

```text
                 PLAYER
                    |
                    v
          +--------------------+
          |    Browser UI      |
          |                    |
          |   index.html       |
          |   styles.css       |
          +--------------------+
                    |
             User interactions
                    |
                    v
          +--------------------+
          |      game.js       |
          |                    |
          | Game state         |
          | Movement rules     |
          | Inventory          |
          | Energy             |
          | Beacon and victory |
          +--------------------+
                    |
                    v
          +--------------------+
          |   Updated Browser  |
          |       Display      |
          +--------------------+
```

The JavaScript implementation manages its own browser game state and gameplay rules. It is not connected to the Python `game.py` engine.

### 2.3 Important Architecture Distinction

The command-line and browser versions implement the same game concept, but they use separate programming languages and separate game-state implementations.

The Python automated tests do not directly test the JavaScript browser implementation.

This distinction must remain clear when documenting, maintaining, and testing the project.

## 3. Project Directory Structure

The current project structure is:

```text
oche_gameplay/
│
├── README.md
├── .gitignore