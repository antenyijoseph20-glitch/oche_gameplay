
"""Automated tests for Oche Gameplay."""

import unittest

from game import (
    new_game,
    normalize_player_name,
    available_actions,
    available_destinations,
    describe_location,
    describe_map,
    get_status,
    move_player,
    collect_item,
    light_beacon,
    apply_action,
    is_win,
    is_game_over,
)


class TestNewGame(unittest.TestCase):
    """Test the creation of a new game."""

    def test_new_game_has_correct_initial_state(self):
        player = new_game("Oche")

        self.assertEqual(player["name"], "Oche")
        self.assertEqual(player["location"], "Beach")
        self.assertEqual(player["energy"], 5)
        self.assertEqual(player["inventory"], [])
        self.assertFalse(player["beacon_lit"])
        self.assertFalse(player["game_over"])
        self.assertFalse(player["won"])

    def test_new_games_have_independent_inventories(self):
        first_player = new_game("Oche")
        second_player = new_game("Joseph")

        first_player["inventory"].append("rope")

        self.assertEqual(first_player["inventory"], ["rope"])
        self.assertEqual(second_player["inventory"], [])

    def test_new_game_normalizes_player_name(self):
        player = new_game("  Oche   Joseph  ")

        self.assertEqual(player["name"], "Oche Joseph")


class TestPlayerNameValidation(unittest.TestCase):
    """Test the rules for accepting player names."""

    def test_valid_name_is_accepted(self):
        self.assertEqual(normalize_player_name("Oche 2026"), "Oche 2026")

    def test_empty_name_is_rejected(self):
        with self.assertRaises(ValueError):
            normalize_player_name("")

    def test_name_without_letters_is_rejected(self):
        with self.assertRaises(ValueError):
            normalize_player_name("12345")

    def test_unsupported_character_is_rejected(self):
        with self.assertRaises(ValueError):
            normalize_player_name("Oche_Joseph")

    def test_name_over_40_characters_is_rejected(self):
        with self.assertRaises(ValueError):
            normalize_player_name("A" * 41)


class TestGameActions(unittest.TestCase):
    """Test basic game actions."""

    def setUp(self):
        self.player = new_game("Oche")

    def test_available_actions_for_new_game(self):
        self.assertEqual(
            available_actions(self.player),
            ["look", "status"],
        )

    def test_look_describes_the_beach(self):
        description = describe_location(self.player)

        self.assertIn("Beach", description)
        self.assertIn("Jungle", description)

    def test_status_shows_player_information(self):
        status = get_status(self.player)

        self.assertIn("Oche", status)
        self.assertIn("Beach", status)
        self.assertIn("5", status)
        self.assertIn("Empty", status)

    def test_look_action_succeeds(self):
        result = apply_action(self.player, "look")

        self.assertTrue(result["success"])
        self.assertIn("Beach", result["message"])

    def test_status_action_succeeds(self):
        result = apply_action(self.player, "status")

        self.assertTrue(result["success"])
        self.assertIn("Energy: 5", result["message"])

    def test_invalid_action_does_not_change_player_state(self):
        original_state = self.player.copy()
        original_state["inventory"] = self.player["inventory"].copy()

        result = apply_action(self.player, "dance")

        self.assertFalse(result["success"])
        self.assertEqual(self.player, original_state)

    def test_non_text_action_is_rejected(self):
        result = apply_action(self.player, None)

        self.assertFalse(result["success"])

    def test_actions_are_unavailable_after_game_over(self):
        self.player["game_over"] = True

        self.assertEqual(available_actions(self.player), [])

        result = apply_action(self.player, "look")

        self.assertFalse(result["success"])
        self.assertIn("already ended", result["message"])

    def test_win_and_game_over_status(self):
        self.assertFalse(is_win(self.player))
        self.assertFalse(is_game_over(self.player))


class TestMovement(unittest.TestCase):
    """Test movement rules and energy consumption."""

    def setUp(self):
        self.player = new_game("Oche")

    def test_player_can_move_from_beach_to_jungle(self):
        result = apply_action(self.player, "go jungle")

        self.assertTrue(result["success"])
        self.assertEqual(self.player["location"], "Jungle")
        self.assertEqual(self.player["energy"], 4)

    def test_destination_ignores_case_and_extra_spaces(self):
        result = apply_action(self.player, "  GO JUNGLE  ")

        self.assertTrue(result["success"])
        self.assertEqual(self.player["location"], "Jungle")

    def test_non_connected_location_is_rejected(self):
        original_state = self.player.copy()
        original_state["inventory"] = self.player["inventory"].copy()

        result = apply_action(self.player, "go cave")

        self.assertFalse(result["success"])
        self.assertEqual(self.player, original_state)

    def test_player_can_move_back_to_beach(self):
        apply_action(self.player, "go jungle")

        result = apply_action(self.player, "go beach")

        self.assertTrue(result["success"])
        self.assertEqual(self.player["location"], "Beach")
        self.assertEqual(self.player["energy"], 3)

    def test_bridge_rejects_player_without_rope(self):
        self.player["location"] = "Old Bridge"

        result = move_player(self.player, "Lighthouse")

        self.assertFalse(result["success"])
        self.assertEqual(self.player["location"], "Old Bridge")
        self.assertEqual(self.player["energy"], 5)

    def test_bridge_allows_player_with_rope(self):
        self.player["location"] = "Old Bridge"
        self.player["inventory"].append("rope")

        result = move_player(self.player, "Lighthouse")

        self.assertTrue(result["success"])
        self.assertEqual(self.player["location"], "Lighthouse")
        self.assertEqual(self.player["energy"], 4)

    def test_last_energy_point_causes_defeat(self):
        self.player["energy"] = 1

        result = apply_action(self.player, "go jungle")

        self.assertTrue(result["success"])
        self.assertEqual(self.player["location"], "Jungle")
        self.assertEqual(self.player["energy"], 0)
        self.assertTrue(self.player["game_over"])
        self.assertFalse(self.player["won"])

    def test_available_destinations_match_current_location(self):
        self.assertEqual(
            available_destinations(self.player),
            ["Jungle"],
        )


class TestInventory(unittest.TestCase):
    """Test item collection and inventory inspection."""

    def setUp(self):
        self.player = new_game("Oche")

    def test_player_can_collect_rope_in_jungle(self):
        self.player["location"] = "Jungle"

        result = apply_action(self.player, "collect rope")

        self.assertTrue(result["success"])
        self.assertIn("rope", self.player["inventory"])

    def test_player_can_collect_lantern_in_cave(self):
        self.player["location"] = "Cave"

        result = apply_action(self.player, "collect lantern")

        self.assertTrue(result["success"])
        self.assertIn("lantern", self.player["inventory"])

    def test_collecting_item_does_not_consume_energy(self):
        self.player["location"] = "Jungle"
        original_energy = self.player["energy"]

        apply_action(self.player, "collect rope")

        self.assertEqual(self.player["energy"], original_energy)

    def test_player_cannot_collect_rope_outside_jungle(self):
        original_energy = self.player["energy"]

        result = apply_action(self.player, "collect rope")

        self.assertFalse(result["success"])
        self.assertNotIn("rope", self.player["inventory"])
        self.assertEqual(self.player["energy"], original_energy)

    def test_player_cannot_collect_lantern_outside_cave(self):
        result = apply_action(self.player, "collect lantern")

        self.assertFalse(result["success"])
        self.assertNotIn("lantern", self.player["inventory"])

    def test_player_cannot_collect_same_item_twice(self):
        self.player["location"] = "Jungle"

        first_result = apply_action(self.player, "collect rope")
        second_result = apply_action(self.player, "collect rope")

        self.assertTrue(first_result["success"])
        self.assertFalse(second_result["success"])
        self.assertEqual(self.player["inventory"].count("rope"), 1)

    def test_unknown_item_is_rejected(self):
        self.player["location"] = "Jungle"

        result = apply_action(self.player, "collect sword")

        self.assertFalse(result["success"])
        self.assertEqual(self.player["inventory"], [])

    def test_collect_command_ignores_case_and_extra_spaces(self):
        self.player["location"] = "Jungle"

        result = apply_action(self.player, "  COLLECT ROPE  ")

        self.assertTrue(result["success"])
        self.assertIn("rope", self.player["inventory"])

    def test_inventory_action_displays_collected_items(self):
        self.player["location"] = "Jungle"
        apply_action(self.player, "collect rope")

        result = apply_action(self.player, "inventory")

        self.assertTrue(result["success"])
        self.assertIn("rope", result["message"])

    def test_inventory_action_displays_empty_inventory(self):
        result = apply_action(self.player, "inventory")

        self.assertTrue(result["success"])
        self.assertIn("Empty", result["message"])

    def test_inventory_action_does_not_consume_energy(self):
        self.player["location"] = "Jungle"
        apply_action(self.player, "collect rope")
        original_energy = self.player["energy"]

        apply_action(self.player, "inventory")

        self.assertEqual(self.player["energy"], original_energy)

    def test_collection_is_rejected_after_game_over(self):
        self.player["location"] = "Jungle"
        self.player["game_over"] = True

        result = apply_action(self.player, "collect rope")

        self.assertFalse(result["success"])
        self.assertEqual(self.player["inventory"], [])

    def test_collected_rope_remains_after_crossing_bridge(self):
        self.player["location"] = "Old Bridge"
        self.player["inventory"].append("rope")

        result = apply_action(self.player, "go lighthouse")

        self.assertTrue(result["success"])
        self.assertIn("rope", self.player["inventory"])

    def test_direct_collection_is_rejected_after_game_over(self):
        self.player["location"] = "Jungle"
        self.player["game_over"] = True

        original_state = self.player.copy()
        original_state["inventory"] = self.player["inventory"].copy()

        result = collect_item(self.player, "rope")

        self.assertFalse(result["success"])
        self.assertIn("already ended", result["message"].casefold())
        self.assertEqual(self.player, original_state)


class TestBeacon(unittest.TestCase):
    """Test lighthouse beacon requirements and victory."""

    def setUp(self):
        self.player = new_game("Oche")
        self.player["location"] = "Lighthouse"
        self.player["inventory"] = ["rope", "lantern"]
        self.player["energy"] = 1

    def test_beacon_cannot_be_lit_outside_lighthouse(self):
        self.player["location"] = "Cave"

        result = apply_action(self.player, "light beacon")

        self.assertFalse(result["success"])
        self.assertIn("Lighthouse", result["message"])

    def test_beacon_requires_lantern(self):
        self.player["inventory"].remove("lantern")

        result = apply_action(self.player, "light beacon")

        self.assertFalse(result["success"])
        self.assertIn("lantern", result["message"].casefold())

    def test_beacon_requires_rope_for_victory(self):
        self.player["inventory"].remove("rope")

        result = apply_action(self.player, "light beacon")

        self.assertFalse(result["success"])
        self.assertIn("rope", result["message"].casefold())

    def test_lighting_beacon_wins_the_game(self):
        result = apply_action(self.player, "light beacon")

        self.assertTrue(result["success"])
        self.assertTrue(self.player["beacon_lit"])
        self.assertTrue(self.player["game_over"])
        self.assertTrue(is_win(self.player))
        self.assertTrue(is_game_over(self.player))
        self.assertIn("rescue", result["message"].casefold())

    def test_lighting_beacon_does_not_consume_energy(self):
        original_energy = self.player["energy"]

        apply_action(self.player, "light beacon")

        self.assertEqual(self.player["energy"], original_energy)

    def test_actions_are_rejected_after_beacon_is_lit(self):
        apply_action(self.player, "light beacon")

        result = apply_action(self.player, "look")

        self.assertFalse(result["success"])
        self.assertIn("already ended", result["message"].casefold())

    def test_direct_beacon_lighting_is_rejected_after_game_over(self):
        self.player["game_over"] = True

        original_state = self.player.copy()
        original_state["inventory"] = self.player["inventory"].copy()

        result = light_beacon(self.player)

        self.assertFalse(result["success"])
        self.assertIn("already ended", result["message"].casefold())
        self.assertEqual(self.player, original_state)

class TestIslandMap(unittest.TestCase):
    """Test the island map representation."""

    def test_map_shows_all_locations(self):
        player = new_game("Oche")

        island_map = describe_map(player)

        for location in (
            "Beach",
            "Jungle",
            "Cave",
            "Old Bridge",
            "Lighthouse",
        ):
            with self.subTest(location=location):
                self.assertIn(location, island_map)

    def test_map_marks_current_location(self):
        player = new_game("Oche")
        player["location"] = "Cave"

        island_map = describe_map(player)

        self.assertIn("Cave", island_map)
        self.assertIn("You are here", island_map)

    def test_map_shows_item_availability(self):
        player = new_game("Oche")

        island_map = describe_map(player)

        self.assertIn("Rope: Jungle (Available)", island_map)
        self.assertIn("Lantern: Cave (Available)", island_map)

    def test_map_updates_after_collecting_items(self):
        player = new_game("Oche")
        player["inventory"].extend(["rope", "lantern"])

        island_map = describe_map(player)

        self.assertIn("Rope: Jungle (Collected)", island_map)
        self.assertIn("Lantern: Cave (Collected)", island_map)

    def test_viewing_map_does_not_change_player_state(self):
        player = new_game("Oche")
        player["location"] = "Jungle"
        player["inventory"].append("rope")

        original_state = player.copy()
        original_state["inventory"] = player["inventory"].copy()

        describe_map(player)

        self.assertEqual(player, original_state)


if __name__ == "__main__":
    unittest.main()
