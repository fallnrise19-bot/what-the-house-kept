(async () => {
  const files = Array.from({ length: 24 }, (_, i) =>
    `runtime/game.gz.part${String(i + 1).padStart(2, "0")}.b64`
  );

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
    let source = await new Response(stream).text();

    const oldVersion = "const BUILD_VERSION = \"v0.3.7\";";
    const oldFloorPlanHook = "  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n    if (handleBedroomClock(q, raw)) return;";
    if (!source.includes(oldVersion) || !source.includes(oldFloorPlanHook)) {
      throw new Error("v0.3.8 floor-plan hotfix target not found");
    }
    source = source
      .replace(oldVersion, "const BUILD_VERSION = \"v0.3.8\";")
      .replace(oldFloorPlanHook, "  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n    // Floor-plan inspection is deliberately handled before the general object\n    // families. Players naturally type LOOK AT FLOORPLAN / LOOK AT FLOOR PLAN /\n    // EXAMINE PLANS, and this should never fall through to generic LOOK.\n    const isFloorPlanInspect =\n      (hasAny(q, [\"look\", \"look at\", \"examine\", \"inspect\", \"check\", \"study\", \"view\", \"read\"]) &&\n       hasAny(q, [\"floor plan\", \"house plan\", \"house plans\", \"architectural plan\", \"plans\"])) ||\n      hasAny(q, [\"open floor plan\", \"unfold floor plan\", \"view floor plan\", \"read floor plan\"]) ||\n      q === \"floor plan\" || q === \"house plan\";\n\n    if (isFloorPlanInspect) {\n      if (!f.boxUnlocked && !f.floorPlanTaken) {\n        say(\"Thomas has not found a floor plan yet.\", raw);\n      } else {\n        if (!f.floorPlanTaken) {\n          f.floorPlanTaken = true;\n          addInventory(\"Folded house floor plan\");\n        }\n        say(\"Thomas unfolds the architectural plan. It shows the ground and upper floors with room dimensions. At first glance it looks ordinary.\", raw);\n        openFloorPlanPanel();\n      }\n      return;\n    }\n\n    if (handleBedroomClock(q, raw)) return;");

    (0, eval)(source);
  } catch (error) {
    console.error("Game failed to load:", error);
    const scene = document.getElementById("scene");
    if (scene) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
