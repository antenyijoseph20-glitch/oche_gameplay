
"""Core game logic for Oche Gameplay."""

import unicodedata


MAX_NAME_LENGTH = 40

ALLOWED_NAME_PUNCTUATION = {"-", "'", "’", ".", ","}

# Each location lists the places directly connected to it.
LOCATION_CONNECTIONS = {
    "Beach": ["Jungle"],
    "Jungle": ["Beach", "Cave"],
    "Cave": ["Jungle", "Old Bridge"],
    "Old Bridge": ["Cave", "Lighthouse"],
    "Lighthouse": ["Old Bridge"],
}

LOCATION_DESCRIPTIONS = {
    "Beach": (
        "You are standing on the sandy Beach of Mystery Island.\n"
        "The sea is behind you, and a thick Jungle lies ahead.\n"
        "Somewhere on the island stands a dark lighthouse."
    ),
    "Jungle": (
        "You are deep inside the Jungle.\n"
        "Tall trees surround you, and a narrow path leads deeper "
        "towards a mysterious Cave."
    ),
    "Cave": (
        "You have entered a dark Cave.\n"
        "The air is cold, and an old path leads towards the Old Bridge."
    ),
    "Old Bridge": (
        "You are standing beside the Old Bridge.\n"
        "It connects the island's interior to the Lighthouse."
    ),
    "Lighthouse": (
        "You have reached the Lighthouse.\n"
        "Its beacon is dark, but restoring it could guide a rescue boat."
    ),
}

# Each item has one location where it can be collected.
ITEM_LOCATIONS = {
    "rope": "Jungle",
    "lantern": "Cave",
}


def normalize_player_name(name):
    """Validate and normalize a player's name."""

    if not isinstance(name, str):
        raise TypeError("Player name must be text.")

    name = unicodedata.normalize("NFC", name)
    name = " ".join(name.split())

    if not name:
        raise ValueError("Player name cannot be empty.")

    if len(name) > MAX_NAME_LENGTH:
        raise ValueError(
            f"Player name cannot exceed {MAX_NAME_LENGTH} characters."
        )

    contains_letter = False

    for character in name:
        if character.isalpha():
            contains_letter = True
        elif character.isdigit() or character.isspace():
            continue
        elif character in ALLOWED_NAME_PUNCTUATION:
            continue
        else:
            raise ValueError(
                f"The character {character!r} is not allowed in a name."
            )

    if not contains_letter:
        raise ValueError("Player name must contain at least one letter.")

    return name


def new_game(name):
    """Create and return a fresh player state."""

    return {
        "name": normalize_player_name(name),
        "location": "Beach",
        "energy": 5,
        "inventory": [],
        "beacon_lit": False,
        "game_over": False,
        "won": False,
    }


def available_actions(player):
    """Return the basic actions currently available to the player."""

    if is_game_over(player):
        return []

    return ["look", "status"]


def available_destinations(player):
    """Return locations directly connected to the player's location."""

    if is_game_over(player):
        return []

    return LOCATION_CONNECTIONS.get(player["location"], []).copy()


def describe_location(player):
    """Return a description of the player's current location."""

    return LOCATION_DESCRIPTIONS.get(
        player["location"],
        "You are somewhere on Mystery Island.",
    )

def describe_map(player):
    """Return a map of Mystery Island and the player's current position."""

    locations = (
        "Beach",
        "Jungle",
        "Cave",
        "Old Bridge",
        "Lighthouse",
    )

    map_line = " <--> ".join(locations)
    current_position = map_line.index(player["location"])

    rope_status = (
        "Collected" if "rope" in player["inventory"] else "Available"
    )
    lantern_status = (
        "Collected" if "lantern" in player["inventory"] else "Available"
    )

    return (
        "\n"
        "                 MYSTERY ISLAND MAP\n"
        "============================================================\n"
        f"{map_line}\n"
        f"{' ' * current_position}^\n"
        f"{' ' * current_position}You are here\n"
        "============================================================\n"
        f"Rope: Jungle ({rope_status})\n"
        f"Lantern: Cave ({lantern_status})\n"
        "Bridge: A rope is required to reach the Lighthouse.\n"
        "Connections: Travel is possible between adjacent locations."
    )


def get_status(player):
    """Return a readable summary of the player's current state."""

    inventory = player["inventory"]

    inventory_text = ", ".join(inventory) if inventory else "Empty"

    return (
        f"Player: {player['name']}\n"
        f"Location: {player['location']}\n"
        f"Energy: {player['energy']}\n"
        f"Inventory: {inventory_text}"
    )


def collect_item(player, item):
    """Collect an item when the player is in its designated location."""

    if not isinstance(item, str):
        return {
            "success": False,
            "message": "Invalid item. Enter a valid item name.",
        }

    if is_game_over(player):
        return {
            "success": False,
            "message": "The game has already ended.",
        }

    item = item.strip().casefold()

    if item not in ITEM_LOCATIONS:
        return {
            "success": False,
            "message": "That item cannot be collected.",
        }

    required_location = ITEM_LOCATIONS[item]

    if player["location"] != required_location:
        return {
            "success": False,
            "message": (
                f"You must be in the {required_location} "
                f"to collect the {item}."
            ),
        }

    if item in player["inventory"]:
        return {
            "success": False,
            "message": f"You have already collected the {item}.",
        }

    player["inventory"].append(item)

    return {
        "success": True,
        "message": f"You collected the {item}.",
    }


def move_player(player, destination):
    """Move the player to a directly connected location."""

    if not isinstance(destination, str):
        return {
            "success": False,
            "message": "Invalid destination. Enter a location name.",
        }

    if is_game_over(player):
        return {
            "success": False,
            "message": "The game has already ended.",
        }

    destination = destination.strip().casefold()

    # Match the destination without depending on letter capitalization.
    valid_destination = None

    for location in available_destinations(player):
        if location.casefold() == destination:
            valid_destination = location
            break

    if valid_destination is None:
        return {
            "success": False,
            "message": (
                "You cannot move there from your current location."
            ),
        }

    # The rope is required to cross from the Old Bridge to the Lighthouse.
    if (
        player["location"] == "Old Bridge"
        and valid_destination == "Lighthouse"
        and "rope" not in player["inventory"]
    ):
        return {
            "success": False,
            "message": (
                "The bridge crossing is unsafe. "
                "You need a rope before reaching the Lighthouse."
            ),
        }

    if player["energy"] <= 0:
        player["energy"] = 0
        player["game_over"] = True

        return {
            "success": False,
            "message": "You have run out of energy. Your adventure is over.",
        }

    # A successful move changes location and consumes one energy point.
    player["location"] = valid_destination
    player["energy"] -= 1

    if player["energy"] == 0:
        player["game_over"] = True
        player["won"] = False

        return {
            "success": True,
            "message": (
                f"You reached {valid_destination}, but used your last "
                "energy point. You have lost the game."
            ),
        }

    return {
        "success": True,
        "message": (
            f"You moved to {valid_destination}.\n"
            f"Energy remaining: {player['energy']}."
        ),
    }


def light_beacon(player):
    """Light the lighthouse beacon and complete the adventure."""

    if is_game_over(player):
        return {
            "success": False,
            "message": "The game has already ended.",
        }

    if player["location"] != "Lighthouse":
        return {
            "success": False,
            "message": "You must reach the Lighthouse before lighting the beacon.",
        }

    if "rope" not in player["inventory"]:
        return {
            "success": False,
            "message": "You need the rope to complete your rescue mission.",
        }

    if "lantern" not in player["inventory"]:
        return {
            "success": False,
            "message": "You need the lantern to light the lighthouse beacon.",
        }

    if player["energy"] <= 0:
        return {
            "success": False,
            "message": "You have no energy left to light the beacon.",
        }

    player["beacon_lit"] = True
    player["won"] = True
    player["game_over"] = True

    return {
        "success": True,
        "message": (
            "The lighthouse beacon shines brightly across the sea! "
            "The rescue boat sees the light and heads towards the island. "
            "Congratulations! You have been rescued and won the adventure!"
        ),
    }


def apply_action(player, action):
    """Process a game action and return its result."""

    if not isinstance(action, str):
        return {
            "success": False,
            "message": "Invalid action. Please choose a valid action.",
        }

    action = action.strip()

    if is_game_over(player):
        return {
            "success": False,
            "message": "The game has already ended.",
        }

    if action.casefold() == "look":
        return {
            "success": True,
            "message": describe_location(player),
        }

    if action.casefold() == "status":
        return {
            "success": True,
            "message": get_status(player),
        }

    if action.casefold() == "inventory":
        inventory = player["inventory"]
        inventory_text = ", ".join(inventory) if inventory else "Empty"

        return {
            "success": True,
            "message": f"Inventory: {inventory_text}",
        }

    if action.casefold() == "light beacon":
        return light_beacon(player)

    command_parts = action.split(maxsplit=1)

    # Accept commands such as "collect rope" and "collect lantern".
    if (
        len(command_parts) == 2
        and command_parts[0].casefold() == "collect"
    ):
        return collect_item(player, command_parts[1])

    # Accept commands such as "go jungle" and "move jungle".
    if (
        len(command_parts) == 2
        and command_parts[0].casefold() in ("go", "move")
    ):
        return move_player(player, command_parts[1])

    return {
        "success": False,
        "message": "Invalid action. Please choose a valid action.",
    }


def is_win(player):
    """Return True if the player has won the game."""

    return player["won"]


def is_game_over(player):
    """Return True if the game has ended."""

    return player["game_over"]


if __name__ == "__main__":
    unittest.main()
