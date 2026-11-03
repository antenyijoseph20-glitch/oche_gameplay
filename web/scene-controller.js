"use strict";

// Keep the illustrated environment synchronized with the game's existing
// location/title and inventory state. The core game remains the source of truth.
(() => {
    const scene = document.querySelector("#location-scene");
    const title = document.querySelector("#location-title");
    const description = document.querySelector("#location-description");
    const beaconStatus = document.querySelector("#beacon-status");
    const landmark = document.querySelector("#scene-landmark");
    const object = document.querySelector("#scene-object");
    const caption = document.querySelector("#scene-caption");
    const inventory = document.querySelector("#inventory-display");

    if (!scene || !title || !description || !beaconStatus || !landmark || !object || !caption || !inventory) {
        console.error("Island scene setup is incomplete; check required scene element IDs in index.html.");
        return;
    }

    const views = {
        Beach: { className: "scene-beach", landmark: "⌂", caption: "A lonely shore beneath the storm clouds", object: "" },
        Jungle: { className: "scene-jungle", landmark: "♠", caption: "Wind bends the palms over a hidden trail", object: "🪢" },
        Cave: { className: "scene-cave", landmark: "◉", caption: "Cold blue light reveals an old lantern", object: "🏮" },
        "Old Bridge": { className: "scene-bridge", landmark: "⌁", caption: "Weathered timber spans the restless tide", object: "" },
        Lighthouse: { className: "scene-lighthouse", landmark: "⌂", caption: "An ancient lighthouse guards the horizon", object: "✦" },
    };

    function updateScene() {
        const location = title.textContent.trim();
        const view = views[location];
        if (!view) return;

        scene.className = `location-scene ${view.className}`;
        scene.setAttribute("aria-label", `Illustrated ${location.toLowerCase()} scene`);
        landmark.textContent = view.landmark;
        caption.textContent = view.caption;

        const itemAlreadyCollected = (view.object === "🪢" && /rope/i.test(inventory.textContent))
            || (view.object === "🏮" && /lantern/i.test(inventory.textContent));
        object.textContent = itemAlreadyCollected ? "" : view.object;

        if (location === "Lighthouse" && beaconStatus.textContent.toLowerCase().includes("lit")) {
            scene.classList.add("beacon-active");
            caption.textContent = "The rescue light awakens above the sea";
        }
    }

    const observer = new MutationObserver(updateScene);
    observer.observe(title, { childList: true, characterData: true, subtree: true });
    observer.observe(beaconStatus, { childList: true, characterData: true, subtree: true });
    observer.observe(inventory, { childList: true, characterData: true, subtree: true });
    updateScene();
})();
