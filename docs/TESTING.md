# Testing Strategy and Acceptance Criteria

## 1. Document Purpose

This document defines how the Oche Gameplay project will be tested.

Its purpose is to ensure that the game behaves according to the requirements in `README.md` and `GAME_DESIGN.md`.

Testing will begin with individual game rules and progress to complete gameplay scenarios.

The project will use Python's built-in `unittest` framework. No third-party testing package is required.

## 2. Testing Objectives

Testing must confirm that:

1. A new game starts with the correct player state.
2. The player can move only through valid connections.
3. Successful movement deducts exactly one energy point.
4. Invalid actions do not change the player's state.
5. Collectible objects can only be collected in the correct locations.
6. Objects cannot be collected repeatedly.
7. The rope is required to cross the Old Bridge.
8. The lantern is required to light the lighthouse beacon.
9. The player wins only after satisfying all victory conditions.
10. The player loses when a valid move reduces energy to zero.
11. Energy never becomes negative.
12. Replaying starts with fresh game state.

## 3. Testing Framework

The project will use:

- **Framework:** Python `unittest`
- **Test location:** `tests/test_game.py`
- **Application logic:** `game.py`
- **Command-line interface:** `main.py`

The game logic must be testable without requesting keyboard input or printing terminal messages.

This separation allows automated tests to examine game behaviour directly.

## 4. Test Categories

### 4.1 Unit Testing

Unit tests will examine individual functions and game rules.

Examples include:

- Creating a new player.
- Moving between connected locations.
- Collecting an object.
- Checking inventory.
- Validating bridge access.
- Lighting the beacon.
- Checking victory and defeat conditions.

### 4.2 State Validation Testing

These tests will verify that player information changes correctly.

The important state attributes are:

- Player name.
- Current location.
- Energy.
- Inventory.
- Beacon status.
- Game-over status.
- Victory status.

Rejected actions must not accidentally modify unrelated state.

### 4.3 Input Validation Testing

The command-line interface must handle:

- Empty input.
- Whitespace around commands.
- Uppercase and lowercase commands.
- Unknown menu choices.
- Exit commands.
- Repeated invalid input.

Input handling must not crash the application.

### 4.4 Gameplay Testing

A complete gameplay test will follow a realistic sequence from the Beach to the Lighthouse.

The test will confirm that the player can collect both objects, cross the bridge, restore the beacon, and win.

## 5. Required Acceptance Tests

The following tests define the minimum expected behaviour.

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| T1 | Start a new game | Beach, 5 energy, empty inventory |
| T2 | Submit an invalid action | Player state remains unchanged |
| T3 | Make a valid move | Location changes and energy decreases by 1 |
| T4 | Attempt an unconnected move | Movement is rejected without energy loss |
| T5 | Collect the rope | Rope enters inventory only once |
| T6 | Cross the bridge without rope | Crossing is rejected without energy loss |
| T7 | Light the beacon without lantern | Beacon remains unlit |
| T8 | Complete the correct winning sequence | Beacon lights and player wins |
| T9 | Move with 1 energy remaining | Energy becomes 0 and player loses |
| T10 | Start a replay | Fresh state with 5 energy and empty inventory |

These are acceptance requirements. They will become automated test functions as the game logic is implemented.

## 6. Energy Boundary Tests

Energy is one of the most important game rules.

The following conditions must always hold:

- Initial energy is exactly 5.
- A successful move costs exactly 1 energy.
- A rejected move costs 0 energy.
- Collecting objects costs 0 energy.
- Inspecting a location costs 0 energy.
- Viewing inventory costs 0 energy.
- Lighting the beacon costs 0 energy.
- Energy must never become negative.
- A legal move that reduces energy to zero immediately causes defeat.

Tests must verify the energy value before and after each relevant action.

## 7. Inventory Tests

The game contains two required objects:

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

Collecting an object must not deduct energy.

Neither object is consumed when used.

## 8. Victory and Defeat Tests

### 8.1 Victory

The player wins only when all these conditions are satisfied:

- The player is at the Lighthouse.
- The player has the rope.
- The player has the lantern.
- The beacon is lit.
- The player has more than zero energy.

The game must not report victory if any condition is missing.

### 8.2 Defeat

The player loses immediately when a successful move reduces energy to zero.

After defeat, the game must not continue accepting normal gameplay actions.

### 8.3 Quit

Quitting is different from losing.

A player who chooses to exit must receive an appropriate exit message, not a defeat message.

## 9. Replay Testing

Replay testing must confirm that a new game does not inherit the previous game's state.

A replay must reset:

- Location to Beach.
- Energy to 5.
- Inventory to an empty list.
- Beacon status to unlit.
- Game-over status to false.
- Victory status to false.

The new game must use a fresh inventory list rather than sharing the previous game's list.

## 10. Edge Cases and Bug-Hunter Checks

The following situations must be examined:

1. Player enters an empty name.
2. Player enters a name containing only spaces.
3. Player enters a command with surrounding spaces.
4. Player enters a command using different letter cases.
5. Player repeatedly attempts an invalid movement.
6. Player tries to collect an object from the wrong location.
7. Player attempts to collect an object more than once.
8. Player tries to cross the bridge without rope.
9. Player tries to light the beacon without lantern.
10. Player tries to win before reaching the Lighthouse.
11. Player attempts another action after the game ends.
12. Player attempts a move when only one energy point remains.
13. Player attempts an action that would make energy negative.
14. Player replays after winning or losing.
15. Player chooses to quit.

## 11. Running the Automated Tests

From the project root, the tests will be executed using:

```bash
python3 -m unittest discover -s tests -v
```

The command will discover and execute test files in the `tests` directory.

The `-v` option displays individual test names and their results.

A successful test run should report that all implemented tests passed.

## 12. Testing Standards

The project will follow these testing principles:

- Tests must be repeatable.
- Tests must not depend on internet access.
- Tests must not depend on random events.
- Tests must not require a real player's keyboard input.
- Tests must verify expected results, not merely successful execution.
- Each test should focus on a clear behaviour.
- Failed tests must be investigated before proceeding.
- Existing passing tests must continue passing after changes.

## 13. Testing Completion Criteria

Testing is considered complete when:

1. All required acceptance tests have been implemented.
2. All automated tests pass.
3. Invalid actions preserve the player's state.
4. Energy rules are enforced correctly.
5. Inventory and puzzle restrictions work correctly.
6. Victory, defeat, quit, and replay behave correctly.
7. A complete successful gameplay sequence works.
8. A complete losing gameplay sequence works.
9. No known critical gameplay defect remains.

## 14. Final Testing Principle

A game is not considered complete simply because it starts and displays a menu.

It is complete when its rules behave correctly, unexpected input is handled safely, and the player can experience the intended winning and losing outcomes reliably.
