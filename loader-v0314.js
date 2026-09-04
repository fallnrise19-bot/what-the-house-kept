(async () => {
  try {
    const priorResponse = await fetch("loader-v0311.js?v=0.3.14-base", { cache: "no-store" });
    if (!priorResponse.ok) throw new Error("Could not load v0.3.11 game loader");

    let priorLoader = await priorResponse.text();
    priorLoader = priorLoader.replace(
      'const BUILD_VERSION = \\\"v0.3.11\\\";',
      'const BUILD_VERSION = \\\"v0.3.14\\\";'
    );

    await (0, eval)(priorLoader);

    const drawerBody = document.getElementById("drawerBody");
    const removeMusicSetting = () => {
      const musicButton = drawerBody?.querySelector('[data-setting="music"]');
      const row = musicButton?.closest(".setting-row");
      if (row) row.remove();
    };

    removeMusicSetting();
    if (drawerBody) {
      new MutationObserver(removeMusicSetting).observe(drawerBody, {
        childList: true,
        subtree: true
      });
    }

    window.__WTHK_AUDIO__ = undefined;
  } catch (error) {
    console.error("v0.3.14 loader failed:", error);
    const scene = document.getElementById("scene");
    if (scene && scene.textContent.includes("Loading prototype")) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
