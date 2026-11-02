# Mystery Island Adventure — Game Design Document

## 1. Document Purpose

This document defines the story, objectives, locations, gameplay mechanics, player decisions, energy rules, puzzles and outcomes for Mystery Island Adventure.

It serves as the design reference for implementation and testing. The README remains the project's main overview.

## 2. Game Concept

Mystery Island Adventure is a single-player, command-line text adventure written in Python.

Following a violent storm, the player wakes up stranded on a mysterious island. The lighthouse beacon is dark, and a rescue boat cannot identify the island until the beacon is restored.

The player must explore the island, collect essential objects, overcome the damaged bridge and restore the lighthouse before exhausting their energy.

## 3. Main Objective

The player's objective is to:

1. Explore all necessary island locations.
2. Find and collect the rope in the Jungle.
3. Find and collect the lantern in the Cave.
4. Use the rope to cross the Old Bridge.
5. Reach the Lighthouse.
6. Use the lantern to restore the beacon.
7. Complete the rescue while retaining at least one energy point.

## 4. Island Locations

The island contains five primary locations.

| Location | Description | Important feature |
|---|---|---|
| Beach | The player wakes up after the storm. | Starting location |
| Jungle | A dense forest with an abandoned campsite. | Rope |
| Cave | A dark cave containing abandoned supplies. | Lantern |
| Old Bridge | A damaged bridge connecting the cave area to the lighthouse. | Requires rope to cross |
| Lighthouse | The island's rescue beacon. | Requires lantern to restore |

### 4.1 Location Connections

The valid connections are:

- Beach connects to Jungle.
- Jungle connects to Beach and Cave.
- Cave connects to Jungle and Old Bridge.
- Old Bridge connects to Cave and Lighthouse.
- Lighthouse connects to Old Bridge.

Movement is restricted to directly connected locations.

The game must not allow the player to jump between disconnected locations.

### 4.2 Bridge Access Restriction

Although Lighthouse is adjacent to Old Bridge, the player cannot cross without the rope.

The movement system must therefore validate both the destination connection and the bridge requirement.

## 5. Player State

Each game session maintains its own player state.

The proposed state contains:

| Attribute | Initial value | Purpose |
|---|---|---|
| name | Player's entered name | Identifies the player |
| location | Beach | Tracks current position |
| energy | 5 | Tracks remaining energy |
| inventory | Empty list | Stores collected objects |
| beacon_lit | False | Tracks lighthouse condition |
| game_over | False | Indicates whether gameplay has ended |
| won | False | Indicates victory |

A new game must create a fresh state and a separate empty inventory list.

## 6. Inventory and Collectible Objects

There are two essential objects.

### 6.1 Rope

- Found in the Jungle.
- Required to cross the Old Bridge.
- Does not consume energy when collected.
- Is collected only once.
- Is not consumed when crossing the bridge.

### 6.2 Lantern

- Found in the Cave.
- Required to restore the lighthouse beacon.
- Does not consume energy when collected.
- Is collected only once.
- Is not consumed when restoring the beacon.

### 6.3 Collection Rules

An object can only be collected when:

1. The player is at the correct location.
2. The object has not already been collected.
3. The game session is still active.

Invalid collection attempts must leave the player's inventory and energy unchanged.

## 7. Gameplay Decisions

The game includes at least three meaningful decisions.

**Decision 1 — Collect or ignore the rope**

Ignoring the rope prevents the player from crossing the Old Bridge.

**Decision 2 — Collect or ignore the lantern**

Ignoring the lantern prevents the player from restoring the lighthouse beacon.

**Decision 3 — Continue exploring or conserve energy**

Every successful movement costs one energy point. Unnecessary backtracking can cause the player to lose before reaching the lighthouse.

## 8. Energy Management

The player starts with five energy points.

Only successful movement consumes energy.

| Action | Energy cost |
|---|---:|
| Successful movement | 1 |
| Collect an object | 0 |
| Inspect a location | 0 |
| View inventory | 0 |
| View island map | 0 |
| Invalid movement | 0 |
| Blocked bridge crossing | 0 |
| Attempt to light beacon without lantern | 0 |
| Successfully light beacon | 0 |
| Invalid menu selection | 0 |

Energy must never become negative.

If a successful movement reduces energy to zero, the player immediately loses.

## 9. Victory Conditions

The player wins only when all the following conditions are true:

- Current location is Lighthouse.
- Inventory contains Rope.
- Inventory contains Lantern.
- The beacon has been restored.
- Remaining energy is greater than zero.

After the beacon is restored, the rescue boat approaches and the game displays a victory message.

## 10. Defeat and Quit Conditions

### 10.1 Defeat

The player loses immediately when a successful movement reduces energy to zero.

The game must:

- End the active session.
- Set the victory state to false.
- Display a clear defeat message.
- Prevent further normal gameplay actions.

### 10.2 Voluntary Quit

The player may choose to quit at any time during active gameplay.

Quitting is not a victory or an energy-based defeat. The application must display a separate message.

### 10.3 Replay

After the game ends, the player may choose to replay.

A replay must:

- Start at Beach.
- Restore energy to five.
- Create a new empty inventory.
- Set the beacon to dark.
- Reset the victory and game-over states.
- Ask for or initialize the player's name according to the replay flow.

No previous game progress may carry into the new session.

## 11. Intended Successful Route

The intended efficient route is:

| Step | Action | Location | Energy |
|---|---|---|---:|
| Start | Begin game | Beach | 5 |
| 1 | Move to Jungle | Jungle | 4 |
| 2 | Collect rope | Jungle | 4 |
| 3 | Move to Cave | Cave | 3 |
| 4 | Collect lantern | Cave | 3 |
| 5 | Move to Old Bridge | Old Bridge | 2 |
| 6 | Cross using rope | Lighthouse | 1 |
| 7 | Restore beacon using lantern | Lighthouse | 1 |
| Finish | Rescue boat arrives | Lighthouse | 1 |

This route demonstrates that the player can win without exhausting their energy.

## 12. Input and Action Rules

The game must handle unexpected input safely.

- Menu input must be validated.
- Text commands must be normalized where appropriate.
- Leading and trailing whitespace must be ignored.
- Commands such as ` EXIT ` must be recognized when quit commands are supported.
- Invalid input must not crash the application.
- Invalid input must not modify the player's state or consume energy.

## 13. Deterministic Gameplay

The initial version must not use random events.

Given the same initial player state and the same valid action, the game must produce the same result.

This makes the rules predictable and allows reliable automated testing.

## 14. Design Constraints

The initial game must:

- Use Python and its standard library only.
- Run in a terminal.
- Avoid graphical interfaces and game engines.
- Avoid external databases and APIs.
- Avoid third-party packages.
- Work without an internet connection.

## 15. Design Completion Criteria

The game design is ready for implementation when:

- All five locations and their connections are defined.
- All collectible objects and their purposes are defined.
- Movement and puzzle restrictions are clear.
- Energy costs are consistent.
- Victory, defeat and quit conditions are distinguishable.
- Replay resets all relevant state.
- All ten acceptance tests in the README can be mapped to game behaviour.

**Design principle: Every action must have a clear, predictable result, and every game rule must be testable.**