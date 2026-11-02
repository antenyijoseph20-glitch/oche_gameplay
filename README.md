# 🏝️ Mystery Island Adventure

### A Python Command-Line Text Adventure Game

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Testing](https://img.shields.io/badge/Testing-unittest-green.svg)](https://docs.python.org/3/library/unittest.html)
[![Dependencies](https://img.shields.io/badge/Dependencies-Standard%20Library-orange.svg)]()
[![Status](https://img.shields.io/badge/Project%20Status-Planning-lightgrey.svg)]()

**Mystery Island Adventure** is a deterministic, text-based adventure game developed in Python. The player wakes up stranded on a mysterious island following a violent storm and must explore the island, collect essential objects, solve simple puzzles, manage limited energy and restore a lighthouse beacon to secure a rescue.

The project is designed as an educational software development exercise, emphasizing structured programming, modular architecture, state management, input validation, problem-solving and automated testing.

---

## 1. Project Overview

| Attribute | Description |
|---|---|
| Project name | Mystery Island Adventure |
| Project type | Command-Line Interface (CLI) Game |
| Programming language | Python |
| Minimum Python version | 3.10 |
| Architecture | Modular, function-based architecture |
| Testing framework | Python `unittest` |
| Dependencies | Python standard library only |
| Interface | Interactive terminal |
| Game mode | Single-player |
| Gameplay | Deterministic |
| Initial player | Oche |
| Project status | Planning and requirements definition |

### 1.1 Background

Following a powerful storm, the player wakes up alone on Mystery Island.

The island's lighthouse is no longer functioning, the old bridge provides the only route to the lighthouse, and a rescue boat is expected to approach the island.

However, the rescue boat will only identify the island if its lighthouse beacon is restored.

The player must explore the island, discover useful objects, overcome obstacles and restore the beacon before exhausting their available energy.

### 1.2 Project Purpose

The project has two primary purposes:

**Gameplay purpose**

Provide an enjoyable adventure involving exploration, object collection, puzzles, decision-making and survival.

**Educational purpose**

Demonstrate practical Python programming concepts through a complete but manageable software project.

---

## 2. Project Objectives

The application must satisfy the following functional requirements:

1. Display the game title and instructions.
2. Request the player's name before starting.
3. Provide a readable menu of available actions.
4. Repeat the menu until the player wins, loses or quits.
5. Implement at least five interconnected locations.
6. Track the player's name, location, energy and inventory.
7. Allow the player to collect two useful objects: rope and lantern.
8. Prevent duplicate collection of objects.
9. Implement at least three meaningful gameplay decisions with consequences.
10. Require the rope to cross the old bridge.
11. Require the lantern to restore the lighthouse beacon.
12. Implement a deterministic energy management system.
13. Reject invalid input without crashing or modifying game state.
14. Provide clear victory, defeat and quit messages.
15. Provide an option to replay with a completely new player state.
16. Include automated tests for the game's essential rules.

---

## 3. Technology Stack and Constraints

### 3.1 Technology

| Technology | Purpose |
|---|---|
| Python 3.10+ | Main programming language |
| Python standard library | Core application functionality |
| `unittest` | Automated testing |
| Git | Version control |
| GitHub | Source code hosting and project presentation |
| Terminal | User interaction |

### 3.2 Project Constraints

The initial version must not use:

- Website or web application frameworks.
- Graphical user interfaces.
- Game engines.
- External databases.
- External APIs.
- Artificial intelligence APIs.
- Third-party Python packages.

All gameplay functionality must operate locally in the terminal.

The project must remain executable without an internet connection.

---

## 4. Game World and Locations

The island contains five primary locations.

### 4.1 Island Map

```text
                 MYSTERY ISLAND

                    BEACH
                      |
                      |
                    JUNGLE
                      |
                      |
                     CAVE
                      |
                      |
                  OLD BRIDGE
                      |
                      |
                  LIGHTHOUSE
                      |
                      |
                  RESCUE BOAT

             <--- Backward movement --->
```

Movement is permitted in both directions between directly connected locations.

The player cannot jump between disconnected locations.

### 4.2 Location Descriptions

| Location | Description | Important discovery |
|---|---|---|
| Beach | The player wakes up after the storm. | Starting location |
| Jungle | A dense forest containing an abandoned campsite. | Rope |
| Cave | A dark cave containing abandoned supplies. | Lantern |
| Old Bridge | A damaged bridge connecting the island to the lighthouse. | Rope required for crossing |
| Lighthouse | An abandoned lighthouse overlooking the sea. | Restore the beacon |

### 4.3 Starting Location

Every new game begins at the Beach.

The player must explore the island to discover the two essential objects.

---

## 5. Player State and Data Management

The game will maintain a central player state.

The initial implementation will use a Python dictionary.

### 5.1 Recommended Player State

```python
player = {
    "name": "Oche",
    "location": "Beach",
    "energy": 5,
    "inventory": [],
    "game_over": False,
    "won": False,
    "beacon_lit": False
}
```

### 5.2 State Attributes

| Attribute | Data type | Initial value | Purpose |
|---|---|---|---|
| name | String | Player's name | Identifies the player |
| location | String | Beach | Current position |
| energy | Integer | 5 | Remaining energy |
| inventory | List | Empty list | Stores collected objects |
| game_over | Boolean | False | Indicates whether gameplay has ended |
| won | Boolean | False | Indicates victory |
| beacon_lit | Boolean | False | Indicates whether the lighthouse is restored |

### 5.3 State Management Rules

- Every game begins with five energy points.
- The starting location is always Beach.
- The initial inventory is empty.
- Energy must never become negative.
- A player cannot perform normal gameplay actions after the game ends.
- A new game must create a new player state.
- The inventory list must never be shared between separate game sessions.

---

## 6. Core Gameplay Mechanics

### 6.1 Movement System

Movement is restricted to connected locations.

The valid connections are:

```python
LOCATIONS = {
    "Beach": ["Jungle"],
    "Jungle": ["Beach", "Cave"],
    "Cave": ["Jungle", "Old Bridge"],
    "Old Bridge": ["Cave", "Lighthouse"],
    "Lighthouse": ["Old Bridge"]
}
```

This structure defines the valid destinations from each location.

The game must validate every movement request against this map.

**Movement rules:**

1. The player can only move to an adjacent location.
2. Every successful movement consumes exactly one energy point.
3. An invalid destination does not consume energy.
4. A movement blocked by a puzzle does not consume energy.
5. A successful movement that reduces energy to zero immediately triggers defeat.
6. Energy must never fall below zero.

### 6.2 Collectible Objects

There are two essential collectible objects.

**Object 1: Rope**

- Location: Jungle.
- Purpose: Required to cross the Old Bridge.
- Collection cost: Zero energy points.
- Collection limit: Once per game.

**Object 2: Lantern**

- Location: Cave.
- Purpose: Required to restore the lighthouse beacon.
- Collection cost: Zero energy points.
- Collection limit: Once per game.

**Collection rules:**

- The player must be at the correct location.
- The object must be available.
- An object cannot be collected more than once.
- Attempting to collect an unavailable object must not change the inventory.
- Rejected collection attempts must not consume energy.

### 6.3 Inventory System

The inventory displays objects collected by the player.

Example:

```text
========== PLAYER INVENTORY ==========

1. Rope
2. Lantern

======================================
```

An empty inventory should display an appropriate message.

The inventory must remain consistent with the actual player state.

### 6.4 Bridge Puzzle

The Old Bridge is damaged and cannot be crossed without a rope.

**Without rope:**

- The player cannot move from Old Bridge to Lighthouse.
- The location remains unchanged.
- Energy remains unchanged.
- The game displays an explanation.

**With rope:**

- The player can cross to Lighthouse.
- The successful movement consumes one energy point.

The rope is not consumed after crossing.

### 6.5 Lighthouse Puzzle

The lighthouse beacon is initially dark.

The player must possess the lantern before attempting to restore it.

**Without lantern:**

- The beacon remains dark.
- The action is rejected.
- Energy remains unchanged.
- The player receives an explanatory message.

**With lantern:**

- The beacon can be restored.
- The beacon state changes to `True`.
- The victory condition is evaluated.

The lantern is not consumed.

---

## 7. Meaningful Gameplay Decisions

The game must include at least three meaningful decisions with consequences.

The initial design will include:

**Decision 1: Whether to collect the rope**

The player can choose to collect or ignore the rope in the Jungle.

Ignoring it prevents crossing the Old Bridge later.

**Decision 2: Whether to collect the lantern**

The player can choose to collect or ignore the lantern in the Cave.

Ignoring it prevents restoration of the lighthouse beacon.

**Decision 3: Whether to explore further or conserve energy**

The player must decide whether to continue forward or move backwards to revisit a location.

Unnecessary movement consumes energy and may cause the player to lose before reaching the lighthouse.

These decisions make exploration and resource management important parts of the game.

---

## 8. Energy Management System

Energy represents the player's ability to continue exploring.

The starting energy is five points.

### 8.1 Energy Consumption

| Action | Energy cost |
|---|---:|
| Successful movement | 1 |
| Collect rope | 0 |
| Collect lantern | 0 |
| Inspect location | 0 |
| Check inventory | 0 |
| View island map | 0 |
| Attempt invalid movement | 0 |
| Attempt blocked bridge crossing | 0 |
| Attempt to light beacon without lantern | 0 |
| Successfully restore beacon | 0 |
| Enter invalid menu option | 0 |

### 8.2 Energy Rules

- Energy starts at 5.
- Only successful movement consumes energy.
- Energy decreases exactly once per successful movement.
- Rejected actions do not consume energy.
- Energy must never become negative.
- Reaching zero energy immediately ends the game in defeat.

### 8.3 Energy Example

```text
Starting location: Beach
Starting energy: 5

Beach → Jungle
Energy: 4

Jungle → Cave
Energy: 3

Cave → Old Bridge
Energy: 2

Old Bridge → Lighthouse
Energy: 1

Restore lighthouse beacon.
Energy: 1
```

The player can therefore complete the correct route and win with one energy point remaining.

---

## 9. Victory and Defeat Conditions

### 9.1 Victory Condition

The player wins only when all the following conditions are satisfied:

1. The current location is Lighthouse.
2. The player possesses the Rope.
3. The player possesses the Lantern.
4. The lighthouse beacon has been restored.
5. The player has at least one energy point remaining.

When the beacon is restored, the rescue boat approaches the island.

The application displays a clear victory message.

### 9.2 Defeat Condition

The player loses when a successful movement reduces energy to zero.

The game must:

- Set `game_over` to `True`.
- Set `won` to `False`.
- Prevent further gameplay actions.
- Display a clear defeat message.

### 9.3 Quit Condition

The player may voluntarily quit.

Quitting must end the current session without incorrectly reporting a victory.

The application should distinguish voluntary quitting from energy exhaustion.

### 9.4 Replay Condition

After victory, defeat or quitting, the application should offer a replay option.

Selecting replay must:

- Create a fresh player dictionary.
- Reset energy to five.
- Return the player to Beach.
- Create a new empty inventory.
- Reset the beacon state.
- Reset the victory and game-over flags.

Previous game progress must never carry into the new session.

---

## 10. Command-Line Interface and Menu Design

The game will use a numbered menu.

### 10.1 Main Menu

```text
=====================================
       MYSTERY ISLAND ADVENTURE
=====================================

Welcome, Oche!

Location: Beach
Energy: 5

What would you like to do?

1. Move to another location
2. Explore and collect objects
3. Inspect current location
4. Check inventory
5. View island map
6. Quit game

Enter your choice:
```

### 10.2 Menu Responsibilities

**Move**

Displays available destinations based on the current location.

**Explore and collect**

Allows the player to collect an available object.

**Inspect current location**

Displays information about the current location and possible discoveries.

**Check inventory**

Displays the objects currently held by the player.

**View island map**

Displays the island's location connections.

**Quit game**

Ends the current game session.

### 10.3 Input Validation

All user input must be validated before it reaches the game logic.

The application must:

- Accept uppercase and lowercase commands.
- Remove unnecessary leading and trailing whitespace.
- Reject unsupported menu selections.
- Reject impossible movement destinations.
- Reject unavailable object collection.
- Reject actions that do not apply to the current location.
- Handle empty input.
- Handle unexpected input without crashing.
- Avoid changing player state when an action is rejected.

For example:

```text
Input: " EXIT "
Normalized input: "exit"
```

The application should recognize `exit` and `quit` as appropriate quit commands, regardless of surrounding whitespace or letter case.

Invalid commands must never consume energy.

---

## 11. Software Architecture

The project will use a modular, function-based architecture.

### 11.1 Proposed Project Structure

```text
mystery-island-adventure/
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

### 11.2 Module Responsibilities

#### main.py — Application Entry Point

Responsible for:

- Starting the application.
- Displaying the title and instructions.
- Collecting the player's name.
- Running the interactive game loop.
- Displaying menus.
- Collecting user input.
- Displaying game results.
- Handling replay.

The main module must not contain the core game rules.

#### game.py — Core Game Engine

Responsible for:

- Creating new player states.
- Defining location connections.
- Defining collectible objects.
- Validating game actions.
- Applying valid actions.
- Managing inventory.
- Managing energy.
- Evaluating victory and defeat conditions.

The game engine must not depend on terminal input or output.

#### tests/test_game.py — Automated Testing

Responsible for:

- Testing initial game state.
- Testing movement.
- Testing invalid actions.
- Testing energy consumption.
- Testing inventory management.
- Testing puzzle requirements.
- Testing victory and defeat.
- Testing state isolation between games.

#### docs/GAME_DESIGN.md

Documents:

- Story and objectives.
- Island locations.
- Game rules.
- Player decisions.
- Inventory requirements.
- Energy system.
- Victory and defeat conditions.

#### docs/ARCHITECTURE.md

Documents:

- Project architecture.
- Module responsibilities.
- Game state representation.
- Function responsibilities.
- Data flow.
- Design decisions.

#### docs/TESTING.md

Documents:

- Testing strategy.
- Acceptance criteria.
- Test cases.
- Test execution instructions.
- Expected results.

#### CONTRIBUTING.md

Defines development guidelines, coding standards and the process for making changes.

#### requirements.txt

The application uses no third-party dependencies. Python's standard library provides all required functionality.

---

## 12. Engineering and Coding Standards

The implementation must follow established Python development practices.

### 12.1 Coding Style

- Follow PEP 8 naming and formatting conventions.
- Use descriptive variable and function names.
- Avoid unnecessary abbreviations.
- Keep functions focused on one responsibility.
- Use constants for fixed game rules.
- Avoid unnecessary global mutable variables.
- Use type hints for important function signatures.
- Add meaningful docstrings to public functions.
- Avoid unnecessary code duplication.

### 12.2 Separation of Concerns

Terminal interaction and game logic must remain separate.

The game engine must be testable without requiring a person to type into the terminal.

### 12.3 Deterministic Behaviour

The same initial player state and the same action must always produce the same result.

The game must not rely on:

- Random events.
- External services.
- Internet availability.
- Unpredictable energy consumption.
- External databases.

### 12.4 Error Handling

Unexpected input must not crash the application.

Invalid actions must be rejected safely without corrupting the game state.

### 12.5 Maintainability

The implementation should be easy to understand, test, modify and extend.

Unnecessary abstractions and premature complexity should be avoided.

---

## 13. Development Methodology and Checkpoints

Development will follow five controlled checkpoints.

No checkpoint should be considered complete until its success evidence has been demonstrated.

### Checkpoint A — Single Working Room

**Objective:** Establish the first functional version of the game.

Implementation requirements:

- Display the game title.
- Display instructions.
- Ask for the player's name.
- Display the Beach scene.
- Show available choices.
- Allow the player to quit.
- Reject invalid input without crashing.

**Success evidence:**

- The program starts successfully.
- The Beach scene displays correctly.
- Menu choices are readable.
- Invalid input does not crash the program.
- The quit option works.

**STOP & EXPLAIN**

Which loop repeats the menu, and why does the game need that loop?

### Checkpoint B — Movement and Location Management

**Objective:** Introduce multiple connected locations.

Implementation requirements:

- Add Jungle and Cave.
- Introduce the location dictionary.
- Implement valid movement.
- Support backward movement.
- Reject impossible destinations.
- Maintain the player's current location.

**Success evidence:**

- Beach → Jungle works.
- Jungle → Cave works.
- Cave → Jungle works.
- Invalid movement leaves the location unchanged.
- Invalid movement consumes no energy.

**STOP & EXPLAIN**

Why is game state stored outside the input handler?

### Checkpoint C — Inventory and Simple Puzzles

**Objective:** Introduce collectible objects and inventory requirements.

Implementation requirements:

- Add rope to the Jungle.
- Add lantern to the Cave.
- Implement object collection.
- Display inventory.
- Prevent duplicate collection.
- Require rope for the bridge.
- Require lantern for the lighthouse beacon.

**Success evidence:**

- Rope can be collected once.
- Lantern can be collected once.
- Duplicate collection is rejected.
- The bridge cannot be crossed without rope.
- The lighthouse cannot be restored without lantern.

**STOP & EXPLAIN**

What does the Python `in` operator mean when checking whether an object exists in a list?

### Checkpoint D — Energy and Game Outcomes

**Objective:** Complete the gameplay mechanics.

Implementation requirements:

- Introduce the energy system.
- Deduct one energy point per successful movement.
- Prevent negative energy.
- Implement victory.
- Implement defeat.
- Implement quitting.
- Implement replay.
- Ensure replay creates a completely new state.

**Success evidence:**

- Energy decreases exactly once per legal movement.
- Invalid actions consume no energy.
- Energy exhaustion triggers defeat.
- The correct route permits victory.
- Replay resets location, energy and inventory.

**STOP & EXPLAIN**

Why should replay create a new inventory rather than reuse the old list?

### Checkpoint E — Refactoring and Automated Testing

**Objective:** Prepare the application for professional presentation.

Implementation requirements:

- Separate input/output from game decisions.
- Refactor duplicated code.
- Add type hints and docstrings.
- Write automated tests.
- Verify the acceptance criteria.
- Complete project documentation.
- Review code quality.

**Success evidence:**

- All critical game rules have automated tests.
- At least eight meaningful tests pass.
- All ten acceptance tests are targeted.
- The game can be completed successfully.
- The README matches the implemented application.
- No known critical gameplay defects remain.

**STOP & EXPLAIN**

Why should game logic be testable without requiring a person to type into the terminal?

---

## 14. Required Acceptance Tests

The completed game must satisfy the following ten acceptance tests.

| ID | Test description | Expected result |
|---|---|---|
| T1 | Create a new game. | Beach, 5 energy and empty inventory. |
| T2 | Submit an invalid command. | Player state remains unchanged. |
| T3 | Perform legal movement. | Location changes and energy decreases exactly once. |
| T4 | Attempt wrong-direction movement. | Movement rejected without energy cost. |
| T5 | Collect rope. | Rope is added only once. |
| T6 | Cross bridge without rope. | Crossing is rejected. |
| T7 | Light lighthouse without lantern. | Beacon remains dark. |
| T8 | Meet all victory requirements. | Game ends in victory. |
| T9 | Exhaust available energy. | Game ends in defeat. |
| T10 | Start replay. | Energy, location and inventory reset. |

### 14.1 Testing Framework

The project will use Python's built-in `unittest` framework.

No external testing package is required.

### 14.2 Minimum Testing Requirement

At least eight meaningful automated tests must be implemented.

The target is to cover all ten acceptance tests, including the critical inventory, movement, energy and victory conditions.

### 14.3 Test Execution

From the project root, run:

```bash
python3 -m unittest discover -s tests -v
```

The expected result is that all implemented tests pass.

---

## 15. Bug-Hunter and Edge-Case Requirements

The following questions must be addressed during implementation and testing.

| Scenario | Required behaviour |
|---|---|
| Player enters ` EXIT ` instead of `exit`. | Recognize the normalized quit command. |
| Energy reaches zero. | Trigger defeat immediately. |
| A movement would reduce energy below zero. | Prevent the movement. |
| Player collects the same object twice. | Reject duplicate collection. |
| Player tries to win without visiting Lighthouse. | Victory must be impossible. |
| Player replays after winning. | Previous inventory must not carry over. |
| Player moves after `game_over=True`. | Reject the action. |
| Player attempts to cross the bridge without rope. | Reject the crossing. |
| Player attempts to light the beacon without lantern. | Reject the action. |
| Player enters an unsupported menu option. | Display an error and repeat the menu. |

Additional edge cases:

- Empty player name.
- Whitespace-only player name.
- Unexpected menu characters.
- Invalid movement direction.
- Repeated inspection.
- Repeated inventory checks.
- Repeated beacon-lighting attempts.
- Attempting to collect an object from the wrong location.

---

## 16. Example Successful Gameplay

The following is the intended successful gameplay sequence.

```text
========================================
       MYSTERY ISLAND ADVENTURE
========================================

After a terrible storm, you wake up
on a mysterious island.

The lighthouse is dark.
The old bridge is damaged.
A rescue boat may arrive if you
restore the lighthouse beacon.

Enter your name: Oche

Welcome, Oche!

----------------------------------------
LOCATION: BEACH
ENERGY: 5
INVENTORY: Empty
----------------------------------------

You are standing on a quiet beach.
The storm has left the island damaged.

Available destination:
1. Jungle

> Move to Jungle

You enter the dense Jungle.
You discover an abandoned campsite.

ENERGY: 4

> Collect Rope

You collected the Rope!

> Move to Cave

You enter a dark Cave.

ENERGY: 3

> Collect Lantern

You collected the Lantern!

> Move to Old Bridge

You reach the damaged Old Bridge.

ENERGY: 2

> Move to Lighthouse

You use the Rope to cross the bridge.

You arrive at the Lighthouse.

ENERGY: 1

> Light Beacon

You use the Lantern to restore the beacon.

The lighthouse begins to shine!

A rescue boat spots the signal
and approaches the island.

========================================
          ADVENTURE COMPLETE
========================================

CONGRATULATIONS, OCHE!

YOU HAVE ESCAPED MYSTERY ISLAND!

========================================

Would you like to play again?
1. Yes
2. No
```

---

## 17. Installation and Execution

### 17.1 Prerequisites

- Python 3.10 or later.
- A terminal or command-line environment.
- Git (recommended for development).

Check the installed Python version:

```bash
python3 --version
```

### 17.2 Clone the Repository

After the project has been published to GitHub:

```bash
git clone <repository-url>
```

Enter the project directory:

```bash
cd mystery-island-adventure
```

### 17.3 Run the Application

```bash
python3 main.py
```

### 17.4 Run Automated Tests

```bash
python3 -m unittest discover -s tests -v
```

The game does not require a virtual environment or third-party package installation.

---

## 18. Development Workflow and Version Control

Git will be used to maintain a history of development.

The project will follow incremental development rather than introducing all functionality at once.

### Development principles

1. Inspect the existing project before making changes.
2. Understand the requirement before implementing it.
3. Make focused changes.
4. Run the application after meaningful changes.
5. Run relevant automated tests.
6. Review errors and correct their underlying causes.
7. Preserve working functionality.
8. Commit completed checkpoints with meaningful messages.

### Suggested Commit Convention

```text
docs: define project requirements and architecture

feat: implement initial beach scene

feat: add location movement

feat: implement collectible inventory

feat: add energy and game outcomes

test: add automated game logic tests

docs: complete project documentation
```

Commits must accurately describe the work actually completed.

---

## 19. Known Limitations — Initial Version

The first release will intentionally remain small.

The following features are outside the initial scope:

- Graphics and animations.
- Sound effects and background music.
- Multiplayer functionality.
- Online leaderboards.
- Persistent player accounts.
- Saved game sessions.
- Randomized island events.
- Additional islands.
- External services.

These features may be considered in future versions after the core application is stable.

---

## 20. Future Improvements

Possible future enhancements include:

- Additional island locations.
- More collectible objects.
- Additional puzzles.
- More than one successful escape route.
- A scoring system.
- Difficulty levels.
- Persistent save and load functionality.
- Improved terminal presentation.
- Optional sound effects.

These improvements must not compromise the initial game's reliability or deterministic behaviour.

---

## 21. Definition of Done

Mystery Island Adventure will be considered complete when:

- All five locations are implemented.
- Movement restrictions work correctly.
- Rope and lantern collection work correctly.
- Duplicate collection is prevented.
- Bridge and lighthouse puzzles work correctly.
- Energy consumption is deterministic.
- Energy never becomes negative.
- Victory and defeat conditions work correctly.
- Invalid input is handled safely.
- Replay creates a fresh player state.
- At least eight meaningful automated tests pass.
- All ten acceptance tests are addressed.
- The successful adventure can be completed from beginning to end.
- Project documentation reflects the actual implementation.
- The code is readable, modular and maintainable.

---

## 22. Educational Learning Outcomes

By completing this project, the developer should understand and demonstrate practical knowledge of:

| Python concept | Application in this project |
|---|---|
| Variables | Tracking player information |
| Dictionaries | Representing game state and location maps |
| Lists | Managing inventory |
| Functions | Organizing game operations |
| Conditional statements | Validating actions and outcomes |
| Loops | Repeating the game menu |
| Membership operators | Checking inventory contents |
| Input validation | Handling unexpected commands |
| State management | Tracking game progress |
| Modular programming | Separating application responsibilities |
| Unit testing | Verifying game rules |
| Git | Managing development history |

### Final Educational Objective

The developer should be able to explain how the application works, why each major design decision was made, how game state changes, how errors are handled and how automated tests verify correctness.

The objective is not simply to produce a working game but to understand the programming principles behind it.

---

## 23. Project Development Principle

**Understand → Design → Implement → Test → Explain → Improve.**

Every development checkpoint must produce working evidence before the next checkpoint begins.

The project must remain simple enough for a beginner to understand while following professional software development practices.

**Mystery Island Adventure — Every decision matters. Every move counts. Escape before your energy runs out!**