# Testing Strategy and Acceptance Criteria

## 1. Document Purpose

This document describes the testing strategy for Oche: Mystery Island.

Its purpose is to ensure that the game's rules, player state, command-line interface, and expected gameplay behavior work reliably.

The project includes two playable versions:

- A Python command-line version.
- A browser-based version built with HTML, CSS, and JavaScript.

The Python implementation is tested using Python's built-in `unittest` framework. Browser behavior is checked separately in a web browser.

## 2. Testing Objectives

Testing aims to verify that:

1. A new game starts with the correct player state.
2. The player can move only through valid connections.
3. Successful movement deducts exactly one energy point.
4. Invalid actions do not change the player's state.
5. Collectible objects can only be collected in their correct locations.
6. Objects cannot be collected repeatedly.
7. The rope is required to cross the Old Bridge.
8. The lantern is required to light the lighthouse beacon.
9. Victory occurs only when all victory conditions are satisfied.
10. The player loses when a successful move reduces energy to zero.
11. Energy never becomes negative.
12. Replay creates a fresh game state.
13. The command-line interface handles invalid input safely.
14. The browser version presents the expected game interactions and victory sequence.

## 3. Testing Framework and Test Files

The Python implementation uses the standard-library `unittest` framework.

The automated tests are organised as follows:

| File | Responsibility |
|---|---|
| `game.py` | Python game rules and state management |
| `main.py` | Command-line application |
| `tests/test_game.py` | Tests for game rules and state management |
| `tests/test_main.py` | Tests for command-line application behavior |

The game logic is separated from terminal input and output so that its rules can be tested independently.

No third-party Python testing package is required.

**Important:** The Python test suite does not directly test the JavaScript browser implementation. Browser behavior must be verified separately.

## 4. Test Categories

### 4.1 Unit Testing

Unit tests examine individual functions and game rules, including:

- Creating a new player.
- Validating player names.
- Moving between connected locations.
- Collecting objects.
- Checking inventory.
- Validating bridge access.
- Lighting the beacon.
- Checking victory and defeat conditions.
- Describing the island map.

### 4.2 State Validation Testing

Tests verify that player information changes correctly.

Important state attributes include:

- Player name.
- Current location.
- Energy.
- Inventory.
- Beacon status.
- Game-over status.
- Victory status.

Rejected actions must not accidentally modify unrelated state.

### 4.3 Input Validation Testing

The command-line application is tested against situations such as:

- Empty or invalid player names.
- Whitespace around commands.
- Uppercase and lowercase input.
- Unknown menu choices.
- Invalid movement destinations.
- Repeated invalid input.
- Quit and interruption handling.

Invalid input should be handled safely without corrupting the game state.

### 4.4 Gameplay Testing

Gameplay tests verify that the player can complete important sequences.

The successful route includes:

1. Starting at the Beach.
2. Travelling to the Jungle and collecting the rope.
3. Travelling to the Cave and collecting the lantern.
4. Reaching the Old Bridge.
5. Crossing to the Lighthouse.
6. Lighting the beacon.
7. Completing the victory conditions.

Losing sequences are also tested to confirm that reaching zero energy ends the game.

### 4.5 Browser Testing

The browser version is implemented separately in:

- `web/index.html`
- `web/styles.css`
- `web/game.js`

Browser verification should include:

- Starting a game with a valid player name.
- Checking the displayed location, energy, and inventory.
- Moving between valid locations.
- Confirming that invalid actions are rejected.
- Collecting the rope and lantern.
- Checking bridge and beacon requirements.
- Confirming victory and defeat behavior.
- Checking the victory animation, including the lighthouse beacon and rescue boat.
- Checking layout behavior on desktop and mobile screens.
- Checking reduced-motion behavior.

These checks are separate from the Python `unittest` results.

## 5. Required Acceptance Criteria

The following criteria define the expected behavior of the game.

| Test ID | Scenario | Expected Result |
|---|---|---|
| T1 | Start a new game | Beach, 5 energy, empty inventory |
| T2 | Submit an invalid action | Player state remains unchanged |
| T3 | Make a valid move | Location changes and energy decreases by 1 |
| T4 | Attempt an unconnected move | Movement is rejected without energy loss |
| T5 | Collect the rope | Rope enters inventory only once |
| T6 | Cross the bridge without rope | Crossing is rejected without energy loss |
| T7 | Light the beacon without lantern | Beacon remains unlit |
| T8 | Complete the winning sequence | Beacon lights and player wins |
| T9 | Make a valid move with 1 energy | Energy becomes 0 and player loses |
| T10 | Start a replay | Fresh state with 5 energy and empty inventory |

These criteria describe the expected game behavior and guide both automated and manual testing.

## 6. Energy Boundary Tests

Energy is one of the most important game rules.

The following conditions must hold:

- Initial energy is exactly 5.
- A successful move costs exactly 1 energy.
- A rejected move costs 0 energy.
- Collecting objects costs 0 energy.
- Inspecting a location costs 0 energy.
- Viewing inventory costs 0 energy.
- Viewing the island map costs 0 energy.
- Lighting the beacon costs 0 energy.
- Energy must never become negative.
- A successful move that reduces energy to zero immediately causes defeat.

Tests must verify energy values before and after relevant actions.

## 7. Inventory Tests

The game contains two required objects.

**Rope**

- Available in the Jungle.
- Can only be collected in the Jungle.
- Cannot be collected more than once.
- Required to cross from the Old Bridge to the Lighthouse.

**Lantern**

- Available in the Cave.
- Can only be collected in the Cave.
- Cannot be collected more than once.
- Required to light the lighthouse beacon.

Collecting an object does not deduct energy. Neither object is consumed when used.

## 8. Victory, Defeat, and Quit Tests

### 8.1 Victory

The player wins only when all these conditions are satisfied:

- The player is at the Lighthouse.
- The player has the rope.
- The player has the lantern.
- The beacon is lit.
- The player has more than zero energy.

Missing any required condition must prevent victory.

### 8.2 Defeat

The player loses immediately when a successful move reduces energy to zero.

After defeat, normal gameplay actions must no longer be accepted.

### 8.3 Quit

Quitting is different from losing.

A player who chooses to exit must receive an appropriate exit message rather than a defeat message.

## 9. Replay Testing

Replay testing verifies that a new game does not inherit the previous game's state.

A replay must reset:

- Location to Beach.
- Energy to 5.
- Inventory to an empty list.
- Beacon status to unlit.
- Game-over status to false.
- Victory status to false.

The new game must use a fresh inventory list rather than sharing the previous game's list.

## 10. Edge Cases and Bug-Hunter Checks

The following situations are important during testing:

1. Player enters an empty name.
2. Player enters a name containing only spaces.
3. Player enters a command with surrounding spaces.
4. Player enters a command using different letter cases.
5. Player repeatedly attempts invalid movement.
6. Player tries to collect an object from the wrong location.
7. Player attempts to collect an object more than once.
8. Player tries to cross the bridge without rope.
9. Player tries to light the beacon without lantern.
10. Player tries to win before reaching the Lighthouse.
11. Player attempts another action after the game ends.
12. Player attempts a move when only one energy point remains.
13. Player attempts an action that could make energy negative.
14. Player replays after winning or losing.
15. Player chooses to quit.

## 11. Running the Automated Tests

From the project root, execute:

```bash
python3 -m unittest discover -s tests -v
```

The command discovers and executes the Python test files in the `tests` directory.

The `-v` option displays individual test names and their results.

The latest verified test run completed successfully with **56 passing tests**.

## 12. Testing Standards

The project follows these testing principles:

- Tests must be repeatable.
- Tests must not depend on internet access.
- Tests must not depend on random events.
- Automated tests must not require a real player's keyboard input.
- Tests must verify expected results, not merely successful execution.
- Each test should focus on a clear behavior.
- Failed tests must be investigated before proceeding.
- Existing passing tests must continue passing after changes.
- Browser checks must be distinguished from Python automated test results.

## 13. Testing Completion Criteria

Testing is considered satisfactory when:

1. Required game rules are verified.
2. All automated Python tests pass.
3. Invalid actions preserve the player's state.
4. Energy rules are enforced correctly.
5. Inventory and puzzle restrictions work correctly.
6. Victory, defeat, quit, and replay behave correctly.
7. A complete successful gameplay sequence works.
8. A complete losing gameplay sequence works.
9. The browser version has been checked independently.
10. No known critical gameplay defect remains.

## 14. Final Testing Principle

A game is not complete simply because it starts and displays a menu.

It is complete when its rules behave correctly, unexpected input is handled safely, and players can experience the intended winning and losing outcomes reliably.