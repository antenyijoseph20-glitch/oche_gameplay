# Mystery Island Adventure — Software Architecture

## 1. Document Purpose

This document describes the proposed software structure of Mystery Island Adventure.

It defines module responsibilities, the flow of information, player-state management and the separation between user interaction, game rules and automated testing.

The architecture is intentionally simple and function-based so that the application remains understandable, testable and maintainable.

## 2. Architecture Overview

The application will use three main components:

1. `main.py` — terminal interface and application control.
2. `game.py` — game rules and player-state management.
3. `tests/test_game.py` — automated verification of game behaviour.

Each component has a specific responsibility.

### 2.1 Component Relationship

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

             +------------------+
             | tests/test_game.py|
             |                  |
             | Tests game.py    |
             | independently    |
             +------------------+
```

The terminal interface communicates with the game engine. Automated tests exercise the game engine without requiring a player to interact with the terminal.

## 3. Project Directory Structure

The planned project structure is:

```text
oche_gameplay/
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── .gitignore
├── requirements.txt
│
├── main.py
├── game.py
│
├── docs/
│   ├── GAME_DESIGN.md
│   ├── ARCHITECTURE.md
│   └── TESTING.md
│
└── tests/
    ├── __init__.py
    └── test_game.py
```

This structure separates application code, documentation and automated tests.

## 4. Module Responsibilities

### 4.1 `main.py` — Application Entry Point

The main module controls the interactive application.

Its responsibilities include:

- Displaying the game title.
- Showing instructions.
- Requesting the player's name.
- Starting a new game.
- Displaying the current location.
- Displaying player information.
- Presenting available menu options.
- Receiving and normalizing user input.
- Passing requested actions to the game engine.
- Displaying the results returned by the game engine.
- Detecting when a session ends.
- Offering the replay option.

The main module must not independently decide whether a game action is valid.

For example, it must not implement its own separate bridge-crossing rule. It should request the action from `game.py` and display the result.

### 4.2 `game.py` — Core Game Engine

The game engine contains the rules that control the adventure.

Its responsibilities include:

- Defining the island's location connections.
- Creating a new player state.
- Tracking the current location.
- Managing energy.
- Managing the inventory.
- Validating movement.
- Validating object collection.
- Enforcing bridge requirements.
- Enforcing lighthouse requirements.
- Updating the beacon state.
- Evaluating victory and defeat.
- Rejecting normal gameplay actions after the session ends.

The game engine must not depend on terminal `input()` or `print()` calls.

This allows its rules to be tested without running an interactive game.

### 4.3 `tests/test_game.py` — Automated Testing

The test module verifies that the game engine follows the documented rules.

Its responsibilities include testing:

- Initial player state.
- Valid movement.
- Invalid movement.
- Energy consumption.
- Object collection.
- Duplicate collection prevention.
- Bridge restrictions.
- Lighthouse restrictions.
- Victory conditions.
- Defeat conditions.
- Replay state isolation.
- Rejection of actions after game termination.

Tests should verify both successful and unsuccessful actions.

## 5. Player State Representation

The game will use a Python dictionary to represent the current player.

Proposed initial state:

```python
player = {
    "name": "Oche",
    "location": "Beach",
    "energy": 5,
    "inventory": [],
    "beacon_lit": False,
    "game_over": False,
    "won": False,
}
```

### 5.1 State Attributes

| Attribute | Data type | Purpose |
|---|---|---|
| `name` | String | Player's name |
| `location` | String | Current island location |
| `energy` | Integer | Remaining energy |
| `inventory` | List | Collected objects |
| `beacon_lit` | Boolean | Lighthouse beacon condition |
| `game_over` | Boolean | Whether the session has ended |
| `won` | Boolean | Whether the player has won |

### 5.2 State Management Rules

- A new game creates a new player dictionary.
- The initial location is Beach.
- Initial energy is five.
- Initial inventory is empty.
- The beacon initially remains dark.
- Victory and game-over flags initially remain false.
- Inventory must not be shared between separate game sessions.
- Energy must never become negative.
- A completed or defeated session must reject further normal gameplay actions.

The game engine is responsible for maintaining these rules.

## 6. Proposed Game Engine Functions

The following functions describe the intended interface of `game.py`.

Their exact implementation will be developed and tested incrementally.

### 6.1 `new_game(name)`

Purpose:

Creates and returns a fresh player state.

Expected behaviour:

- Stores the player's name.
- Sets the location to Beach.
- Sets energy to five.
- Creates a new empty inventory.
- Sets the beacon to dark.
- Resets the game-over and victory flags.

### 6.2 `available_actions(player)`

Purpose:

Determines which actions are appropriate for the player's current state.

Expected behaviour:

- Considers the player's current location.
- Considers connected destinations.
- Considers collectible objects.
- Considers puzzle requirements.
- Does not offer normal gameplay actions after the game ends.

### 6.3 `apply_action(player, action)`

Purpose:

Validates and applies a requested gameplay action.

Expected behaviour:

1. Rejects normal gameplay actions if the session has ended.
2. Validates the requested action.
3. Checks movement restrictions and puzzle requirements.
4. Updates the player state only when the action is permitted.
5. Applies the correct energy cost.
6. Evaluates defeat or victory when appropriate.
7. Returns a result that the terminal interface can display.

Rejected actions must not consume energy or cause unintended state changes.

The function will be implemented with a clearly defined return format so that `main.py` can handle success and failure consistently.

### 6.4 `is_win(player)`

Purpose:

Checks whether the player satisfies every victory requirement.

The function must verify:

- Current location is Lighthouse.
- Rope is in the inventory.
- Lantern is in the inventory.
- Beacon is lit.
- Energy is greater than zero.

### 6.5 `is_game_over(player)`

Purpose:

Checks whether the current session has ended.

It must distinguish the session's overall completion state from the specific victory condition.

The exact function interface will be finalized during implementation.

## 7. Data Flow

The application follows a predictable interaction sequence.

### 7.1 Starting a Game

1. `main.py` displays the title and instructions.
2. The player enters a name.
3. `main.py` requests a new state from `game.new_game(name)`.
4. The game engine creates the initial player dictionary.
5. The main module begins the game loop.

### 7.2 Processing a Player Action

1. The main module displays available choices.
2. The player enters a command.
3. The main module normalizes the input.
4. The command is translated into a game action.
5. The main module passes the action to `game.apply_action()`.
6. The game engine validates the action.
7. The game engine updates the state when permitted.
8. The game engine returns an action result.
9. The main module displays the result.
10. The game loop continues if the session remains active.

### 7.3 Ending a Game

1. The game engine detects victory or defeat.
2. The game state is updated.
3. The main module displays the appropriate outcome.
4. The application offers replay or exit.
5. If replay is selected, a new game state is created.

## 8. Separation of Concerns

The architecture follows separation of concerns.

This means that different parts of the application handle different responsibilities.

| Responsibility | Correct module |
|---|---|
| Reading terminal input | `main.py` |
| Printing messages | `main.py` |
| Displaying menus | `main.py` |
| Validating movement | `game.py` |
| Checking inventory | `game.py` |
| Applying energy costs | `game.py` |
| Checking victory | `game.py` |
| Testing game rules | `tests/test_game.py` |

This separation prevents the same game rule from being implemented independently in multiple places.

It also makes the game engine easier to test and improve.

## 9. Input and Error Handling

User input is not automatically valid.

The main module must:

- Remove unnecessary leading and trailing whitespace.
- Normalize commands where appropriate.
- Handle unsupported menu selections.
- Avoid crashing when unexpected text is entered.
- Avoid modifying game state for invalid commands.

The game engine must independently validate requested actions.

The interface must not be trusted to enforce essential game rules by itself.

For example, even if the interface accidentally offers an invalid movement option, the game engine must still reject that movement.

## 10. Deterministic Behaviour

The game engine must produce predictable results.

The same initial state and the same action must produce the same outcome.

The initial version will not use random events, external services or unpredictable game mechanics.

This makes it easier to reproduce bugs and verify expected behaviour through automated tests.

## 11. Testing Architecture

Automated tests will use Python's built-in `unittest` framework.

Tests will import and exercise functions from `game.py`.

They will not need to simulate terminal input for core game-rule tests.

The main test command is:

```bash
python3 -m unittest discover -s tests -v
```

The detailed test cases and acceptance criteria are maintained in `docs/TESTING.md` and summarized in `README.md`.

## 12. Technology and Dependencies

The application uses:

- Python 3.10 or later.
- Python standard library.
- `unittest` for automated testing.
- Git for version control.

No third-party Python packages are required.

The application must run locally in a terminal without an internet connection.

## 13. Architecture Completion Criteria

The architecture is ready for implementation when:

- The responsibilities of each module are clear.
- Terminal interaction is separated from game rules.
- Player state has a defined structure.
- The game engine has a defined action-processing responsibility.
- Victory and defeat checks are clearly separated.
- The test module can verify game logic independently.
- The proposed project structure is consistent with the README.

**Architecture principle: Keep the interface responsible for interaction, the game engine responsible for rules, and automated tests responsible for verification.**