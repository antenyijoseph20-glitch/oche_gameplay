"use strict";

const MAX_NAME_LENGTH = 40;
const STARTING_ENERGY = 5;
const SAVE_KEY = "oche-mystery-island-save-v1";
const LOCATIONS = ["Beach", "Jungle", "Cave", "Old Bridge", "Lighthouse"];
const LOCATION_CONNECTIONS = {
    Beach: ["Jungle"],
    Jungle: ["Beach", "Cave"],
    Cave: ["Jungle", "Old Bridge"],
    "Old Bridge": ["Cave", "Lighthouse"],
    Lighthouse: ["Old Bridge"],
};
const LOCATION_DESCRIPTIONS = {
    Beach: "You are standing on the sandy Beach of Mystery Island. The old ocean rolls behind you, and a narrow path leads inland.",
    Jungle: "You are deep inside the wind-bent Jungle. A sturdy rope lies among the roots, and a path leads toward a Cave.",
    Cave: "You have entered a cool, dark Cave. An old lantern rests against the wall. The stone path continues to the Old Bridge.",
    "Old Bridge": "You stand beside the weathered Old Bridge. It leads toward the lighthouse, but the crossing is unsafe without a rope.",
    Lighthouse: "You have reached the ancient Lighthouse. Its beacon is dark, waiting for a lantern to guide a rescue boat across the ocean.",
};
const SCENES = {
    Beach: { caption: "A quiet shore beneath a restless sky", landmark: "⌂", object: "", icon: "beach" },
    Jungle: { caption: "Wind whispers through the island forest", landmark: "♠", object: "🪢", icon: "jungle" },
    Cave: { caption: "A lantern waits in the blue-black stone", landmark: "◉", object: "🏮", icon: "cave" },
    "Old Bridge": { caption: "Ancient timber spans the churning tide", landmark: "⌁", object: "", icon: "bridge" },
    Lighthouse: { caption: "The old lighthouse watches the horizon", landmark: "⌂", object: "✦", icon: "lighthouse" },
};
const ITEM_LOCATIONS = { rope: "Jungle", lantern: "Cave" };
const elements = {
    startScreen: document.querySelector("#start-screen"), startForm: document.querySelector("#start-form"),
    playerName: document.querySelector("#player-name"), nameError: document.querySelector("#name-error"),
    continueButton: document.querySelector("#continue-button"), gameScreen: document.querySelector("#game-screen"),
    playerDisplay: document.querySelector("#player-display"), locationDisplay: document.querySelector("#location-display"),
    energyDisplay: document.querySelector("#energy-display"), energyMeter: document.querySelector("#energy-meter"),
    locationTitle: document.querySelector("#location-title"), locationDescription: document.querySelector("#location-description"),
    locationScene: document.querySelector("#location-scene"), sceneCaption: document.querySelector("#scene-caption"),
    sceneLandmark: document.querySelector("#scene-landmark"), sceneObject: document.querySelector("#scene-object"),
    beaconStatus: document.querySelector("#beacon-status"), lookButton: document.querySelector("#look-button"),
    inventoryButton: document.querySelector("#inventory-button"), collectButton: document.querySelector("#collect-button"),
    beaconButton: document.querySelector("#beacon-button"), quitButton: document.querySelector("#quit-button"),
    islandMap: document.querySelector("#island-map"), inventoryDisplay: document.querySelector("#inventory-display"),
    ropeQuest: document.querySelector("#rope-quest"), lanternQuest: document.querySelector("#lantern-quest"),
    beaconQuest: document.querySelector("#beacon-quest"), gameLog: document.querySelector("#game-log"),
    victoryScene: document.querySelector("#victory-scene"), rescueBoat: document.querySelector(".rescue-boat"),
    endingPanel: document.querySelector("#ending-panel"), endingTitle: document.querySelector("#ending-title"),
    endingMessage: document.querySelector("#ending-message"), replayButton: document.querySelector("#replay-button"),
};

let player = null;
let victorySequenceComplete = false;
let victoryCompletionTimer = null;

function normalizePlayerName(value) {
    if (typeof value !== "string") throw new Error("Please enter a valid name.");
    const name = value.normalize("NFC").trim().replace(/\s+/gu, " ");
    if (!name) throw new Error("Your name cannot be empty.");
    if (Array.from(name).length > MAX_NAME_LENGTH) throw new Error(`Your name must not exceed ${MAX_NAME_LENGTH} characters.`);
    if (!/^[\p{L}\p{N}\s\-'.,’]+$/u.test(name)) throw new Error("Use letters, numbers, spaces, hyphens, apostrophes, full stops or commas only.");
    if (!/\p{L}/u.test(name)) throw new Error("Your name must contain at least one letter.");
    return name;
}

function newGame(name) {
    return { name, location: "Beach", energy: STARTING_ENERGY, inventory: [], beaconLit: false, gameOver: false, won: false, outcome: null };
}

function validSavedGame(value) {
    return value && typeof value.name === "string" && LOCATIONS.includes(value.location)
        && Number.isInteger(value.energy) && value.energy > 0 && value.energy <= STARTING_ENERGY
        && Array.isArray(value.inventory) && value.inventory.every((item) => Object.hasOwn(ITEM_LOCATIONS, item))
        && value.gameOver === false && value.won === false && value.beaconLit === false;
}

function readSavedGame() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        return validSavedGame(saved) ? saved : null;
    } catch {
        return null;
    }
}

function saveProgress() {
    if (!player || player.gameOver) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch { /* Storage can be disabled or full. */ }
}

function clearSavedGame() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* Game remains playable without storage. */ }
}

function addLog(message) {
    const entry = document.createElement("p");
    entry.textContent = message;
    elements.gameLog.appendChild(entry);
    elements.gameLog.scrollTop = elements.gameLog.scrollHeight;
}

function getAvailableDestinations() {
    return !player || player.gameOver ? [] : [...(LOCATION_CONNECTIONS[player.location] || [])];
}

function movePlayer(destination) {
    if (!player || player.gameOver) return { success: false, message: "This adventure has already ended." };
    if (!getAvailableDestinations().includes(destination)) return { success: false, message: "You cannot travel directly to that location." };
    if (player.location === "Old Bridge" && destination === "Lighthouse" && !player.inventory.includes("rope")) {
        return { success: false, message: "The old bridge is too dangerous to cross without a rope." };
    }
    if (player.energy <= 0) return { success: false, message: "You have no energy left." };
    player.location = destination;
    player.energy -= 1;
    if (player.energy === 0) {
        player.gameOver = true;
        player.outcome = "defeat";
        return { success: true, message: `You reached ${destination}, but your last energy point is gone. The rescue boat could not find you in time.` };
    }
    return { success: true, message: `You travelled to ${destination}. One energy point was used.` };
}

function collectItem(item) {
    if (!player || player.gameOver) return { success: false, message: "You cannot collect items after the adventure ends." };
    if (!Object.hasOwn(ITEM_LOCATIONS, item)) return { success: false, message: "That item is not available." };
    if (ITEM_LOCATIONS[item] !== player.location) return { success: false, message: `You must be in the ${ITEM_LOCATIONS[item]} to collect it.` };
    if (player.inventory.includes(item)) return { success: false, message: `You have already collected the ${item}.` };
    player.inventory.push(item);
    return { success: true, message: `You collected the ${item}. It has been added to your pack.` };
}

function lightBeacon() {
    if (!player || player.gameOver) return { success: false, message: "This adventure has already ended." };
    if (player.location !== "Lighthouse") return { success: false, message: "You must reach the Lighthouse first." };
    if (!player.inventory.includes("lantern")) return { success: false, message: "You need a lantern to light the beacon." };
    if (!player.inventory.includes("rope")) return { success: false, message: "You need the rope to complete your rescue mission." };
    if (player.energy <= 0) return { success: false, message: "You do not have enough energy." };
    player.beaconLit = true;
    player.won = true;
    player.gameOver = true;
    player.outcome = "victory";
    clearSavedGame();
    return { success: true, message: "The ancient beacon bursts into life. A rescue ship answers your signal!" };
}

function finishGame(outcome, message) {
    if (!player || player.gameOver) return;
    player.gameOver = true;
    player.outcome = outcome;
    player.won = false;
    clearSavedGame();
    addLog(message);
    render();
}

function renderMap() {
    elements.islandMap.replaceChildren();
    for (const [index, location] of LOCATIONS.entries()) {
        const node = document.createElement("button");
        const isCurrent = player.location === location;
        const connected = getAvailableDestinations().includes(location);
        const locked = player.location === "Old Bridge" && location === "Lighthouse" && !player.inventory.includes("rope");
        node.type = "button";
        node.className = `map-node${isCurrent ? " is-current" : ""}${connected ? " is-reachable" : ""}`;
        node.textContent = location;
        node.disabled = !connected || player.gameOver || locked;
        node.setAttribute("aria-label", `${location}${isCurrent ? ", current location" : connected && !locked ? ", travel here, costs one energy" : locked ? ", locked, rope required" : ", not directly connected"}`);
        if (isCurrent) node.setAttribute("aria-current", "location");
        node.addEventListener("click", () => travelTo(location));
        elements.islandMap.appendChild(node);
        if (index < LOCATIONS.length - 1) {
            const connector = document.createElement("span");
            connector.className = "map-connector";
            connector.setAttribute("aria-hidden", "true");
            elements.islandMap.appendChild(connector);
        }
    }
}

function renderInventory() {
    elements.inventoryDisplay.textContent = player.inventory.length
        ? player.inventory.map((item) => item[0].toUpperCase() + item.slice(1)).join(" · ")
        : "Your inventory is empty.";
    elements.ropeQuest.classList.toggle("is-complete", player.inventory.includes("rope"));
    elements.lanternQuest.classList.toggle("is-complete", player.inventory.includes("lantern"));
    elements.beaconQuest.classList.toggle("is-complete", player.beaconLit);
}

function renderEnding() {
    if (!player.gameOver || (player.outcome === "victory" && !victorySequenceComplete)) {
        elements.endingPanel.hidden = true;
        return;
    }
    elements.endingPanel.hidden = false;
    if (player.outcome === "victory") {
        elements.endingTitle.textContent = "You are rescued!";
        elements.endingMessage.textContent = `Congratulations, ${player.name}. You restored the lighthouse beacon and guided the rescue boat safely to the island.`;
    } else if (player.outcome === "defeat") {
        elements.endingTitle.textContent = "The island grows quiet";
        elements.endingMessage.textContent = "You ran out of energy before completing the mission. Rest, then try another route.";
    } else {
        elements.endingTitle.textContent = "Adventure ended";
        elements.endingMessage.textContent = "You chose to leave this adventure. The island will be here if you return.";
    }
}

function render() {
    if (!player) return;
    elements.playerDisplay.textContent = player.name;
    elements.locationDisplay.textContent = player.location;
    elements.energyDisplay.textContent = `${player.energy} / ${STARTING_ENERGY}`;
    elements.energyMeter.value = player.energy;
    elements.locationTitle.textContent = player.location;
    elements.locationDescription.textContent = LOCATION_DESCRIPTIONS[player.location];
    elements.beaconStatus.textContent = player.beaconLit ? "Beacon lit" : "Beacon dark";
    const scene = SCENES[player.location];
    elements.locationScene.className = `location-scene scene-${scene.icon}${player.beaconLit ? " beacon-active" : ""}`;
    elements.locationScene.setAttribute("aria-label", `Illustrated ${player.location.toLowerCase()} scene`);
    elements.sceneCaption.textContent = scene.caption;
    elements.sceneLandmark.textContent = scene.landmark;
    elements.sceneObject.textContent = player.inventory.includes(player.location === "Jungle" ? "rope" : "lantern") ? "" : scene.object;
    renderInventory();
    renderMap();
    for (const button of [elements.lookButton, elements.inventoryButton, elements.collectButton, elements.beaconButton, elements.quitButton]) button.disabled = player.gameOver;
    elements.collectButton.textContent = player.location === "Jungle" && player.inventory.includes("rope") || player.location === "Cave" && player.inventory.includes("lantern") ? "Item collected" : "Collect item";
    renderEnding();
}

function completeVictorySequence() {
    if (!player || player.outcome !== "victory" || victorySequenceComplete) return;
    victorySequenceComplete = true;
    if (victoryCompletionTimer !== null) clearTimeout(victoryCompletionTimer);
    victoryCompletionTimer = null;
    elements.victoryScene.classList.remove("is-active");
    elements.victoryScene.hidden = true;
    addLog(`${player.name} has been rescued. Your journey is complete!`);
    renderEnding();
}

function startVictorySequence() {
    elements.victoryScene.hidden = false;
    elements.victoryScene.classList.add("is-active");
    addLog("The lighthouse beam sweeps across the ancient ocean.");
    addLog("A rescue boat has spotted your signal and is approaching!");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    victoryCompletionTimer = setTimeout(completeVictorySequence, reducedMotion ? 400 : 8000);
}

function showGame() {
    elements.startScreen.hidden = true;
    elements.gameScreen.hidden = false;
    elements.nameError.textContent = "";
    elements.victoryScene.hidden = true;
    elements.endingPanel.hidden = true;
    elements.gameLog.replaceChildren();
    addLog(`Welcome, ${player.name}. You wake on the Beach with ${player.energy} energy points.`);
    addLog("Find the rope and lantern, cross the old bridge, then light the lighthouse beacon.");
    render();
}

function startGame(name) {
    if (victoryCompletionTimer !== null) clearTimeout(victoryCompletionTimer);
    victoryCompletionTimer = null;
    victorySequenceComplete = false;
    elements.victoryScene.classList.remove("is-active");
    player = newGame(name);
    clearSavedGame();
    showGame();
    saveProgress();
}

function continueGame() {
    const saved = readSavedGame();
    if (!saved) {
        elements.continueButton.hidden = true;
        return;
    }
    player = { ...saved, inventory: [...saved.inventory] };
    victorySequenceComplete = false;
    showGame();
    addLog("Your saved adventure has been restored.");
}

function travelTo(destination) {
    const result = movePlayer(destination);
    addLog(result.message);
    if (player.gameOver) clearSavedGame(); else saveProgress();
    render();
}

elements.startForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try { startGame(normalizePlayerName(elements.playerName.value)); }
    catch (error) { elements.nameError.textContent = error.message; elements.playerName.focus(); }
});

elements.continueButton.addEventListener("click", continueGame);
elements.lookButton.addEventListener("click", () => { if (player && !player.gameOver) addLog(LOCATION_DESCRIPTIONS[player.location]); });
elements.inventoryButton.addEventListener("click", () => { if (player && !player.gameOver) addLog(player.inventory.length ? `In your pack: ${player.inventory.join(", ")}.` : "Your inventory is empty."); });
elements.collectButton.addEventListener("click", () => {
    if (!player || player.gameOver) return;
    const item = Object.keys(ITEM_LOCATIONS).find((candidate) => ITEM_LOCATIONS[candidate] === player.location);
    if (!item) { addLog("There is no useful item to collect here."); return; }
    const result = collectItem(item);
    addLog(result.message);
    if (result.success) { elements.locationScene.classList.remove("item-found"); void elements.locationScene.offsetWidth; elements.locationScene.classList.add("item-found"); }
    saveProgress();
    render();
});
elements.beaconButton.addEventListener("click", () => {
    const result = lightBeacon();
    addLog(result.message);
    render();
    if (result.success) startVictorySequence();
});
elements.quitButton.addEventListener("click", () => finishGame("quit", "You chose to end this adventure."));
elements.replayButton.addEventListener("click", () => { if (player) startGame(player.name); });
elements.rescueBoat.addEventListener("animationend", (event) => { if (event.animationName === "boat-arrival") completeVictorySequence(); });

const initialSave = readSavedGame();
if (initialSave) {
    elements.continueButton.hidden = false;
    elements.continueButton.textContent = `Continue ${initialSave.name}'s adventure (${initialSave.energy} energy)`;
}
