
"use strict";

const MAX_NAME_LENGTH = 40;
const STARTING_ENERGY = 5;

const LOCATION_CONNECTIONS = {
    Beach: ["Jungle"],
    Jungle: ["Beach", "Cave"],
    Cave: ["Jungle", "Old Bridge"],
    "Old Bridge": ["Cave", "Lighthouse"],
    Lighthouse: ["Old Bridge"],
};

const LOCATION_DESCRIPTIONS = {
    Beach:
        "You are standing on the beach. The waves roll against the shore. " +
        "A narrow path leads into the jungle.",

    Jungle:
        "You are deep in the jungle. You notice a strong rope nearby. " +
        "It may help you cross the old bridge.",

    Cave:
        "You have entered a quiet cave. An old lantern rests against " +
        "the wall. It could help you restore the lighthouse beacon.",

    "Old Bridge":
        "You have reached the old bridge. The lighthouse stands beyond it. " +
        "You need a rope to cross safely.",

    Lighthouse:
        "You have reached the lighthouse. Its beacon is dark. " +
        "You must have a lantern to light it.",
};

const ITEM_LOCATIONS = {
    rope: "Jungle",
    lantern: "Cave",
};

const elements = {
    startScreen: document.querySelector("#start-screen"),
    startForm: document.querySelector("#start-form"),
    playerName: document.querySelector("#player-name"),
    nameError: document.querySelector("#name-error"),

    gameScreen: document.querySelector("#game-screen"),
    playerDisplay: document.querySelector("#player-display"),
    locationDisplay: document.querySelector("#location-display"),
    energyDisplay: document.querySelector("#energy-display"),
    locationTitle: document.querySelector("#location-title"),
    locationDescription: document.querySelector(
        "#location-description"
    ),
    beaconStatus: document.querySelector("#beacon-status"),

    lookButton: document.querySelector("#look-button"),
    inventoryButton: document.querySelector("#inventory-button"),
    collectButton: document.querySelector("#collect-button"),
    beaconButton: document.querySelector("#beacon-button"),
    quitButton: document.querySelector("#quit-button"),

    destinations: document.querySelector("#destinations"),
    inventoryDisplay: document.querySelector("#inventory-display"),
    gameLog: document.querySelector("#game-log"),

    victoryScene: document.querySelector("#victory-scene"),
    rescueBoat: document.querySelector(".rescue-boat"),

    endingPanel: document.querySelector("#ending-panel"),
    endingTitle: document.querySelector("#ending-title"),
    endingMessage: document.querySelector("#ending-message"),
    replayButton: document.querySelector("#replay-button"),
};

let player = null;
let victorySequenceComplete = false;
let victoryCompletionTimer = null;

function normalizePlayerName(value) {
    if (typeof value !== "string") {
        throw new Error("Please enter a valid name.");
    }

    const name = value
        .normalize("NFC")
        .trim()
        .replace(/\s+/gu, " ");

    if (!name) {
        throw new Error("Your name cannot be empty.");
    }

    if (Array.from(name).length > MAX_NAME_LENGTH) {
        throw new Error(
            `Your name must not exceed ${MAX_NAME_LENGTH} characters.`
        );
    }

    const allowedCharacters = /^[\p{L}\p{N}\s\-'. ,’]+$/u;

    if (!allowedCharacters.test(name)) {
        throw new Error(
            "Use letters, numbers, spaces, hyphens, apostrophes, " +
            "full stops or commas only."
        );
    }

    if (!/\p{L}/u.test(name)) {
        throw new Error("Your name must contain at least one letter.");
    }

    return name;
}

function newGame(name) {
    return {
        name,
        location: "Beach",
        energy: STARTING_ENERGY,
        inventory: [],
        beaconLit: false,
        gameOver: false,
        won: false,
        outcome: null,
    };
}

function addLog(message) {
    const entry = document.createElement("p");
    entry.textContent = message;

    elements.gameLog.appendChild(entry);
    elements.gameLog.scrollTop = elements.gameLog.scrollHeight;
}

function getAvailableDestinations() {
    if (!player || player.gameOver) {
        return [];
    }

    return [...LOCATION_CONNECTIONS[player.location]];
}

function movePlayer(destination) {
    if (!player || player.gameOver) {
        return {
            success: false,
            message: "This adventure has already ended.",
        };
    }

    const validDestinations = getAvailableDestinations();

    if (!validDestinations.includes(destination)) {
        return {
            success: false,
            message: "You cannot travel directly to that location.",
        };
    }

    if (
        player.location === "Old Bridge" &&
        destination === "Lighthouse" &&
        !player.inventory.includes("rope")
    ) {
        return {
            success: false,
            message: "You need a rope to cross the old bridge.",
        };
    }

    if (player.energy <= 0) {
        player.energy = 0;
        player.gameOver = true;
        player.won = false;
        player.outcome = "defeat";

        return {
            success: false,
            message: "You have no energy left.",
        };
    }

    player.location = destination;
    player.energy -= 1;

    if (player.energy === 0) {
        player.gameOver = true;
        player.won = false;
        player.outcome = "defeat";

        return {
            success: true,
            message:
                `You reached ${destination}, but your energy is exhausted. ` +
                "The rescue boat could not find you in time.",
        };
    }

    return {
        success: true,
        message: `You travelled to ${destination}.`,
    };
}

function collectItem(item) {
    if (!player || player.gameOver) {
        return {
            success: false,
            message: "You cannot collect items after the adventure ends.",
        };
    }

    if (!Object.hasOwn(ITEM_LOCATIONS, item)) {
        return {
            success: false,
            message: "That item is not available in this adventure.",
        };
    }

    if (ITEM_LOCATIONS[item] !== player.location) {
        return {
            success: false,
            message: `You must be at ${ITEM_LOCATIONS[item]} to collect it.`,
        };
    }

    if (player.inventory.includes(item)) {
        return {
            success: false,
            message: `You have already collected the ${item}.`,
        };
    }

    player.inventory.push(item);

    return {
        success: true,
        message: `You collected the ${item}.`,
    };
}

function lightBeacon() {
    if (!player || player.gameOver) {
        return {
            success: false,
            message: "This adventure has already ended.",
        };
    }

    if (player.location !== "Lighthouse") {
        return {
            success: false,
            message: "You must reach the Lighthouse first.",
        };
    }

    if (!player.inventory.includes("lantern")) {
        return {
            success: false,
            message: "You need a lantern to light the beacon.",
        };
    }

    if (!player.inventory.includes("rope")) {
        return {
            success: false,
            message: "You need the rope to complete your rescue mission.",
        };
    }

    if (player.energy <= 0) {
        return {
            success: false,
            message: "You do not have enough energy.",
        };
    }

    player.beaconLit = true;
    player.won = true;
    player.gameOver = true;
    player.outcome = "victory";

    return {
        success: true,
        message: "You successfully restored the lighthouse beacon!",
    };
}

function finishGame(outcome, message) {
    if (!player || player.gameOver) {
        return;
    }

    player.gameOver = true;
    player.outcome = outcome;

    if (outcome !== "victory") {
        player.won = false;
    }

    addLog(message);
    render();
}

function renderDestinations() {
    elements.destinations.replaceChildren();

    for (const destination of getAvailableDestinations()) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = `Travel to ${destination}`;

        button.addEventListener("click", () => {
            const result = movePlayer(destination);
            addLog(result.message);
            render();
        });

        elements.destinations.appendChild(button);
    }
}

function renderInventory() {
    if (player.inventory.length === 0) {
        elements.inventoryDisplay.textContent =
            "Your inventory is empty.";
        return;
    }

    elements.inventoryDisplay.textContent =
        player.inventory
            .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
            .join(", ");
}

function renderEnding() {
    if (!player.gameOver) {
        elements.endingPanel.hidden = true;
        return;
    }

    // Victory must wait until the rescue animation finishes.
    if (
        player.outcome === "victory" &&
        !victorySequenceComplete
    ) {
        elements.endingPanel.hidden = true;
        return;
    }

    elements.endingPanel.hidden = false;

    if (player.outcome === "victory") {
        elements.endingTitle.textContent = "You are rescued!";

        elements.endingMessage.textContent =
            `Congratulations, ${player.name}! ` +
            "You restored the lighthouse beacon and guided the rescue " +
            "boat safely to the island. Mission completed!";
    } else if (player.outcome === "defeat") {
        elements.endingTitle.textContent = "Game over";

        elements.endingMessage.textContent =
            "You ran out of energy before completing your mission. " +
            "You can try another adventure.";
    } else {
        elements.endingTitle.textContent = "Adventure ended";

        elements.endingMessage.textContent =
            "You chose to leave this adventure. " +
            "You can return and try again.";
    }
}

function render() {
    if (!player) {
        return;
    }

    elements.playerDisplay.textContent = player.name;
    elements.locationDisplay.textContent = player.location;

    elements.energyDisplay.textContent =
        `${player.energy} / ${STARTING_ENERGY}`;

    elements.locationTitle.textContent = player.location;

    elements.locationDescription.textContent =
        LOCATION_DESCRIPTIONS[player.location];

    elements.beaconStatus.textContent = player.beaconLit
        ? "Beacon lit"
        : "Beacon dark";

    renderInventory();
    renderDestinations();

    const actionButtons = [
        elements.lookButton,
        elements.inventoryButton,
        elements.collectButton,
        elements.beaconButton,
        elements.quitButton,
    ];

    for (const button of actionButtons) {
        button.disabled = player.gameOver;
    }

    renderEnding();
}

function startVictorySequence() {
    if (!player || player.outcome !== "victory") {
        return;
    }

    if (victoryCompletionTimer !== null) {
        clearTimeout(victoryCompletionTimer);
        victoryCompletionTimer = null;
    }

    elements.endingPanel.hidden = true;
    elements.victoryScene.hidden = false;

    // Activate the lighthouse, stars, waves and rescue boat.
    elements.victoryScene.classList.add("is-active");

    addLog(
        "The lighthouse beacon shines across the dark ocean!"
    );

    addLog(
        "A rescue boat has spotted your signal and is approaching!"
    );

    // Reduced-motion users should not have to wait for CSS animation.
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const completionDelay = reducedMotion ? 1200 : 8500;

    // Fallback in case the animationend event does not fire.
    victoryCompletionTimer = setTimeout(
        completeVictorySequence,
        completionDelay
    );
}

function completeVictorySequence() {
    if (
        !player ||
        player.outcome !== "victory" ||
        victorySequenceComplete
    ) {
        return;
    }

    victorySequenceComplete = true;

    if (victoryCompletionTimer !== null) {
        clearTimeout(victoryCompletionTimer);
        victoryCompletionTimer = null;
    }

    elements.victoryScene.classList.remove("is-active");
    elements.victoryScene.hidden = true;

    addLog(
        `The rescue boat has arrived! ${player.name} has been rescued!`
    );

    renderEnding();
}

function startGame(name) {
    if (victoryCompletionTimer !== null) {
        clearTimeout(victoryCompletionTimer);
        victoryCompletionTimer = null;
    }

    elements.victoryScene.classList.remove("is-active");

    player = newGame(name);
    victorySequenceComplete = false;
    
    elements.startScreen.hidden = true;
    elements.gameScreen.hidden = false;
    elements.nameError.textContent = "";
    elements.gameLog.replaceChildren();

    elements.victoryScene.hidden = true;
    elements.endingPanel.hidden = true;

    addLog(
        `Welcome, ${player.name}! You begin your adventure at the Beach.`
    );

    addLog(
        "Your mission is to collect the rope and lantern, " +
        "reach the Lighthouse and light the beacon."
    );

    render();
}

elements.startForm.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
        const name = normalizePlayerName(elements.playerName.value);
        startGame(name);
    } catch (error) {
        elements.nameError.textContent = error.message;
        elements.playerName.focus();
    }
});

elements.lookButton.addEventListener("click", () => {
    if (!player || player.gameOver) {
        return;
    }

    addLog(LOCATION_DESCRIPTIONS[player.location]);
});

elements.inventoryButton.addEventListener("click", () => {
    if (!player || player.gameOver) {
        return;
    }

    if (player.inventory.length === 0) {
        addLog("Your inventory is empty.");
    } else {
        addLog(`Inventory: ${player.inventory.join(", ")}.`);
    }
});

elements.collectButton.addEventListener("click", () => {
    if (!player || player.gameOver) {
        return;
    }

    const item = Object.keys(ITEM_LOCATIONS).find(
        (availableItem) =>
            ITEM_LOCATIONS[availableItem] === player.location
    );

    if (!item) {
        addLog("There is no useful item to collect here.");
        return;
    }

    const result = collectItem(item);
    addLog(result.message);
    render();
});

elements.beaconButton.addEventListener("click", () => {
    const result = lightBeacon();
    addLog(result.message);

    render();

    if (result.success) {
        startVictorySequence();
    }
});

elements.quitButton.addEventListener("click", () => {
    finishGame("quit", "You chose to leave this adventure.");
});

elements.replayButton.addEventListener("click", () => {
    if (!player) {
        return;
    }

    startGame(player.name);
});

// The rescue sequence completes when the boat finishes its animation.
elements.rescueBoat.addEventListener(
    "animationend",
    (event) => {
        if (event.animationName === "boat-arrival") {
            completeVictorySequence();
        }
    }
);
