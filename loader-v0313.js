(async () => {
  const musicFiles = [
    "audio-loop-runtime/v0.3.12/one-last-morning-loop.part01.b64",
    "audio-loop-runtime/v0.3.12/one-last-morning-loop.part02.b64",
    "audio-loop-runtime/v0.3.12/one-last-morning-loop.part03.b64",
    "audio-loop-runtime/v0.3.12/one-last-morning-loop.part04.b64"
  ];
  const TARGET_VOLUME = 0.07;
  const FADE_SECONDS = 1.6;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioContextClass ? new AudioContextClass() : null;
  const gain = audioContext ? audioContext.createGain() : null;
  if (gain && audioContext) {
    gain.gain.value = 0;
    gain.connect(audioContext.destination);
  }

  let userActivated = false;
  let musicBuffer = null;
  let source = null;
  let sourceStartedAt = 0;
  let sourceOffset = 0;

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

  function stopSource() {
    if (!source || !audioContext) return;
    try {
      const elapsed = Math.max(0, audioContext.currentTime - sourceStartedAt);
      if (musicBuffer?.duration) sourceOffset = (sourceOffset + elapsed) % musicBuffer.duration;
      source.stop();
    } catch (_) {}
    try { source.disconnect(); } catch (_) {}
    source = null;
  }

  function setGain(target, immediate = false) {
    if (!gain || !audioContext) return;
    const now = audioContext.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    if (immediate) {
      gain.gain.value = target;
      gain.gain.setValueAtTime(target, now);
    } else {
      gain.gain.linearRampToValueAtTime(target, now + FADE_SECONDS);
    }
  }

  function startSource() {
    if (!audioContext || !gain || !musicBuffer || source) return;
    const next = audioContext.createBufferSource();
    next.buffer = musicBuffer;
    next.loop = true;
    next.connect(gain);
    const offset = musicBuffer.duration ? sourceOffset % musicBuffer.duration : 0;
    next.start(0, offset);
    sourceStartedAt = audioContext.currentTime;
    source = next;
  }

  async function syncMusic({ immediateOff = false } = {}) {
    if (!audioContext || !gain) return;
    const shouldPlay = userActivated && musicBuffer && musicSettingOn() && inOpeningSuite();
    if (!shouldPlay) {
      if (immediateOff || !musicSettingOn()) {
        setGain(0, true);
        stopSource();
      } else if (source) {
        setGain(0, false);
        window.setTimeout(() => {
          if (!musicSettingOn() || !inOpeningSuite()) stopSource();
        }, Math.ceil(FADE_SECONDS * 1000) + 80);
      }
      return;
    }

    if (audioContext.state !== "running") {
      try { await audioContext.resume(); } catch (_) { return; }
    }
    startSource();
    setGain(TARGET_VOLUME, false);
  }

  async function activateAudio() {
    if (userActivated) return;
    userActivated = true;
    if (audioContext && audioContext.state !== "running") {
      try { await audioContext.resume(); } catch (_) {}
    }
    syncMusic();
  }

  document.addEventListener("pointerdown", activateAudio, { capture: true, passive: true, once: true });
  document.addEventListener("keydown", activateAudio, { capture: true, once: true });
  document.addEventListener("touchstart", activateAudio, { capture: true, passive: true, once: true });

  document.addEventListener("click", (event) => {
    const musicButton = event.target.closest?.('[data-setting="music"]');
    if (musicButton) {
      userActivated = true;
      if (audioContext && audioContext.state !== "running") audioContext.resume().catch(() => {});
      setTimeout(() => syncMusic({ immediateOff: !musicSettingOn() }), 0);
      return;
    }
    setTimeout(() => syncMusic(), 0);
  });
  document.addEventListener("submit", () => setTimeout(() => syncMusic(), 0));

  try {
    const musicPromise = Promise.all(musicFiles.map(async (path) => {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load ${path}`);
      return (await response.text()).trim();
    }));

    const priorResponse = await fetch("loader-v0311.js?v=0.3.13-base", { cache: "no-store" });
    if (!priorResponse.ok) throw new Error("Could not load v0.3.11 game loader");
    let priorLoader = await priorResponse.text();
    priorLoader = priorLoader.replace(
      'const BUILD_VERSION = \\"v0.3.11\\";',
      'const BUILD_VERSION = \\"v0.3.13\\";'
    );
    await (0, eval)(priorLoader);

    const roomName = document.getElementById("roomName");
    if (roomName) new MutationObserver(() => syncMusic()).observe(roomName, { childList: true, subtree: true, characterData: true });

    if (!audioContext) throw new Error("Web Audio is not available in this browser");
    const musicParts = await musicPromise;
    const binary = atob(musicParts.join(""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    musicBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
    syncMusic();

    window.__WTHK_AUDIO__ = {
      audioContext,
      gain,
      targetVolume: TARGET_VOLUME,
      get userActivated() { return userActivated; },
      get ready() { return !!musicBuffer; },
      get playing() { return !!source; },
      get currentGain() { return gain?.gain.value ?? 0; },
      get musicSettingOn() { return musicSettingOn(); },
      get inOpeningSuite() { return inOpeningSuite(); },
      sync: syncMusic
    };
  } catch (error) {
    console.error("v0.3.13 loader failed:", error);
    const scene = document.getElementById("scene");
    if (scene && scene.textContent.includes("Loading prototype")) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
