(async () => {
  const files = [
    "runtime/v0.3.10/game.part1.b64",
    "runtime/v0.3.10/game.part2.b64",
    "runtime/v0.3.10/game.part3.b64",
    "runtime/v0.3.10/game.part4.b64",
    "runtime/v0.3.10/game.part5a.b64",
    "runtime/v0.3.10/game.part5b.b64",
    "runtime/v0.3.10/game.part6a.b64",
    "runtime/v0.3.10/game.part6b.b64",
    "runtime/v0.3.10/game.part7.b64"
  ];

  try {
    const chunks = await Promise.all(
      files.map(async (path) => {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return (await response.text()).trim();
      })
    );

    const binary = atob(chunks.join(""));
    const compressed = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const stream = new Blob([compressed])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    const source = await new Response(stream).text();

    (0, eval)(source);
  } catch (error) {
    console.error("Game failed to load:", error);
    const scene = document.getElementById("scene");
    if (scene) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
