"use strict";

// Give the illustrated survivor a short walk cycle whenever the location art changes.
const scene = document.querySelector("#location-scene");
const survivor = document.querySelector("#survivor-character");
let lastScene = scene.className;

const sceneObserver = new MutationObserver(() => {
    if (scene.className === lastScene) return;
    lastScene = scene.className;
    survivor.classList.remove("is-walking");
    void survivor.offsetWidth;
    survivor.classList.add("is-walking");
    window.setTimeout(() => survivor.classList.remove("is-walking"), 900);
});

sceneObserver.observe(scene, { attributes: true, attributeFilter: ["class"] });
