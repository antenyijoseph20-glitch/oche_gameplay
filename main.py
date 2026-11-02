
"""Command-line interface for Oche Gameplay."""

from game import (
    new_game,
    normalize_player_name,
    apply_action,
    available_destinations,
    is_game_over,
)


class GameExit(Exception):
    """Signal that the player has confirmed they want to exit."""


def display_title():
    """Display the game title and introduction."""

    print("\n" + "=" * 45)
    print("          OCHE: MYSTERY ISLAND")
    print("=" * 45)
    print("You have awakened on a mysterious island.")
    print("The lighthouse is dark, and a rescue boat")
    print("cannot find its way to the island.")
    print("\nYour mission is to restore the lighthouse beacon.")
    print("=" * 45)


def read_input(prompt):
    """Read input and handle Ctrl+C or Ctrl+D safely."""

    while True:
        try:
            return input(prompt)

        except (KeyboardInterrupt, EOFError) as error:
            print()

            interruption = (
                "Ctrl+C" if isinstance(error, KeyboardInterrupt) else "Ctrl+D"
            )

            while True:
                try:
                    answer = input(
                        f"\nYou pressed {interruption}. "
                        "Are you sure you want to exit? [y/N]: "
                    ).strip().lower()

                except (KeyboardInterrupt, EOFError):
                    print("\nInput is unavailable. Exiting safely.")
                    raise GameExit

                if answer in ("y", "yes"):
                    raise GameExit

                if answer in ("n", "no", ""):
                    print("\nContinuing the game.")
                    break

                print("Please enter y or n.")


def get_player_name():
    """Ask for a valid player name."""

    while True:
        name = read_input("\nWhat is your name? ")

        try:
            return normalize_player_name(name)

        except ValueError as error:
            print(f"Invalid name: {error}")


def display_menu():
    """Display the available menu options."""

    print("\nWhat would you like to do?")
    print("1. Look around")
    print("2. Check player status")
    print("3. Move to another location")
    print("4. Collect an item")
    print("5. View inventory")
    print("6. Light the lighthouse beacon")
    print("7. Quit game")


def handle_movement(player):
    """Ask the player where they want to move."""

    destinations = available_destinations(player)

    if not destinations:
        print("\nThere are no available destinations.")
        return

    print("\nYou can travel directly to:")

    for destination in destinations:
        print(f"- {destination}")

    if (
        player["location"] == "Old Bridge"
        and "rope" not in player["inventory"]
    ):
        print("Note: You need a rope to cross from Old Bridge to Lighthouse.")

    destination = read_input(
        "\nWhere would you like to go? "
        "(Enter a location, 'back' to cancel, or '7' to quit): "
    ).strip()

    if not destination:
        print("\nNo destination entered. Movement cancelled.")
        return

    if destination.casefold() == "back":
        print("\nMovement cancelled.")
        return

    if destination.casefold() in ("7", "quit", "exit"):
        raise GameExit

    if destination.casefold().startswith(("go ", "move ")):
        action = destination
    else:
        action = f"go {destination}"

    result = apply_action(player, action)
    print(f"\n{result['message']}")


def handle_collection(player):
    """Ask the player which item they want to collect."""

    print("\nItems available in this adventure:")
    print("- Rope (Jungle)")
    print("- Lantern (Cave)")

    item = read_input(
        "\nWhich item would you like to collect? "
        "('back' to cancel, or '7' to quit): "
    ).strip()

    if not item:
        print("\nNo item entered. Collection cancelled.")
        return

    if item.casefold() == "back":
        print("\nCollection cancelled.")
        return

    if item.casefold() in ("7", "quit", "exit"):
        raise GameExit

    if item.casefold().startswith("collect "):
        action = item
    else:
        action = f"collect {item}"

    result = apply_action(player, action)
    print(f"\n{result['message']}")


def ask_replay():
    """Ask whether the player wants to start another adventure."""

    while True:
        answer = read_input(
            "\nWould you like to play again? [y/N]: "
        ).strip().casefold()

        if answer in ("y", "yes"):
            return True

        if answer in ("n", "no", ""):
            return False

        print("Please enter y or n.")


def play_game(player):
    """Run one complete adventure."""

    print(f"\nWelcome, {player['name']}!")
    print(f"You begin your adventure at the {player['location']}.")
    print(f"Your starting energy is {player['energy']}.")

    while not is_game_over(player):
        display_menu()

        choice = read_input("\nEnter your choice: ").strip().casefold()

        if choice in ("7", "quit", "exit"):
            raise GameExit

        if choice == "1":
            result = apply_action(player, "look")
            print(f"\n{result['message']}")

        elif choice == "2":
            result = apply_action(player, "status")
            print(f"\n{result['message']}")

        elif choice == "3":
            handle_movement(player)

        elif choice == "4":
            handle_collection(player)

        elif choice == "5":
            result = apply_action(player, "inventory")
            print(f"\n{result['message']}")

        elif choice == "6":
            result = apply_action(player, "light beacon")
            print(f"\n{result['message']}")

        else:
            print(
                "\nInvalid menu choice. "
                "Please enter a number from 1 to 7."
            )

    if player["won"]:
        print("\n=============================================")
        print("             ADVENTURE COMPLETED!")
        print("=============================================")
    else:
        print("\n=============================================")
        print("              GAME OVER")
        print("=============================================")
        print("You have run out of energy. The rescue boat")
        print("could not find you in time.")


def main():
    """Run the Oche: Mystery Island game with replay support."""

    try:
        display_title()

        player_name = get_player_name()

        while True:
            player = new_game(player_name)

            try:
                play_game(player)

            except GameExit:
                print("\nYou chose to leave this adventure.")

            if not ask_replay():
                break

            print("\nStarting a new adventure...")
            print("Your energy and inventory have been reset.")

        print("\nYou have left Mystery Island.")
        print("Thank you for playing Oche: Mystery Island!")

    except GameExit:
        print("\nYou have left Mystery Island.")
        print("Thank you for playing Oche: Mystery Island!")

if __name__ == "__main__":
    main()
