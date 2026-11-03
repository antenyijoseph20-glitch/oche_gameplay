"use strict";

// Animate the survivor only after a real scene change; safely no-op when the
// scene artwork is unavailable so the core game remains playable.
(() => {
    const scene = document.querySelector("#location-scene");
    const survivor = document.querySelector("#survivor-character");
    if (!scene || !survivor) return;

    let lastSceneClass = scene.className;
    let walkTimer = null;
    const observer = new MutationObserver(() => {
        if (scene.className === lastSceneClass) return;
        lastSceneClass = scene.className;
        survivor.classList.remove("is-walking");
        void survivor.offsetWidth;
        survivor.classList.add("is-walking");
        if (walkTimer !== null) window.clearTimeout(walkTimer);
        walkTimer = window.setTimeout(() => {
            survivor.classList.remove("is-walking");
            walkTimer = null;
        }, 900);
    });

    observer.observe(scene, { attributes: true, attributeFilter: ["class"] });
})();
