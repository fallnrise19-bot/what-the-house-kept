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
    const bedroomHook = "  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n    if (handleBedroomClock(q, raw)) return;";

    if (!source.includes(oldVersion) || !source.includes(bedroomHook)) {
      throw new Error("v0.3.9 floor-plan parser patch target not found");
    }

    const floorPlanRouting = `  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n    // PLAN / PLANS / FLOORPLAN / FLOORPLANS / FLOOR PLAN / FLOOR PLANS are\n    // one object family and are handled before every generic parser fallback.\n    const floorPlanNoun = /(?:^|\\s)(?:floor plan|floor plans|house plan|house plans|architectural plan|architectural plans|plan|plans)(?:$|\\s)/.test(q);\n    const floorPlanTake = floorPlanNoun && /^(?:take|get|grab|hold|pick up|pickup)\\b/.test(q);\n    const floorPlanInspect = floorPlanNoun && (\n      /^(?:look(?: at)?|examine|inspect|check|study|view|read|open|unfold)\\b/.test(q) ||\n      [\"plan\", \"plans\", \"floor plan\", \"floor plans\", \"house plan\", \"house plans\"].includes(q)\n    );\n\n    if (floorPlanTake || floorPlanInspect) {\n      if (!f.boxUnlocked && !f.floorPlanTaken) {\n        say(\"Thomas has not found a floor plan yet.\", raw);\n        return;\n      }\n\n      if (!f.floorPlanTaken) {\n        f.floorPlanTaken = true;\n        addInventory(\"Folded house floor plan\");\n      }\n\n      if (floorPlanTake) {\n        say(\"Thomas unfolds it enough to confirm what it is. Ground floor. Upper floor. Room measurements. Nothing immediately unusual. He folds it again and keeps it.\", raw);\n      } else {\n        say(\"Thomas unfolds the architectural plan. It shows the ground and upper floors with room dimensions. At first glance it looks ordinary.\", raw);\n      }\n      openFloorPlanPanel();\n      return;\n    }\n\n    if (handleBedroomClock(q, raw)) return;`;

    source = source
      .replace(oldVersion, "const BUILD_VERSION = \"v0.3.9\";")
      .replace(bedroomHook, floorPlanRouting);

    (0, eval)(source);
  } catch (error) {
    console.error("Game failed to load:", error);
    const scene = document.getElementById("scene");
    if (scene) {
      scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
    }
  }
})();
