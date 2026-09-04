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
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
    let source = await new Response(stream).text();

    const oldVersion = "const BUILD_VERSION = \"v0.3.10\";";
    const oldFloorPlanPanel = "  function openFloorPlanPanel() {\n    navButtons.forEach(btn => btn.classList.remove(\"active\"));\n    drawer.classList.add(\"open\");\n    drawerTitle.textContent = \"House Floor Plan\";\n    drawerBody.innerHTML = `\n      <div class=\"floorplan-note\">Old architectural plan. Room labels are Thomas's present reading of the drawing.</div>\n      <div class=\"floorplan-grid\">\n        <section class=\"floorplan-floor\">\n          <h3>Ground Floor</h3>\n          <div class=\"floorplan-room\"><b>Living Room</b><span>14 × 18</span></div>\n          <div class=\"floorplan-room\"><b>Dining Room</b><span>14 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Kitchen</b><span>14 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Sunroom / Family Room</b><span>14 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Central Hall</b><span>10 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Mudroom</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Vestibule</b><span>6 × 8</span></div>\n          <div class=\"floorplan-room\"><b>Pantry</b><span>5 × 6</span></div>\n          <div class=\"floorplan-room\"><b>Powder Room</b><span>5 × 6</span></div>\n        </section>\n        <section class=\"floorplan-floor\">\n          <h3>Upper Floor</h3>\n          <div class=\"floorplan-room\"><b>Master Bedroom</b><span>14 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Ensuite</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Guest Bedroom</b><span>13 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Storage</b><span>12 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Main Bathroom</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Landing / Hall</b><span>approx. 10 × 14</span></div>\n          <div class=\"floorplan-room\"><b>Linen Closet</b><span>4 × 6</span></div>\n        </section>\n      </div>\n      <p class=\"floorplan-caption\">The far room is marked <strong>Storage</strong>. Nothing on the plan identifies it as anyone's bedroom.</p>\n    `;\n  }";
    const newFloorPlanPanel = "  function openFloorPlanPanel() {\n    navButtons.forEach(btn => btn.classList.remove(\"active\"));\n    drawer.classList.add(\"open\");\n    drawerTitle.textContent = \"House Floor Plan\";\n    drawerBody.innerHTML = `\n      <div class=\"floorplan-note\">Old architectural plan. Room labels are Thomas's present reading of the drawing.</div>\n      <div class=\"floorplan-grid\">\n        <section class=\"floorplan-floor\">\n          <h3>Ground Floor</h3>\n          <div class=\"floorplan-room\"><b>Living Room</b><span>14 × 18</span></div>\n          <div class=\"floorplan-room\"><b>Dining Room</b><span>14 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Kitchen</b><span>14 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Sunroom / Family Room</b><span>14 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Central Hall</b><span>10 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Mudroom</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Vestibule</b><span>6 × 8</span></div>\n          <div class=\"floorplan-room\"><b>Pantry</b><span>5 × 6</span></div>\n          <div class=\"floorplan-room\"><b>Powder Room</b><span>5 × 6</span></div>\n        </section>\n        <section class=\"floorplan-floor\">\n          <h3>Upper Floor</h3>\n          <div class=\"floorplan-room\"><b>Master Bedroom</b><span>14 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Ensuite</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Guest Bedroom</b><span>13 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Storage</b><span>12 × 15</span></div>\n          <div class=\"floorplan-room\"><b>Main Bathroom</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Landing / Hall</b><span>approx. 10 × 14</span></div>\n          <div class=\"floorplan-room\"><b>Linen Closet</b><span>4 × 6</span></div>\n        </section>\n        <section class=\"floorplan-floor\">\n          <h3>Basement</h3>\n          <div class=\"floorplan-room\"><b>Utility / Laundry</b><span>12 × 14</span></div>\n          <div class=\"floorplan-room\"><b>Workshop</b><span>14 × 14</span></div>\n          <div class=\"floorplan-room\"><b>Storage</b><span>26 × 18</span></div>\n        </section>\n        <section class=\"floorplan-floor\">\n          <h3>Attic</h3>\n          <div class=\"floorplan-room\"><b>Office</b><span>14 × 17</span></div>\n          <div class=\"floorplan-room\"><b>Attic Storage</b><span>14 × 16</span></div>\n          <div class=\"floorplan-room\"><b>Box / Half Bath</b><span>8 × 10</span></div>\n          <div class=\"floorplan-room\"><b>Eaves</b><span>unmeasured</span></div>\n        </section>\n      </div>\n    `;\n  }";

    if (!source.includes(oldVersion) || !source.includes(oldFloorPlanPanel)) {
      throw new Error("v0.3.11 floor-plan panel patch target not found");
    }

    source = source
      .replace(oldVersion, "const BUILD_VERSION = \"v0.3.11\";")
      .replace(oldFloorPlanPanel, newFloorPlanPanel);

    (0, eval)(source);
  } catch (error) {
    console.error("Game failed to load:", error);
    const scene = document.getElementById("scene");
    if (scene) scene.innerHTML = '<p class="response">The prototype failed to load. Please refresh the page.</p>';
  }
})();
