"""Tests for the Oche: Mystery Island command-line application."""

import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch

from main import main, read_input


class TestGameReplay(unittest.TestCase):
    """Test replay behaviour after every possible game ending."""

    def run_game_with_inputs(self, inputs):
        """Run the application with simulated player input."""

        output = StringIO()
        input_iterator = iter(inputs)

        def simulated_read_input(prompt):
            print(prompt, end="")
            return next(input_iterator)

        with patch(
            "main.read_input",
            side_effect=simulated_read_input,
        ):
            with redirect_stdout(output):
                main()

        return output.getvalue()

    def assert_replay_started(self, output):
        """Verify that a fresh adventure was started."""

        self.assertEqual(output.count("Welcome, Oche!"), 2)
        self.assertEqual(
            output.count("Would you like to play again?"),
            2,
        )
        self.assertIn("Starting a new adventure...", output)
        self.assertIn("Your starting energy is 5.", output)

    def test_replay_after_quitting(self):
        """Quitting should offer replay without causing defeat."""

        output = self.run_game_with_inputs([
            "Oche",
            "6",
            "y",
            "4",
            "6",
            "n",
        ])

        self.assertIn(
            "You chose to leave this adventure.",
            output,
        )
        self.assertNotIn("GAME OVER", output)
        self.assertIn("Inventory: Empty", output)
        self.assert_replay_started(output)

    def test_replay_after_victory(self):
        """Winning should offer a fresh adventure."""

        output = self.run_game_with_inputs([
            "Oche",
            "1", "Jungle",
            "2", "y",
            "1", "Cave",
            "2", "y",
            "1", "Old Bridge",
            "1", "Lighthouse",
            "2",
            "y",
            "6",
            "n",
        ])

        self.assertIn("ADVENTURE COMPLETED!", output)
        self.assert_replay_started(output)
        self.assertIn(
            "You chose to leave this adventure.",
            output,
        )

    def test_replay_after_defeat(self):
        """Running out of energy should offer a fresh adventure."""

        output = self.run_game_with_inputs([
            "Oche",
            "1", "Jungle",
            "1", "Beach",
            "1", "Jungle",
            "1", "Beach",
            "1", "Jungle",
            "y",
            "6",
            "n",
        ])

        self.assertIn("GAME OVER", output)
        self.assert_replay_started(output)
        self.assertIn(
            "You chose to leave this adventure.",
            output,
        )

    def test_invalid_replay_answer_prompts_again(self):
        """An invalid replay answer should not end the application."""

        output = self.run_game_with_inputs([
            "Oche",
            "6",
            "maybe",
            "n",
        ])

        self.assertIn("Please enter y or n.", output)
        self.assertEqual(
            output.count("Would you like to play again?"),
            2,
        )
        self.assertIn(
            "Thank you for playing Oche: Mystery Island!",
            output,
        )


class TestInputInterruptions(unittest.TestCase):
    """Test safe handling of keyboard interruptions."""

    def test_cancelled_ctrl_c_allows_input_to_continue(self):
        """Answering no after Ctrl+C should resume normal input."""

        output = StringIO()

        with patch(
            "builtins.input",
            side_effect=[
                KeyboardInterrupt,
                "n",
                "continue",
            ],
        ):
            with redirect_stdout(output):
                result = read_input("Enter command: ")

        self.assertEqual(result, "continue")
        self.assertIn("Continuing the game.", output.getvalue())


if __name__ == "__main__":
    unittest.main()