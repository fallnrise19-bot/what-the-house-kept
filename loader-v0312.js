(async () => {
  try {
    const priorResponse = await fetch("loader-v0311.js?v=0.3.12-base", { cache: "no-store" });
    if (!priorResponse.ok) throw new Error("Could not load v0.3.11 game loader");
    let priorLoader = await priorResponse.text();
    priorLoader = priorLoader.replace(
      'const BUILD_VERSION = \\"v0.3.11\\";',
      'const BUILD_VERSION = \\"v0.3.12\\";'
    );
    await (0, eval)(priorLoader);

    const musicFiles = [
      "audio-loop-runtime/v0.3.12/one-last-morning-loop.part01.b64",
      "audio-loop-runtime/v0.3.12/one-last-morning-loop.part02.b64",
      "audio-loop-runtime/v0.3.12/one-last-morning-loop.part03.b64",
      "audio-loop-runtime/v0.3.12/one-last-morning-loop.part04.b64"
    ];
    const TARGET_VOLUME = 0.07;
    const FADE_MS = 2800;
    let userActivated = false;
    let musicReady = false;
    let fadeFrame = 0;
    let audio = null;

    function musicSettingOn() {
      try {
        const saved = JSON.parse(localStorage.getItem("wthk-starter-v0.3.3") || "null");
        return saved?.settings?.music !== false;
      } catch (_) {
        return true;
      }
    }

    function inOpeningSuite() {
      const room = (document.getElementById("roomName")?.textContent || "").trim().toLowerCase();
      return room === "master bedroom" || room === "ensuite";
    }

    function fadeTo(target, pauseAfter = false) {
      if (!audio) return;
      cancelAnimationFrame(fadeFrame);
      const from = audio.volume;
      const started = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - started) / FADE_MS);
        audio.volume = Math.max(0, Math.min(1, from + (target - from) * t));
        if (t < 1) {
          fadeFrame = requestAnimationFrame(step);
        } else if (pauseAfter && target === 0) {
          audio.pause();
        }
      };
      fadeFrame = requestAnimationFrame(step);
    }

    async function syncMusic() {
      if (!musicReady || !audio) return;
      const shouldPlay = userActivated && musicSettingOn() && inOpeningSuite();
      if (!shouldPlay) {
        if (!audio.paused || audio.volume > 0) fadeTo(0, true);
        return;
      }
      if (audio.paused) {
        try {
          await audio.play();
        } catch (_) {
          return;
        }
      }
      fadeTo(TARGET_VOLUME, false);
    }

    function activateAudio() {
      if (userActivated) return;
      userActivated = true;
      document.removeEventListener("pointerdown", activateAudio, true);
      document.removeEventListener("keydown", activateAudio, true);
      syncMusic();
    }

    document.addEventListener("pointerdown", activateAudio, true);
    document.addEventListener("keydown", activateAudio, true);
    document.addEventListener("click", () => setTimeout(syncMusic, 0));
    document.addEventListener("submit", () => setTimeout(syncMusic, 0));

    const roomName = document.getElementById("roomName");
    if (roomName) new MutationObserver(syncMusic).observe(roomName, { childList: true, subtree: true, characterData: true });

    const musicParts = await Promise.all(musicFiles.map(async (path) => {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load ${path}`);
      return (await response.text()).trim();
    }));
    const binary = atob(musicParts.join(""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const musicUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
    audio = new Audio(musicUrl);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    musicReady = true;

    window.__WTHK_AUDIO__ = {
      audio,
      targetVolume: TARGET_VOLUME,
      get userActivated() { return userActivated; },
      get inOpeningSuite() { return inOpeningSuite(); },
      get musicSettingOn() { return musicSettingOn(); },
      sync: syncMusic
    };
    syncMusic();
  } catch (error) {
    console.error("v0.3.12 loader failed:", error);
    const scene = document.getElementById("scene");
    if (scene && scene.textContent.includes("Loading prototype")) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
