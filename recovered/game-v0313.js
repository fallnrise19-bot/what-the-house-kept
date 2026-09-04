(() => {
  "use strict";

  const BUILD_VERSION = "v0.3.13";
  const SAVE_KEY = "wthk-starter-v0.3.3"; // v0.3.7 remains save-compatible with v0.3.3-v0.3.6.

  const initialState = () => ({
    room: "bedroom",
    inventory: ["House keys", "Phone", "Wallet"],
    journal: [
      "Back in the house after fourteen months. I arrived late last night and went straight upstairs."
    ],
    outside: [],
    outsideLocations: {},
    flags: {
      introSeen: false,
      bedroomDoorOpen: false,
      hallSeen: false,
      tableMoved: false,
      drawerOpened: false,
      drawerBroken: false,
      brassKeySeen: false,
      brassKeyTaken: false,
      brassKeyLocation: "hidden",
      drawerJammed: false,
      drawerForceAttempts: 0,
      drawerImpactAttempts: 0,
      chargerTaken: false,
      boxUnlocked: false,
      floorPlanTaken: false,
      photoTaken: false,
      photoExamined: false,
      photoTriedInFrame: false,
      bedMoved: false,
      starSeen: false,
      starTaken: false,
      envelopeOpened: false,
      clinicalNoteRead: false,
      scratchesExamined: false,
      scratchesMeasured: false,
      curtainsOpen: false,
      curtainsDown: false,
      windowOpen: false,
      glassBroken: false,
      mirrorCoveredBedroom: false,
      mattressFlipped: false,
      stoolMoved: false,
      stoolTaken: false,
      crayonSeen: false,
      cartoonBandageSeen: false,
      cartoonBandageTaken: false,
      hairbrushTaken: false,
      hairRemoved: false,
      bathroomMirrorCovered: false,
      bathroomWaterRunning: false,
      showerRunning: false,
      bathroomFloorWet: false,
      hairDryerTaken: false,
      screwdriverTaken: false,
      tweezersTaken: false,
      nailScissorsTaken: false,
      compactMirrorTaken: false,
      bobbyPinTaken: false,
      toiletPaperTaken: false,
      bathroomVisited: false,
      pillowFort: false,
      slipperHandsDone: false,
      wearingSlippers: false,
      slippersByBed: false,
      wallLicked: false,
      doorKnockCount: 0,
      mirrorKnockCount: 0,
      curtainPullAttempts: 0,
      bothCurtainsDown: false,
      curtainWrapped: false,
      curtainUsedAsBlanket: false,
      pillowcaseOff: false,
      pillowcaseInsideOut: false,
      pillowcaseOnChair: false,
      pillowOnMirror: false,
      chairBarricade: false,
      mirrorBedroomRemoved: false,
      mirrorBedroomTurned: false,
      mirrorBedroomCleaned: false,
      mattressSleepTried: false,
      mattressScratchSeen: false,
      mattressScratchCleaned: false,
      bedSheetsStripped: false,
      bedroomOutletTested: false,
      medicationDoseTaken: false,
      lastPocketContext: "",
      penTaken: false,
      slipperTaken: false,
      pencilTaken: false,
      glassTaken: false,
      coinsTaken: false,
      coinsInGlass: false,
      coinUnderBookcase: false,
      coinScratchOnWall: false,
      oldKeyTaken: false,
      oldKeyAttempts: 0,
      shoppingListTaken: false,
      shoppingListFramed: false,
      photoAlbumSeen: false,
      photoAlbumGapsSeen: false,
      paperAirplaneMade: false,
      wardrobeEmptied: false,
      wearingScarf: false,
      bookUnderTable: false,
      booksStacked: false,
      floorboardGapSeen: false,
      ventRemoved: false,
      ventReached: false,
      coatWorn: false,
      coatOverHead: false,
      coatOverMirror: false,
      clockBroken: false,
      clockUnplugged: false,
      clockShakeCount: 0,
      clockLocation: "table",
      pillowLocation: "bed",
      slipperLocation: "underBed",
      starLocation: "underBed",
      windowLocked: true,
      windowWider: false,
      sleepCount: 0,
      laundrySearched: false,
      laundryPocketSearched: false,
      frameRemoved: false,
      frameOpened: false,
      roomMessCount: 0,
      wardrobeOpened: false,
      shoeBoxOpened: false,
      cameraSeen: false,
      cameraTaken: false,
      cameraBatteriesTaken: false,
      cameraUsbCableTaken: false,
      curtainsFixAttempted: false,
      sittingOnBed: false,
      flashlightSeen: false,
      flashlightTaken: false,
      flashlightBatteryChecked: false,
      flashlightDeadBatteriesRemoved: false,
      flashlightHasFreshBatteries: false,
      flashlightOn: false,
      bathroomCupboardOpen: false,
      bathroomWindowOpen: false,
      bathroomSinkFull: false,
      bathroomMatLifted: false,
      bathroomTowelTaken: false,
      windowExitAttemptCount: 0,
      windowJumpAttemptCount: 0,
      windowClimbAttemptCount: 0,
      showerCurtainDamaged: false
    },
    settings: {
      ambient: true,
      music: true
    }
  });

  let state = loadState();
  let history = [];
  let historyIndex = 0;

  const sceneEl = document.getElementById("scene");
  const roomNameEl = document.getElementById("roomName");
  const form = document.getElementById("commandForm");
  const input = document.getElementById("commandInput");
  const drawer = document.getElementById("drawer");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerBody = document.getElementById("drawerBody");
  const drawerClose = document.getElementById("drawerClose");
  const navButtons = [...document.querySelectorAll(".bottom-nav [data-panel]")];

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return initialState();
      const saved = JSON.parse(raw);
      const fresh = initialState();
      const merged = {
        ...fresh,
        ...saved,
        outside: Array.isArray(saved.outside) ? saved.outside : [],
        outsideLocations: saved.outsideLocations && typeof saved.outsideLocations === "object"
          ? { ...saved.outsideLocations }
          : {},
        flags: { ...fresh.flags, ...(saved.flags || {}) },
        settings: { ...fresh.settings, ...(saved.settings || {}) }
      };

      // v0.3.5 migration: older saves only knew that thrown items were "outside."
      // Give every existing bedroom-window item a real recoverable site location.
      const inferredOutsideLocations = {
        "Bedroom pillow": "backLawn",
        "Bedroom slipper": "backLawn",
        "Glow-in-the-dark plastic star": "oldGardenBed",
        "Alarm clock": "stonePatio"
      };
      for (const item of merged.outside) {
        if (!merged.outsideLocations[item] && inferredOutsideLocations[item]) {
          merged.outsideLocations[item] = inferredOutsideLocations[item];
        }
      }
      if (merged.outsideLocations["Bedroom pillow"] === "garageRoof") {
        merged.outsideLocations["Bedroom pillow"] = "backLawn";
      }
      if (merged.outsideLocations["Alarm clock"] === "rearLaneSideOfGarage" || merged.outsideLocations["Alarm clock"] === "garageRoof") {
        merged.outsideLocations["Alarm clock"] = "stonePatio";
      }

      // v0.3.5 migration: older saves tracked whether the brass key was seen,
      // but not where it physically was. Reconstruct the only sensible location.
      if (merged.flags.brassKeyTaken || merged.inventory.includes("Small brass key")) {
        merged.flags.brassKeyTaken = true;
        merged.flags.brassKeySeen = true;
        merged.flags.brassKeyLocation = "inventory";
      } else if (merged.flags.drawerBroken && merged.flags.brassKeySeen) {
        merged.flags.brassKeyLocation = "underBed";
      } else if (merged.flags.tableMoved && merged.flags.brassKeySeen) {
        merged.flags.brassKeyLocation = "behindTable";
      }

      return merged;
    } catch {
      return initialState();
    }
  }

  function saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function addInventory(item) {
    if (!state.inventory.includes(item)) {
      state.inventory.push(item);
      saveState();
    }
  }

  function removeInventory(item) {
    state.inventory = state.inventory.filter(x => x !== item);
    saveState();
  }

  function hasItem(item) {
    return state.inventory.includes(item);
  }

  function putOutside(item, location = "backLawn") {
    if (!Array.isArray(state.outside)) state.outside = [];
    if (!state.outside.includes(item)) state.outside.push(item);
    if (!state.outsideLocations || typeof state.outsideLocations !== "object") state.outsideLocations = {};
    state.outsideLocations[item] = location;
    removeInventory(item);
    saveState();
  }

  function isOutside(item) {
    return Array.isArray(state.outside) && state.outside.includes(item);
  }

  function recoverOutside(item) {
    state.outside = Array.isArray(state.outside) ? state.outside.filter(x => x !== item) : [];
    if (state.outsideLocations && typeof state.outsideLocations === "object") {
      delete state.outsideLocations[item];
    }
    saveState();
  }

  function outsideLocation(item) {
    return state.outsideLocations && state.outsideLocations[item] ? state.outsideLocations[item] : null;
  }

  function outsideLocationText(location) {
    return ({
      stonePatio: "on the wet stone patio below the bedroom window",
      patioEdge: "at the edge of the stone patio",
      backLawn: "on the wet back lawn",
      oldGardenBed: "in the old garden bed"
    })[location] || "somewhere in the back garden";
  }

  function addJournal(entry) {
    if (!state.journal.includes(entry)) {
      state.journal.push(entry);
      saveState();
    }
  }

  function normalize(raw) {
    return raw
      .toLowerCase()
      .replace(/[?.!,;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\bflash\s+light\b/g, "flashlight")
      .replace(/^ut\s+(?=slippers?\b)/, "put ")
      .replace(/^but\s+(?=sheets?\b)/, "put ")
      .replace(/\bfloorplans?\b/g, "floor plan")
      .replace(/^sclimb\b/, "climb")
      .replace(/^clmb\b/, "climb")
      .replace(/^jupm\b/, "jump");
  }

  function simplifyCommand(text) {
    return text
      .replace(/\b(?:the|a|an|my|his)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function phraseMatch(text, phrase) {
    const haystack = ` ${text.replace(/\s+/g, " ").trim()} `;
    const needle = ` ${phrase.replace(/\s+/g, " ").trim()} `;
    return haystack.includes(needle);
  }

  function hasAny(q, terms) {
    const simplifiedQuery = simplifyCommand(q);
    return terms.some(term => {
      const simplifiedTerm = simplifyCommand(term);
      return phraseMatch(q, term) || phraseMatch(simplifiedQuery, simplifiedTerm);
    });
  }

  function all(q, terms) {
    return terms.every(term => q.includes(term));
  }

  function say(text, command = "") {
    const echo = command ? `<p class="command-echo">${escapeHtml(command)}</p>` : "";
    sceneEl.insertAdjacentHTML("beforeend", `${echo}<p class="response">${text}</p>`);
    sceneEl.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[ch]));
  }

  function setRoom(room) {
    state.room = room;
    saveState();
    renderRoom();
  }

  function roomTitle(room) {
    return room === "ensuite" ? "Ensuite Bathroom" : "Master Bedroom";
  }

  function currentRoomDescriptionHtml() {
    return state.room === "ensuite"
      ? ensuiteDescriptionHtml()
      : bedroomDescriptionHtml();
  }

  function bedroomDescriptionHtml() {
    const f = state.flags;

    const curtainText = f.bothCurtainsDown
      ? "Both curtains have been pulled down and lie in heavy folds near the window. The exposed rail and damaged plaster above them make the destruction difficult to ignore."
      : f.curtainsDown
        ? "One end of the curtain rail has torn free from the plaster, leaving the fabric hanging crookedly and partly on the floor."
        : f.curtainsOpen
          ? "The curtains stand open around the window, letting a broad wash of grey morning light across the floor."
          : "Heavy curtains cover most of the window, allowing only a narrow strip of morning light into the room.";

    const tableText = f.tableMoved
      ? "The bedside table has been dragged away from the wall, exposing the outlet and the dusty strip of floor behind it."
      : "The bedside table stands close beside the bed.";

    const bedText = f.bedMoved
      ? "The bed has been shoved several inches away from the wall, leaving a dark strip of floor exposed behind the headboard."
      : "The old wooden bed occupies most of the far wall, with enough clearance beneath it for several dark inches of floor to disappear from view.";

    const mirrorText = f.mirrorBedroomTurned
      ? "The full-length mirror has been turned to face the wall."
      : f.mirrorCoveredBedroom
        ? "The full-length mirror is covered."
        : "A dusty full-length mirror faces the bed.";

    const mattressText = f.mattressFlipped
      ? "The mattress is flipped, leaving the wooden supports exposed."
      : "";

    const chairText = f.chairBarricade
      ? "The wooden chair has been wedged beneath the bedroom doorknob."
      : "A wooden chair stands beneath the window.";

    const messBits = [];
    if (f.glassBroken) messBits.push("broken glass lies across part of the floor");
    if (f.wardrobeEmptied) messBits.push("clothing has been piled out of the wardrobe");
    if (f.pillowFort) messBits.push("the bed has been partially converted into an unimpressive pillow fort");
    if (f.coinScratchOnWall) messBits.push("a fresh coin-scratch marks the wall");
    if (f.bookUnderTable) messBits.push("a paperback is wedged beneath one leg of the bedside table");
    const messText = messBits.length ? ` The room now also contains evidence of Thomas's decisions: ${messBits.join(", ")}.` : "";

    return `
      <p>${bedText} ${tableText}</p>
      <p>Across the room, the wardrobe and bookcase remain against the far wall. ${mirrorText} ${chairText} ${curtainText}</p>
      <p>His suitcase remains near the bedroom door. The small ensuite door sits beside the wardrobe. ${mattressText}</p>
      <p>The room still contains the ordinary leftovers of a shared life: books, clothes, framed pictures, coins, the hospital paperwork, and whatever objects Thomas has not already moved, broken, pocketed or thrown outside.${messText}</p>
      <p>Three short scratches remain low on the bedroom door.</p>
    `;
  }

  function ensuiteDescriptionHtml() {
    const f = state.flags;

    const stoolText = f.stoolTaken
      ? "The space beneath the sink is more open now that the small plastic stool has been removed."
      : f.stoolMoved
        ? "The small plastic step stool has been pulled out from beneath the sink."
        : "A small white plastic step stool with blue rubber feet is pushed toward the back beneath the sink.";

    const mirrorText = f.bathroomMirrorCovered
      ? "A towel hangs across the mirrored medicine cabinet, hiding most of Thomas's reflection."
      : "A mirrored medicine cabinet hangs above the small porcelain sink.";

    const floorText = f.bathroomFloorWet
      ? "The tile floor is wet in places, entirely because Thomas made it that way."
      : "A faded bath mat lies crooked on the tile.";

    return `
      <p>The ensuite barely has enough floor space to justify the name. ${mirrorText} The toilet is wedged beside a shallow tub and shower combination with a faded curtain. ${floorText}</p>
      <p>Two towels hang near the door. Several old toiletries remain around the sink, including Jennifer's hairbrush, a hair dryer, perfume, hand cream and assorted bathroom clutter.</p>
      <p>${stoolText} Cleaning supplies, spare toilet paper, a plunger and folded cloths share the cupboard space. A frosted window above the toilet admits grey morning light.</p>
      <p>The room smells faintly of old soap, dust and plumbing that has not been used regularly.</p>
    `;
  }

  function renderRoom() {
    roomNameEl.textContent = roomTitle(state.room);

    if (state.room === "bedroom") {
      renderBedroom();
    } else {
      renderEnsuite();
    }

    input.focus();
  }


  function renderBedroom() {
    const f = state.flags;
    const curtainText = f.curtainsDown
      ? "The curtains have been pulled partly from the wall and lie in an undignified heap near the window."
      : f.curtainsOpen
        ? "The curtains stand open around the window, letting a broad wash of grey morning light across the floor."
        : "Heavy curtains cover most of the window, allowing only a narrow strip of morning light into the room.";

    const tableText = f.tableMoved
      ? "The bedside table has been dragged away from the wall, exposing the outlet and the dusty strip of floor behind it."
      : "The bedside table stands close beside the bed.";

    const bedText = f.bedMoved
      ? "The bed has been shoved several inches away from the wall, leaving a dark strip of floor exposed behind the headboard."
      : "The old wooden bed occupies most of the far wall, with enough clearance beneath it for several dark inches of floor to disappear from view.";

    const chaos = [];
    if (f.chairBarricade) chaos.push("The wooden chair is wedged beneath the bedroom doorknob, barricading a door nobody has tried to open.");
    if (f.mattressFlipped) chaos.push("The mattress is flipped and the bedding has been disturbed enough that the bed no longer resembles the one Thomas woke in.");
    if (f.pillowFort) chaos.push("A deeply unimpressive pillow fort occupies part of the bed.");
    if (f.wardrobeEmptied) chaos.push("A substantial portion of the wardrobe is now piled across the bed because Thomas apparently decided sorting could begin with maximum inconvenience.");
    if (f.bookUnderTable) chaos.push("One of the old paperbacks is wedged beneath the uneven leg of the bedside table, where it has finally found practical purpose.");
    if (f.mirrorBedroomTurned) chaos.push("The full-length mirror has been turned toward the wall.");
    else if (f.mirrorCoveredBedroom || f.coatOverMirror) chaos.push("The full-length mirror is covered, leaving the room oddly less occupied.");
    if (f.glassBroken) chaos.push("Broken glass remains scattered near the wall, a hazard Thomas created entirely for himself.");
    if (state.outside && state.outside.length) chaos.push(`Several objects are no longer in the room because Thomas threw them outside: ${state.outside.map(escapeHtml).join(", ")}.`);

    const intro = `
      <p>Thomas woke without immediately knowing where he was.</p>
      <p>The confusion lasted only a few seconds. Grey morning light showed him a ceiling he had spent years looking at, although recognition arrived strangely, as though he were remembering the room from a photograph rather than waking inside it. A narrow crack ran from the plaster medallion above the light fixture toward the far wall. He remembered standing on the mattress once with a flashlight, examining that crack while Jennifer insisted from below that ceilings were permitted to age without doing it specifically to annoy him.</p>
      <p>He had driven back in the rain, arrived sometime after eleven, carried his suitcase upstairs and gone almost immediately to bed. Fourteen months away, followed by one miserable night back, and apparently his brain had already decided that remembering where he lived was optional.</p>
      <p>${bedText} ${tableText} Across the room, a tall wardrobe faces the bed beside a dusty full-length mirror and a narrow bookcase. His suitcase remains mostly packed beside the bedroom door. ${curtainText} A small ensuite door sits near the wardrobe.</p>
      <p>The room contains the ordinary leftovers of a shared life: books, clothes, an old laundry basket, framed pictures, coins in a ceramic dish, ${f.clockLocation === "outside" ? "the empty place where the alarm clock used to be" : f.clockBroken ? "a damaged alarm clock" : "a dead alarm clock"}, and ${f.envelopeOpened ? "the opened hospital paperwork" : "the sealed hospital envelope"} Thomas dropped beside his phone last night.</p>
      <p>One of the two frames near the wardrobe is empty. Three short scratches mark the paint near the bottom of the bedroom door.</p>
      ${chaos.length ? `<p>${chaos.join(" ")}</p>` : ""}
      <p>For the moment, nothing in the room appears to require his attention.</p>
    `;
    sceneEl.innerHTML = intro;
  }

  function renderEnsuite() {
    const f = state.flags;
    const stoolText = f.stoolTaken
      ? "The space beneath the sink is more open now that the small plastic stool has been removed."
      : f.stoolMoved
        ? "The small plastic step stool has been pulled out from beneath the sink."
        : "A small white plastic step stool with blue rubber feet is pushed toward the back beneath the sink.";

    const mirrorText = f.bathroomMirrorCovered
      ? "A towel hangs across the mirrored medicine cabinet, hiding most of Thomas's reflection."
      : "A mirrored medicine cabinet hangs above the small porcelain sink.";

    const floorText = f.bathroomFloorWet
      ? "The tile floor is wet in places, entirely because Thomas made it that way."
      : "A faded bath mat lies crooked on the tile.";

    sceneEl.innerHTML = `
      <p>The ensuite barely has enough floor space to justify the name. ${mirrorText} The toilet is wedged beside a shallow tub and shower combination with a faded curtain drawn across it. ${floorText}</p>
      <p>Two towels hang near the door. Several old toiletries remain around the sink: toothbrushes, toothpaste, Jennifer's hairbrush, a hair dryer, perfume, hand cream, nail scissors, tweezers and assorted bathroom clutter that should probably have been thrown away a year ago.</p>
      <p>${stoolText} Cleaning supplies, spare toilet paper, a plunger and folded cloths share the cupboard with it. A frosted window above the toilet admits grey morning light.</p>
      <p>The room smells faintly of old soap, dust and plumbing that has not been used regularly.</p>
    `;
  }

  function handleCommand(raw) {
    const q = normalize(raw);
    if (!q) return;

    history.push(raw);
    historyIndex = history.length;

    if (q === "inventory" || q === "i") {
      openPanel("inventory");
      return;
    }
    if (q === "journal" || q === "j") {
      openPanel("journal");
      return;
    }

    closeDrawer();

    if (state.room === "bedroom") {
      bedroomCommand(q, raw);
    } else {
      ensuiteCommand(q, raw);
    }

    saveState();
  }

  function handleBedroomClock(q, raw) {
    const f = state.flags;

    const asksForTime =
      q === "time" ||
      hasAny(q, [
        "look at time",
        "check time",
        "check the time",
        "what time is it",
        "what is the time",
        "tell time",
        "read time",
        "look at the time"
      ]);

    if (asksForTime) {
      say("The alarm clock is no help; its display is dark. Thomas checks his phone instead. 8:17 a.m. He has been awake for only a few minutes, which feels unfair considering how much of the morning he has already managed to complicate.", raw);
      return true;
    }

    const mentionsClock = hasAny(q, ["clock", "alarm clock"]) || q === "press buttons";
    if (!mentionsClock) return false;

    const clockItem = "Alarm clock";
    const clockHere = f.clockLocation !== "outside";

    if (hasAny(q, ["look", "examine", "inspect", "check", "study", "look at clock", "look at alarm clock"])) {
      if (!clockHere) {
        say("The alarm clock is no longer in the bedroom. Thomas threw it outside, a fact for which the house cannot reasonably be blamed.", raw);
        return true;
      }

      const locationText =
        f.clockLocation === "inventory" ? "Thomas turns the alarm clock over in his hands." :
        f.clockLocation === "bed" ? "The alarm clock is lying on the bed where Thomas threw it." :
        f.clockLocation === "floor" ? "The alarm clock is on the floor." :
        "The old digital alarm clock sits on the bedside table.";

      const conditionText = f.clockBroken
        ? " Its plastic casing is cracked and the display remains dark."
        : f.clockUnplugged
          ? " It is unplugged, and the display remains dark."
          : " It is plugged into the wall, although the display is dark.";

      say(locationText + conditionText + " Thomas remembers owning one like it. He is less certain that this is the same one.", raw);
      return true;
    }

    if (hasAny(q, ["pick up", "pickup", "take", "get", "grab", "lift", "hold"])) {
      if (!clockHere) {
        say("The clock is outside now. Thomas cannot pick it up from the bedroom.", raw);
      } else if (f.clockLocation === "inventory") {
        say("Thomas is already holding the alarm clock.", raw);
      } else {
        f.clockLocation = "inventory";
        addInventory(clockItem);
        say("Thomas picks up the alarm clock. It is heavier than it looks, an old rectangular block of dark plastic with a dead display and buttons along the top.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put down", "set down", "drop clock", "drop alarm clock"])) {
      if (f.clockLocation !== "inventory") {
        say("Thomas is not currently holding the alarm clock.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "floor";
        say("Thomas puts the alarm clock down on the floor.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put clock on table", "place clock on table", "put alarm clock on table", "put clock back"])) {
      if (f.clockLocation === "outside") {
        say("The alarm clock is outside. Thomas would have to retrieve it before putting it back anywhere.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "table";
        say("Thomas puts the alarm clock back on the bedside table.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put clock on bed", "place clock on bed", "put alarm clock on bed"])) {
      if (f.clockLocation === "outside") {
        say("The alarm clock is outside. This makes placing it on the bed difficult.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "bed";
        say("Thomas puts the alarm clock on the bed.", raw);
      }
      return true;
    }

    if (hasAny(q, ["turn clock over", "turn alarm clock over", "turn over", "flip clock", "check back", "look at back", "battery", "battery compartment", "open compartment"])) {
      if (!clockHere) {
        say("The clock is outside, which limits the available battery inspection considerably.", raw);
      } else {
        say("Thomas turns the clock over. A small plastic cover on the underside conceals the backup battery compartment. It is empty. A faint rectangular impression in the dust shows where a battery once sat.", raw);
      }
      return true;
    }

    if (hasAny(q, ["unplug"])) {
      if (!clockHere) {
        say("The alarm clock is outside and very definitely no longer plugged in.", raw);
      } else if (f.clockUnplugged) {
        say("The clock is already unplugged.", raw);
      } else {
        f.clockUnplugged = true;
        say("Thomas pulls the plug from the outlet. The clock reacts exactly as much as it did while plugged in.", raw);
      }
      return true;
    }

    if (hasAny(q, ["plug in", "plug clock", "plug alarm clock"])) {
      if (!clockHere) {
        say("The alarm clock is outside. The extension-cord solution required here would be absurd.", raw);
      } else if (!f.clockUnplugged) {
        say("The clock is already plugged in.", raw);
      } else {
        f.clockUnplugged = false;
        if (f.clockLocation === "inventory") {
          removeInventory(clockItem);
          f.clockLocation = "table";
        }
        say("Thomas plugs the clock back in. The display remains stubbornly dark.", raw);
      }
      return true;
    }

    if (hasAny(q, ["press", "press buttons", "push button", "press button", "turn on", "switch on"])) {
      if (!clockHere) {
        say("The alarm clock is outside. Thomas cannot operate it from here, despite the player's apparent confidence in remote clock technology.", raw);
      } else {
        say("Thomas presses the buttons along the top. Nothing happens. The display remains blank.", raw);
      }
      return true;
    }

    if (hasAny(q, ["smother", "cover clock with pillow", "put pillow on clock", "put pillow over clock"])) {
      if (!clockHere) {
        say("The alarm clock is outside. Thomas looks at the pillow, then at the open window. The smothering phase of this experiment has passed.", raw);
      } else {
        say("Thomas puts the pillow over the alarm clock. The clock, already silent, becomes even quieter. A spectacular success.", raw);
      }
      return true;
    }

    if (hasAny(q, ["shake"])) {
      if (!clockHere) {
        say("The clock is outside.", raw);
      } else {
        f.clockShakeCount += 1;
        say("Thomas shakes the clock. Something rattles faintly inside. It does not sound like a loose battery.", raw);
      }
      return true;
    }

    if (hasAny(q, ["throw"]) && hasAny(q, ["outside", "out window", "through window"])) {
      if (!f.windowOpen) {
        say("The window is closed. Thomas is not hurling an alarm clock through the glass.", raw);
      } else if (!clockHere) {
        say("The alarm clock is already outside.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "outside";
        f.clockBroken = true;
        putOutside(clockItem, "stonePatio");
        say("Thomas throws the alarm clock out the open window. It drops to the wet stone patio below and hits hard enough for the casing to split at one corner. From up here he can still see it lying near the patio edge. The bedroom has become marginally less mysterious and significantly less equipped with clocks.", raw);
      }
      return true;
    }

    if (hasAny(q, ["throw"]) && hasAny(q, ["wall", "at wall"])) {
      if (!clockHere) {
        say("The clock is outside.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "floor";
        f.clockBroken = true;
        f.roomMessCount += 1;
        say("Thomas throws the clock at the wall. The casing cracks against the plaster and drops to the floor. The clock is now damaged.", raw);
      }
      return true;
    }

    if (hasAny(q, ["throw"])) {
      if (!clockHere) {
        say("The clock is outside.", raw);
      } else {
        removeInventory(clockItem);
        f.clockLocation = "bed";
        say("Thomas throws the clock onto the bed. It bounces once and lands near the pillow. A surprisingly anticlimactic rebellion.", raw);
      }
      return true;
    }

    if (hasAny(q, ["break", "smash"])) {
      if (!clockHere) {
        say("The clock is outside.", raw);
      } else if (f.clockBroken) {
        say("The clock is already broken.", raw);
      } else {
        f.clockBroken = true;
        f.roomMessCount += 1;
        say("Apparently reason has lost the argument. Thomas strikes the clock against the edge of the table. The plastic casing cracks near one corner, and a small internal component breaks loose with a sharp rattle.", raw);
      }
      return true;
    }

    if (hasAny(q, ["lick"])) {
      say("Thomas looks at the alarm clock. Then at the empty room. “No.”", raw);
      return true;
    }

    return false;
  }

  function handleMedicalDocuments(q, raw) {
    const f = state.flags;

    // This section deliberately uses simple keyword recognition instead of
    // requiring exact phrases. If a player types READ ADMISSION, LOOK NOTES,
    // CHECK FOLLOW UP, MEDICAL PAPERS, etc., Thomas should understand.
    const hasWord = (word) => phraseMatch(q, word);

    // Physical commands that merely contain medical-document words must be
    // allowed to reach their object/action handlers instead of becoming READ/LOOK.
    if (hasAny(q, [
      "make paper airplane", "fold paper airplane", "eat paper", "eat paperwork",
      "take medication", "take medicine", "take meds", "take all medication",
      "take all meds", "overdose", "follow crack", "examine ceiling crack",
      "look at ceiling crack"
    ])) return false;

    const mentionsFollowUp = hasAny(q, ["follow up", "follow-up", "followup"]) || hasWord("appointment");
    const documentWords = [
      "medical", "hospital", "discharge", "admission", "admitted",
      "clinical", "psychiatric", "psych", "medication", "meds",
      "paper", "papers", "paperwork", "document", "documents",
      "record", "records", "envelope", "note", "notes",
      "summary", "history", "appointment"
    ];

    const mentionsDocuments = mentionsFollowUp || documentWords.some(word => hasWord(word));
    if (!mentionsDocuments) return false;

    const wantsOpen = ["open", "unseal"].some(word => hasWord(word)) || q.includes("break seal");
    const wantsRead = ["read"].some(word => hasWord(word)) || q.includes("go through");
    const wantsLook = ["look", "examine", "inspect", "check", "study"].some(word => hasWord(word));
    const wantsTake = ["take", "get", "grab", "hold"].some(word => hasWord(word)) || q.includes("pick up");
    const wantsDestroy = ["tear", "rip", "destroy"].some(word => hasWord(word));

    const admissionSection =
      hasWord("admission") ||
      hasWord("admitted") ||
      hasWord("psychiatric") ||
      hasWord("psych") ||
      (hasWord("history") && !hasWord("clinical")) ||
      q.includes("why was i admitted") ||
      q.includes("why admitted") ||
      q.includes("reason for admission") ||
      q.includes("reason admitted");

    const followUpSection = mentionsFollowUp;

    const medicationSection =
      hasWord("medication") ||
      hasWord("meds");

    const clinicalSection =
      hasWord("clinical") ||
      hasWord("note") ||
      hasWord("notes") ||
      hasWord("summary");

    const isGeneralDischarge =
      hasWord("discharge") ||
      hasWord("medical") ||
      hasWord("hospital") ||
      hasWord("paper") ||
      hasWord("papers") ||
      hasWord("paperwork") ||
      hasWord("document") ||
      hasWord("documents") ||
      hasWord("record") ||
      hasWord("records") ||
      hasWord("envelope");

    if (wantsDestroy) {
      say("Thomas grips the pages, then stops. Destroying medical paperwork because he dislikes what it says feels uncomfortably familiar. He puts it down instead.", raw);
      return true;
    }

    if (wantsOpen) {
      if (f.envelopeOpened) {
        say("The hospital envelope is already open. The discharge papers, admission summary, follow-up sheet, medication schedule and clinical notes are all inside.", raw);
      } else {
        f.envelopeOpened = true;
        say("Thomas breaks the seal. Inside are several pages: discharge instructions, a medication schedule, follow-up information, an admission summary and longer clinical notes.", raw);
      }
      return true;
    }

    // Simple section commands work even without a verb:
    // ADMISSION, READ ADMISSION, LOOK ADMISSION, CHECK ADMISSION, etc.
    if (admissionSection) {
      f.envelopeOpened = true;
      addJournal("The admission summary says Thomas was hospitalized after Jennifer's disappearance, severe sleep deprivation, disorientation, paranoia about the house, inconsistent autobiographical memory and perceptual disturbances.");
      say("The admission summary is blunt. Thomas was hospitalized after Jennifer's disappearance, following a severe psychiatric deterioration marked by profound insomnia, disorientation, paranoid ideas concerning the house, inconsistent autobiographical memory and episodes of agitation. The notes also describe perceptual disturbances and concern that he could no longer reliably distinguish remembered events from things he believed had happened. Thomas reads the paragraph twice. None of it is new. Seeing it reduced to clinical language still feels like reading about someone else.", raw);
      return true;
    }

    if (followUpSection) {
      f.envelopeOpened = true;
      say("The follow-up sheet lists an outpatient appointment, contact numbers and instructions to call sooner if Thomas experiences severe confusion, paranoia, persistent sensory disturbances or a significant change in sleep. Nothing on the page is handwritten.", raw);
      return true;
    }

    if (medicationSection) {
      f.envelopeOpened = true;
      say("The medication schedule is straightforward: drug names, doses and times, followed by warnings not to change or stop anything without speaking to his doctor. Thomas has already read it often enough to know the important parts.", raw);
      return true;
    }

    // Clinical notes / summary are the deeper layer and contain the child clue.
    if (clinicalSection) {
      f.envelopeOpened = true;

      if (!f.clinicalNoteRead) {
        f.clinicalNoteRead = true;
        addJournal("During early admission, Thomas intermittently referred to a female child he said had lived in the house. At other times he denied having a child or seemed confused when questioned about her. Staff could not corroborate the claim and treated it as potentially delusional or confabulatory.");
      }

      say("Thomas reads the clinical notes. During the early admission period, he intermittently referred to a female child whom he claimed had lived in the house. His descriptions were inconsistent. At other times he denied having a child or appeared confused when staff questioned him about her. No corroborating information was established during treatment, and the recollections were recorded as potentially delusional or confabulatory material associated with the acute episode. A later note is worse: on several occasions Thomas became visibly distressed when asked about the child and insisted staff stop asking him about her. In subsequent interviews, he stated that no child existed and seemed confused by the earlier statements. Thomas reaches the end of the paragraph without realizing he has stopped breathing normally.", raw);
      return true;
    }

    // General discharge / medical-paper commands.
    if (wantsRead || q === "discharge") {
      f.envelopeOpened = true;
      say("Thomas reads through the discharge papers. They summarize the reason for admission first: acute psychiatric deterioration after Jennifer's disappearance, with severe sleep deprivation, confusion, perceptual disturbances and escalating concern about his safety. The rest is routine: medication instructions, sleep recommendations, contact numbers, follow-up appointments and warnings about the return of severe confusion, paranoia or persistent sensory disturbances. A longer admission summary and clinical-note section follow.", raw);
      return true;
    }

    if (wantsLook || isGeneralDischarge || documentWords.some(word => q === word)) {
      if (!f.envelopeOpened) {
        say("The hospital envelope is still sealed. Thomas's name and the hospital logo are printed on the front. He carried it home yesterday without opening it.", raw);
      } else if (f.clinicalNoteRead) {
        say("The opened packet contains the discharge instructions, medication schedule, follow-up sheet, admission summary and clinical notes. Thomas can no longer look at it without noticing the section about the unnamed female child he alternately remembered, denied and begged staff to stop asking about.", raw);
      } else {
        say("The hospital envelope is open. The packet contains discharge instructions, a medication schedule, follow-up information, an admission summary and longer clinical notes. Thomas has not read every section closely.", raw);
      }
      return true;
    }

    if (wantsTake) {
      addInventory("Hospital discharge documents");
      say("Thomas picks up the hospital documents. The pages are thin, stiff and unpleasantly official in his hands.", raw);
      return true;
    }

    return false;
  }

  function handleBedroomAuditObjects(q, raw) {
    const f = state.flags;
    const isLook = hasAny(q, ["look", "look at", "examine", "inspect", "check", "study", "look over"]);
    const isTake = hasAny(q, ["take", "get", "pick up", "pickup", "grab"]);

    // Plain inspection of objects explicitly named by the room description.
    if (isLook && hasAny(q, ["water glass", "drinking glass"])) {
      say(f.glassBroken
        ? "The drinking glass is broken, its pieces still scattered where Thomas left them."
        : "A plain drinking glass sits near the bedside table. A little mineral residue has dried around the bottom. It is empty.", raw);
      return true;
    }

    const mentionsJenniferClothing = hasAny(q, [
      "jennifer dress", "jennifer dresses", "jennifer's dress", "jennifer's dresses",
      "jennifer clothes", "jennifer's clothes", "jennifer clothing", "jennifer's clothing",
      "her dress", "her dresses", "her clothes", "her clothing"
    ]);
    const mentionsWardrobeClothing = hasAny(q, [
      "clothes", "cloths", "clothing", "dress", "dresses", "sweater", "sweaters",
      "blouse", "blouses", "coat", "coats"
    ]);

    if (isLook && (mentionsJenniferClothing || mentionsWardrobeClothing)) {
      if (f.wardrobeEmptied) {
        if (mentionsJenniferClothing || hasAny(q, ["dress", "dresses", "blouse", "blouses"])) {
          say("A good portion of Jennifer's clothes is no longer hanging neatly in the wardrobe. Dresses, sweaters and blouses are mixed into the heap Thomas made across the bed, while several garments and her dark winter coat still remain inside. The arrangement is now considerably less Jennifer-like than it was this morning.", raw);
        } else {
          say("A substantial portion of the wardrobe's clothing is piled across the bed now. Some garments still hang inside, and the older laundry remains in its basket, but the room has acquired the unmistakable look of a sorting job abandoned halfway through.", raw);
        }
      } else if (mentionsJenniferClothing || hasAny(q, ["dress", "dresses", "blouse", "blouses"])) {
        const openLead = f.wardrobeOpened
          ? "On the right side of the open wardrobe"
          : "Inside the wardrobe, on Jennifer's side";
        say(`${openLead}, several of Jennifer's dresses hang beside sweaters, blouses and the dark coat she wore most winters. They have been left exactly where they were, carrying only the faint smell of cedar, fabric and a wardrobe closed for far too long.`, raw);
      } else {
        const stateText = f.wardrobeOpened
          ? "The open wardrobe divides them almost accidentally: Thomas's clothes on the left, Jennifer's on the right."
          : "Most of them are still inside the wardrobe, with older laundry gathered in the basket near the bed.";
        say(`There are clothes throughout the bedroom, but most are still where they belong. ${stateText}`, raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["wardrobe", "closet"])) {
      const openText = f.wardrobeOpened
        ? "The warped right door is open."
        : "The right door has warped enough to leave a narrow gap even while closed.";
      if (f.wardrobeEmptied) {
        say(`The wardrobe is tall, dark and slightly too large for the room. ${openText} It is now partially emptied. A scattering of shirts, dresses and coats still hangs inside, while the rest forms a substantial heap across the bed. The folded blankets and old shoe box remain on the upper shelf.`, raw);
      } else {
        say(`The wardrobe is tall, dark and slightly too large for the room. ${openText} Thomas's clothes occupy one side and Jennifer's the other; folded blankets and an old shoe box sit on the upper shelf.`, raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["full length mirror", "full-length mirror", "bedroom mirror", "mirror"]) &&
        !hasAny(q, ["behind mirror", "back of mirror", "in mirror"])) {
      if (f.mirrorBedroomTurned) {
        say("The full-length mirror has been turned to face the wall. Its wooden back and hanging brackets are visible instead of Thomas's reflection.", raw);
      } else if (f.mirrorCoveredBedroom || f.coatOverMirror) {
        say("The full-length mirror is covered. Thomas knows perfectly well what is beneath the fabric. That does not make the room feel less strange.", raw);
      } else if (f.mirrorBedroomRemoved) {
        say("The full-length mirror has been removed from its brackets and rests against the wall.", raw);
      } else {
        say("The full-length mirror is old but intact, its surface lightly dusty. Thomas's reflection looks tired enough to make the glass seem less flattering than necessary.", raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["suitcase", "luggage"])) {
      say("Thomas's suitcase is the one he brought home from the hospital last night. It is mostly packed, with clothes, toiletries, medication, spare shoes, his charger adapter and a paperback inside. One outside side pocket is zipped closed.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["window"]) && !hasAny(q, ["out window", "outside", "through window"])) {
      const stateText = f.windowOpen
        ? "It is open, letting cold damp air into the room."
        : f.windowLocked
          ? "It is closed and latched."
          : "It is closed but unlocked.";
      say(`The bedroom window overlooks the back garden. Beyond the patio and rain-dark lawn, mature trees partly frame the detached garage and its wet roof near the rear of the property. A wooden fence closes off the garden, with only a little of the rear lane and neighbouring property visible beyond it. ${stateText} The frame sticks slightly with age.`, raw);
      return true;
    }

    if (isLook && hasAny(q, ["laundry basket", "laundry hamper", "hamper"])) {
      say("The old laundry basket near the foot of the bed contains clothes, a towel, several socks and a shirt Thomas remembers disliking. It has been sitting here far too long to deserve close olfactory study.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["slippers", "slipper"])) {
      if (f.wearingSlippers) {
        say("Thomas is wearing the old bedroom slippers. They are soft, slightly flattened and considerably warmer than bare floorboards.", raw);
      } else if (f.slippersByBed) {
        say("The pair of old bedroom slippers sits together beside the bed where Thomas left them.", raw);
      } else if (isOutside("Bedroom slipper")) {
        say("One slipper remains upstairs. Its partner is outside because Thomas threw it there.", raw);
      } else if (f.slipperTaken) {
        say("Thomas has retrieved the missing slipper. Its matching partner remains near the laundry basket.", raw);
      } else {
        say("One old slipper sits near the laundry basket. Its matching slipper is partly under the bed.", raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["framed pictures", "pictures", "picture frames", "frames"]) && !hasAny(q, ["empty frame", "photo", "photograph"])) {
      say("Two frames hang near the wardrobe. One contains an ordinary landscape print. The smaller frame is empty, although its glass and backing are still intact.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["landscape picture", "landscape print", "landscape"])) {
      say("The larger frame contains a muted landscape print. Thomas remembers seeing it for years and cannot remember either of them ever caring enough about it to replace it.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["books", "novels"])) {
      say("The bookcase holds a mixture of old novels, paperbacks and books Thomas kept because throwing them away felt more difficult than reading them again. None announces itself as important.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["magazines", "magazine"])) {
      say("Several old magazines are stacked unevenly on one shelf. They are months or years out of date and appear to have survived mostly because nobody bothered to recycle them.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["ceramic dish", "coin dish", "dish"]) && !hasAny(q, ["soap dish"])) {
      say("A small ceramic dish on the bookcase holds loose change, a paperclip, a button and an old key. It looks exactly like the sort of place small objects go when nobody wants to decide where they belong.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["coins", "loose change"]) && !hasAny(q, ["coin scratch"])) {
      say(f.coinsTaken
        ? "Thomas has already taken the loose change from the ceramic dish."
        : "A small handful of ordinary coins sits in the ceramic dish.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["paperclip", "paper clip"])) {
      say("An ordinary bent paperclip sits in the ceramic dish. It is available if Thomas becomes desperate enough to promote office supplies into tools.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["button"])) {
      say("A single dark shirt button lies in the ceramic dish. Thomas has no idea what garment it escaped from.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["wooden box", "small box", "locked box"])) {
      say(f.boxUnlocked
        ? "The small wooden box is open. Its brass lock is old and scratched from use."
        : "A small wooden box sits on the upper bookcase shelf. A worn brass lock is set into the front.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["bedroom door", "door"]) && !hasAny(q, ["ensuite", "bathroom", "wardrobe"])) {
      const doorState = f.chairBarricade
        ? "The chair is wedged beneath the knob."
        : f.bedroomDoorOpen
          ? "It is open to the dark upstairs hallway."
          : "It is closed.";
      say(`The bedroom door is old painted wood with a brass knob. ${doorState} Three short parallel scratches mark the paint low near the bottom.`, raw);
      return true;
    }

    if (isLook && hasAny(q, ["ensuite door", "bathroom door"])) {
      say("The narrow ensuite door sits beside the wardrobe. It is ordinary painted wood and opens directly into the small private bathroom.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["floor", "floorboards"]) && !hasAny(q, ["under bed", "glass", "behind stool"])) {
      say("Old hardwood floorboards run across the bedroom. Most are solid, several creak, and dust has collected where furniture has protected the boards from regular cleaning.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["walls", "wall"]) && !hasAny(q, ["scratch", "mirror", "curtain"])) {
      say("The bedroom walls are old painted plaster. Hairline marks, uneven patches and years of minor repairs make them look lived in rather than neglected.", raw);
      return true;
    }

    // Inventory objects should remain examinable after pickup.
    if (isLook && hasAny(q, ["house keys", "keys"]) && !hasAny(q, ["brass key", "old key"])) {
      say("Thomas's house keys are familiar: front door, back door, garage and two smaller keys he recognizes without needing to think about them.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["brass key", "small brass key"])) {
      if (!f.brassKeySeen && !hasItem("Small brass key")) {
        say("Thomas has not found a small brass key.", raw);
      } else {
        say("The small brass key is old and worn smooth along the teeth. It is much smaller than the keys on Thomas's ordinary house ring.", raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["phone charger", "charger"])) {
      say(f.chargerTaken
        ? "Thomas's black phone charger is an ordinary cable and wall plug, now back in his possession."
        : f.tableMoved
          ? "Thomas's black phone charger lies behind the bedside table."
          : "Thomas remembers bringing a charger upstairs but cannot see it from here.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["old key", "useless key"])) {
      say(f.oldKeyTaken
        ? "The old key looks convincingly useful, which is unfortunate because nothing Thomas has tried it on so far agrees."
        : "An old key rests in the ceramic dish on the bookcase.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["shopping list"])) {
      if (!f.shoppingListTaken) {
        say("Thomas remembers seeing a folded shopping list in Jennifer's coat pocket.", raw);
      } else {
        say("Jennifer's shopping list is mundane: milk, laundry detergent, bananas, cereal and toothpaste, with 'night-light bulbs' added at the bottom in a different pen.", raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["blue pen", "pen"]) && !hasAny(q, ["pencil"])) {
      say(f.penTaken
        ? "The old blue ballpoint has tooth marks around the end of the cap. Thomas still cannot remember whether they are his."
        : "An old blue pen is visible beneath the bed.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["pencil"])) {
      say(f.pencilTaken
        ? "The pencil is old, blunt and still usable."
        : "A blunt pencil is lodged behind the radiator.", raw);
      return true;
    }

    if ((isLook || hasAny(q, ["read floor plan", "read house plan", "open floor plan", "unfold floor plan", "view floor plan"]) || q === "floor plan") &&
        hasAny(q, ["floor plan", "house plan", "architectural plan"])) {
      if (!f.floorPlanTaken) {
        say("Thomas does not have the floor plan in front of him.", raw);
      } else {
        say("Thomas unfolds the architectural plan. It shows the ground and upper floors with room dimensions. At first glance it looks ordinary.", raw);
        openFloorPlanPanel();
      }
      return true;
    }

    if (isLook && hasAny(q, ["aa batteries", "batteries"]) && !hasAny(q, ["flashlight battery", "flashlight batteries", "clock battery", "clock batteries", "camera battery", "camera batteries"])) {
      if (f.cameraBatteriesTaken && hasItem("Two AA batteries")) {
        say("Two ordinary AA batteries taken from the old digital camera. They look old but clean, with no obvious corrosion.", raw);
      } else if (f.flashlightDeadBatteriesRemoved && hasItem("Two dead corroded AA batteries")) {
        say("The two batteries from the flashlight are old and crusted around one terminal. They are finished.", raw);
      } else {
        say("Thomas does not currently have loose AA batteries to inspect.", raw);
      }
      return true;
    }

    // Missing interaction-bank aliases.
    if (hasAny(q, ["fill glass", "fill water glass", "fill drinking glass"])) {
      say("Not here. Thomas will need a working tap. The ensuite is only a few steps away.", raw);
      return true;
    }

    if (hasAny(q, ["walk over glass barefoot", "walk barefoot over glass", "step on broken glass barefoot"])) {
      say("Thomas looks down at the shards. Absolutely not.", raw);
      return true;
    }

    if (hasAny(q, ["tear paperwork", "rip paperwork", "tear medical documents", "rip medical papers"])) {
      say("Thomas grips the pages, then stops. Destroying medical paperwork because he dislikes what it says feels uncomfortably familiar. He puts it down instead.", raw);
      return true;
    }

    if (hasAny(q, ["wrap self in curtains", "wrap himself in curtains"])) {
      f.curtainWrapped = true;
      say("Thomas gathers the faded fabric around his shoulders. For several seconds he resembles either an impoverished monarch or a man making increasingly questionable decisions in an empty house. He lets it fall.", raw);
      return true;
    }

    if (hasAny(q, ["examine cut edge", "inspect cut edge", "look at cut edge", "study cut edge", "check cut edge"])) {
      if (!f.photoTaken && !f.boxUnlocked) {
        say("Thomas has not found a loose photograph with a cut edge.", raw);
      } else {
        f.photoExamined = true;
        say("The cut is not straight. Part of Jennifer's right arm continues beyond the edge of the picture, her elbow positioned as though her arm had been around someone standing beside her. Whatever occupied that part of the photograph has been removed. Thomas does not remember doing it.", raw);
      }
      return true;
    }

    if (hasAny(q, ["photo", "photograph"]) && hasAny(q, ["frame"]) && hasAny(q, ["put", "place", "try", "fit"])) {
      if (!hasItem("Trimmed photograph of Thomas and Jennifer") && !f.photoTaken) {
        say("Thomas does not have the trimmed photograph in his hands yet.", raw);
      } else {
        f.photoTriedInFrame = true;
        addJournal("The trimmed photograph from the wooden box is the right height for the empty bedroom frame, but several centimetres too narrow. It may once have been a larger photograph.");
        say("Thomas removes the frame backing and tries the photograph. It fits vertically. Horizontally, it is too narrow by several centimetres. The photograph that belonged in the frame was larger. Thomas looks at the cut edge again.", raw);
      }
      return true;
    }

    if (hasAny(q, ["touch scratches", "feel scratches", "run fingers over scratches"])) {
      say("Thomas runs a fingertip across the damaged paint. The exposed wood beneath it has smoothed with age. The scratches are not recent.", raw);
      return true;
    }

    if (hasAny(q, ["wear clothes", "change clothes", "put on clothes"])) {
      say("Thomas changes into clean clothes from the suitcase. The action is ordinary enough to be reassuring.", raw);
      return true;
    }

    if (hasAny(q, ["take medication", "take medicine", "take meds"]) && !hasAny(q, ["all", "everything", "overdose"])) {
      if (f.medicationDoseTaken) {
        say("Thomas checks the label again. He has already taken the prescribed dose. Not again.", raw);
      } else {
        say("Thomas checks the label. Not yet.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put star in mouth", "eat plastic star", "eat star"])) {
      say("Thomas looks at the little plastic star. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["call police", "phone police", "call 911", "call emergency services"])) {
      say("Thomas unlocks his phone and stops. Nothing has happened that requires the police. He is not calling emergency services to report an unfamiliar alarm clock and an aggressively unhelpful bedroom.", raw);
      return true;
    }

    if (hasAny(q, ["check inside pillow", "look inside pillow"])) {
      say("Thomas feels along the seams and presses the pillow between his hands. It is simply a pillow. Nothing is hidden inside.", raw);
      return true;
    }

    if (q === "knock again") {
      if (f.doorKnockCount > 0) {
        f.doorKnockCount += 1;
        if (f.doorKnockCount >= 3) {
          say("Thomas lowers his hand. “If somebody answers eventually, I am blaming you.”", raw);
        } else {
          say("Thomas knocks on the bedroom door again. Still nothing.", raw);
        }
      } else if (f.mirrorKnockCount > 0) {
        f.mirrorKnockCount += 1;
        say("Thomas knocks on the mirror again. Nothing answers.", raw);
      } else {
        say("Again where?", raw);
      }
      return true;
    }

    if (q === "knock three times" || q === "knock 3 times") {
      f.doorKnockCount += 3;
      say("Thomas knocks on the inside of the bedroom door three times. One. Two. Three. Silence.", raw);
      return true;
    }

    if (hasAny(q, ["old key"]) && hasAny(q, ["empty frame", "frame"]) && hasAny(q, ["put", "place"])) {
      say("Thomas places the old key against the frame backing. It falls immediately. The frame remains stubbornly committed to photographs.", raw);
      return true;
    }

    // Flashlight battery installation is an intent family, not a magic phrase.
    const wantsFlashlightBatteryInstall =
      hasAny(q, ["put", "place", "insert", "install", "load", "use", "replace", "swap", "change"]) &&
      hasAny(q, ["battery", "batteries", "aa battery", "aa batteries", "camera battery", "camera batteries"]) &&
      hasAny(q, ["flashlight", "torch"]) &&
      !hasAny(q, ["remove", "take out", "pull out", "extract"]);

    if (wantsFlashlightBatteryInstall) {
      if (!f.flashlightSeen && !f.flashlightTaken) {
        say("Thomas has not found the flashlight yet.", raw);
      } else if (f.flashlightHasFreshBatteries) {
        say("The two working AA batteries are already installed in the flashlight.", raw);
      } else {
        // If the player explicitly transfers the known camera batteries, do not make
        // them perform a separate TAKE step just to satisfy the parser.
        if (!hasItem("Two AA batteries") && f.cameraSeen && !f.cameraBatteriesTaken) {
          f.cameraBatteriesTaken = true;
          addInventory("Two AA batteries");
        }

        if (!hasItem("Two AA batteries")) {
          say("Thomas does not have a usable pair of AA batteries for the flashlight yet.", raw);
        } else {
          if (!f.flashlightDeadBatteriesRemoved) {
            f.flashlightDeadBatteriesRemoved = true;
            addInventory("Two dead corroded AA batteries");
          }
          removeInventory("Two AA batteries");
          f.flashlightHasFreshBatteries = true;
          f.flashlightOn = false;
          say("Thomas twists open the flashlight, removes the old cells if they are still inside, installs the two usable AA batteries from the camera, and closes the compartment.", raw);
        }
      }
      return true;
    }

    if (hasAny(q, ["search side pocket", "check side pocket", "open side pocket", "search suitcase pocket", "check suitcase pocket", "look in side pocket"])) {
      f.flashlightSeen = true;
      say("Thomas unzips the suitcase's outside pocket. A small black emergency flashlight is tucked inside beside a folded luggage tag. He presses the switch. Nothing happens.", raw);
      return true;
    }

    if (hasAny(q, ["flashlight", "torch"])) {
      if (isLook && !hasAny(q, ["battery", "batteries", "compartment"])) {
        if (!f.flashlightSeen && !f.flashlightTaken) {
          say("Thomas does not see a flashlight in the open room. The suitcase has several pockets he has not checked closely.", raw);
        } else {
          const batteryText = f.flashlightHasFreshBatteries
            ? "It now contains the two clean AA batteries from the camera."
            : f.flashlightDeadBatteriesRemoved
              ? "Its battery compartment is empty."
              : "It still contains the old batteries it was stored with.";
          say(`A small black emergency flashlight, scuffed from years of being carried and forgotten. ${batteryText}`, raw);
        }
        return true;
      }

      const wantsFlashlightBatteryRemoval =
        hasAny(q, ["battery", "batteries", "aa battery", "aa batteries"]) &&
        hasAny(q, ["remove", "take out", "pull out", "extract"]) &&
        hasAny(q, ["flashlight", "torch"]);

      if (wantsFlashlightBatteryRemoval) {
        if (f.flashlightHasFreshBatteries) {
          f.flashlightHasFreshBatteries = false;
          f.flashlightOn = false;
          addInventory("Two AA batteries");
          say("Thomas opens the flashlight and removes the two working AA batteries.", raw);
        } else if (!f.flashlightDeadBatteriesRemoved) {
          f.flashlightDeadBatteriesRemoved = true;
          addInventory("Two dead corroded AA batteries");
          say("Thomas opens the flashlight and removes the two old batteries carefully. One is crusted around the terminal. They are useless.", raw);
        } else {
          say("The flashlight battery compartment is already empty.", raw);
        }
        return true;
      }

      if (isTake && !hasAny(q, ["battery", "batteries", "aa battery", "aa batteries"])) {
        if (!f.flashlightSeen) {
          say("Thomas has not found a flashlight yet.", raw);
        } else if (!f.flashlightTaken) {
          f.flashlightTaken = true;
          addInventory("Emergency flashlight");
          say("Thomas takes the emergency flashlight.", raw);
        } else {
          say("Thomas already has the flashlight.", raw);
        }
        return true;
      }

      if (hasAny(q, ["turn on", "switch on", "use", "test"])) {
        if (!f.flashlightSeen) {
          say("Thomas has not found a flashlight yet.", raw);
        } else if (f.flashlightHasFreshBatteries) {
          f.flashlightOn = true;
          say("Thomas presses the switch. A clean white beam snaps on. The flashlight works.", raw);
        } else {
          say("Thomas presses the switch. Nothing happens. He will need to check the batteries.", raw);
        }
        return true;
      }

      if (hasAny(q, ["turn off", "switch off", "shut off"])) {
        if (!f.flashlightSeen && !f.flashlightTaken) {
          say("Thomas has not found the flashlight yet.", raw);
        } else if (f.flashlightOn) {
          f.flashlightOn = false;
          say("Thomas switches the flashlight off.", raw);
        } else {
          say("The flashlight is already off.", raw);
        }
        return true;
      }

      if (hasAny(q, ["flashlight battery", "flashlight batteries", "battery compartment", "open flashlight", "open compartment", "check compartment", "check batteries"])) {
        f.flashlightBatteryChecked = true;
        if (f.flashlightHasFreshBatteries) {
          say("The flashlight's battery compartment contains the two clean AA batteries from the camera.", raw);
        } else if (f.flashlightDeadBatteriesRemoved) {
          say("The flashlight's battery compartment is empty.", raw);
        } else {
          say("Thomas twists open the flashlight. Two old AA batteries are inside. One terminal has a crust of pale corrosion around it. Neither battery looks trustworthy.", raw);
        }
        return true;
      }
    }


    return false;
  }

  function naturalBedroomObjectCommand(q, raw) {
    const f = state.flags;
    const isLook = hasAny(q, ["look", "look at", "examine", "inspect", "check", "study"]);
    const isTake = hasAny(q, ["take", "get", "pick up", "pickup", "grab", "remove"]);

    // BED: "sit down on the bed" should not be treated as sleep/lie down.
    if (hasAny(q, ["bed"]) && hasAny(q, ["sit", "sit down", "sit on", "sit down on"])) {
      f.sittingOnBed = true;
      say("Thomas sits on the edge of the bed. The mattress gives beneath his weight, familiar in a way the rest of the room still is not. From here he can reach the bedside table without standing.", raw);
      return true;
    }

    // BEDSIDE TABLE. This is intentionally checked before the bed handlers.
    if (hasAny(q, ["bedside table", "nightstand", "night stand"]) ||
        (hasAny(q, ["table"]) && !hasAny(q, ["book table", "dining table"]))) {

      if (isLook || q === "table" || q === "bedside table") {
        const position = f.tableMoved
          ? "It has been dragged several inches away from the wall."
          : "It stands close enough to the bed that Thomas can reach it without standing.";
        const drawer = f.drawerBroken
          ? "The shallow drawer has been broken free and lies on the floor."
          : f.drawerOpened
            ? "The shallow drawer is open."
            : "A shallow drawer sits beneath the top.";
        const clock = f.clockLocation === "table"
          ? (f.clockBroken ? "A damaged alarm clock remains on top." : "The dead alarm clock remains on top.")
          : "";
        say(`The bedside table is dark wood, scratched along the edges and slightly uneven on the floor. ${position} ${drawer} Thomas's phone, ${f.envelopeOpened ? "opened hospital paperwork" : "sealed hospital envelope"} and empty water glass occupy the top. ${clock}`.replace(/\s+/g, " ").trim(), raw);
        return true;
      }

      if (hasAny(q, ["open", "open table", "open bedside table", "open nightstand"])) {
        if (f.drawerBroken) {
          say("The bedside table's drawer is already broken free and lying on the floor. There is nothing left to open.", raw);
        } else if (f.drawerOpened) {
          say("The bedside-table drawer is already open.", raw);
        } else {
          f.drawerJammed = true;
          say("Thomas pulls the shallow drawer. It moves perhaps an inch before stopping abruptly. Something behind it catches against the back of the table.", raw);
        }
        return true;
      }
    }

    // CURTAINS
    if (hasAny(q, ["curtain", "curtains"])) {
      if (isLook) {
        if (f.bothCurtainsDown) {
          say("Both curtains are down. The faded fabric lies in heavy folds near the window, while the rail and torn plaster above it make Thomas's earlier decision difficult to ignore.", raw);
        } else if (f.curtainsDown) {
          say("One end of the curtain rail has torn free from the plaster. The fabric hangs crookedly, partly on the floor. The surviving end is still attached.", raw);
        } else if (f.curtainsOpen) {
          say("The heavy curtains are pulled open around the window. They are faded along the edges and dusty near the top, but otherwise intact.", raw);
        } else {
          say("Heavy faded curtains cover most of the window. Dust has gathered along the upper folds, and a narrow strip of grey morning light escapes between them.", raw);
        }
        return true;
      }

      if (hasAny(q, ["fix", "repair", "reattach", "put back up", "hang back up"])) {
        f.curtainsFixAttempted = true;
        if (f.curtainsDown || f.bothCurtainsDown) {
          say("Thomas examines the torn mounting point. The rail did not simply come loose; it pulled part of the old plaster out with it. He can straighten the fabric and move it out of the way, but properly putting the curtains back up will require new anchors and more enthusiasm for home repair than he currently possesses. The damage remains.", raw);
        } else {
          say("Thomas straightens the curtains and checks the rail. Nothing is actually broken yet. This may be the first problem in the room he has successfully prevented himself from creating.", raw);
        }
        return true;
      }
    }

    // WALLET
    if (hasAny(q, ["wallet"])) {
      if (isLook || hasAny(q, ["open wallet", "check wallet"])) {
        say("Thomas's wallet is the same worn dark leather one he carried into the hospital. Inside are his driver's licence, bank cards, health card, a few receipts and forty-three dollars in cash. His address is still this house. Seeing it printed there makes the return feel oddly official.", raw);
        return true;
      }
      if (hasAny(q, ["take wallet", "pick up wallet", "get wallet"])) {
        if (state.inventory.includes("Wallet")) say("Thomas already has his wallet.", raw);
        else {
          addInventory("Wallet");
          say("Thomas takes his wallet.", raw);
        }
        return true;
      }
    }

    // PHONE
    if (hasAny(q, ["phone", "cell phone", "mobile"])) {
      if (isLook || hasAny(q, ["check phone", "look at screen", "check screen"])) {
        say("Thomas's phone shows 8:17 a.m. The battery is at sixty-eight percent. There are several routine notifications, no missed emergency calls and nothing on the lock screen that explains why the alarm clock beside it is dead.", raw);
        return true;
      }
      if (hasAny(q, ["pick up phone", "take phone", "get phone"])) {
        if (state.inventory.includes("Phone")) say("Thomas already has his phone.", raw);
        else {
          addInventory("Phone");
          say("Thomas takes his phone.", raw);
        }
        return true;
      }
      if (hasAny(q, ["plug phone in", "plug in phone", "charge phone", "plug phone charger in", "plug charger into outlet", "plug phone into outlet"])) {
        if (!f.chargerTaken && !hasItem("Phone charger")) {
          say(f.tableMoved
            ? "Thomas's phone charger is still lying behind the bedside table. He would need to pick it up first."
            : "Thomas needs his phone charger before he can test the outlet.", raw);
        } else {
          f.bedroomOutletTested = true;
          say("Thomas plugs the charger into the bedroom outlet and connects his phone. Nothing happens. The phone does not acknowledge external power at all. The outlet is dead too. So it is not just the alarm clock.", raw);
        }
        return true;
      }
    }

    // PLASTIC STAR
    if (hasAny(q, ["star", "plastic star", "glow in dark star", "glow-in-the-dark star"])) {
      if (isLook) {
        if (!f.starSeen) {
          say("Thomas does not see a star anywhere in the room.", raw);
        } else if (f.starLocation === "outside" || isOutside("Glow-in-the-dark plastic star")) {
          say("The little plastic star is outside now. Thomas threw it there.", raw);
        } else {
          const location =
            f.starTaken || state.inventory.includes("Glow-in-the-dark plastic star")
              ? "He turns it between his fingers."
              : "It lies where it was exposed beneath the moved bed.";
          say(`${location} The star is cheap, slightly yellowed plastic with a faint greenish tint, the kind meant to absorb light and glow on a child's bedroom ceiling. There is no writing on the back and nothing obviously unusual about it.`, raw);
        }
        return true;
      }
    }

    // OLD SHOE BOX IN WARDROBE
    if (hasAny(q, ["shoe box", "shoebox", "old shoe box", "old shoebox"])) {
      if (!f.wardrobeOpened && !f.shoeBoxOpened) {
        say("The old shoe box is on the upper shelf inside the wardrobe. Thomas will need to open the wardrobe first.", raw);
        return true;
      }

      if (isLook && !hasAny(q, ["inside", "in shoe box", "in shoebox"])) {
        say("The old shoe box is plain cardboard, softened at the corners and slightly bowed from years on the wardrobe shelf. There is no label on it.", raw);
        return true;
      }

      if (hasAny(q, ["open", "look inside", "search", "check inside"])) {
        f.shoeBoxOpened = true;
        f.cameraSeen = true;
        say("Thomas lifts the lid. Inside is an old compact digital camera in a soft fabric pouch, its wrist strap tangled around a short USB cable. A pair of AA batteries are still fitted inside the camera. Nothing about the box suggests anyone meant to hide it.", raw);
        return true;
      }
    }

    // The short USB cable named in the shoe-box description is a real persistent object.
    if (hasAny(q, ["usb cable", "camera cable", "short usb cable", "charging cable"]) || q === "cable" || q === "take cable" || q === "get cable") {
      const cameraCableVisible = f.shoeBoxOpened || f.cameraSeen;
      if (isLook) {
        if (f.cameraUsbCableTaken || hasItem("Camera USB cable")) {
          say("The short USB cable from the camera is now with Thomas. It is an older data-and-charging lead, still usable if he finds anything that needs it.", raw);
        } else if (cameraCableVisible) {
          say("A short USB cable is tangled around the old camera's wrist strap inside the shoe box. It appears to be the camera's data-and-charging cable.", raw);
        } else if (f.tableMoved && hasAny(q, ["charging cable", "cable"])) {
          say(f.chargerTaken ? "Thomas already has his phone charger." : "Thomas's phone charger is visible behind the moved bedside table.", raw);
        } else {
          say("Thomas does not see a loose cable here yet.", raw);
        }
        return true;
      }

      if (isTake) {
        if (cameraCableVisible && !f.cameraUsbCableTaken) {
          f.cameraUsbCableTaken = true;
          addInventory("Camera USB cable");
          say("Thomas untangles the short USB cable from the camera strap and keeps it.", raw);
        } else if (f.cameraUsbCableTaken || hasItem("Camera USB cable")) {
          say("Thomas already has the camera's USB cable.", raw);
        } else if (f.tableMoved && !f.chargerTaken) {
          f.chargerTaken = true;
          addInventory("Phone charger");
          say("Thomas retrieves the phone charger from behind the bedside table.", raw);
        } else if (f.chargerTaken) {
          say("Thomas already has his phone charger.", raw);
        } else {
          say("Thomas does not see a loose cable he can take yet.", raw);
        }
        return true;
      }
    }

    // Bare TAKE BATTERIES should use the visible camera batteries when that is the obvious source.
    if (isTake && hasAny(q, ["battery", "batteries", "aa battery", "aa batteries"]) &&
        !hasAny(q, ["flashlight", "torch", "clock"])) {
      if (f.cameraSeen && !f.cameraBatteriesTaken) {
        f.cameraBatteriesTaken = true;
        addInventory("Two AA batteries");
        say("Thomas slides open the camera's battery compartment and removes the two AA batteries. They look old, but there is no obvious corrosion.", raw);
      } else if (f.cameraBatteriesTaken && hasItem("Two AA batteries")) {
        say("Thomas already has the two usable AA batteries from the camera.", raw);
      } else if (f.flashlightSeen && !f.flashlightDeadBatteriesRemoved) {
        f.flashlightDeadBatteriesRemoved = true;
        addInventory("Two dead corroded AA batteries");
        say("Thomas removes the two old batteries from the flashlight. One is crusted around the terminal. They are useless.", raw);
      } else if (!f.cameraSeen) {
        say("Thomas does not see any loose usable batteries yet.", raw);
      } else {
        say("There are no loose batteries left here for Thomas to take.", raw);
      }
      return true;
    }

    // Camera/batteries are deliberately basic for now, but the objects exist.
    if (hasAny(q, ["camera", "digital camera"])) {
      if (!f.cameraSeen) return false;

      if (isLook) {
        say("The compact digital camera is several years old, the kind with a small rear screen and a sliding battery door underneath. It is powered by two AA batteries. Thomas does not remember the last time either of them used it.", raw);
        return true;
      }

      if (hasAny(q, ["take camera", "pick up camera", "get camera"])) {
        if (!f.cameraTaken) {
          f.cameraTaken = true;
          addInventory("Old digital camera");
          say("Thomas takes the old digital camera.", raw);
        } else {
          say("Thomas already has the camera.", raw);
        }
        return true;
      }

      if (hasAny(q, ["open battery", "battery compartment", "take batteries", "remove batteries", "get batteries", "remove camera batteries", "take camera batteries", "get camera batteries"])) {
        if (!f.cameraBatteriesTaken) {
          f.cameraBatteriesTaken = true;
          addInventory("Two AA batteries");
          say("Thomas slides open the battery compartment and removes the two AA batteries. They look old, but there is no obvious corrosion.", raw);
        } else {
          say("The camera's battery compartment is already empty.", raw);
        }
        return true;
      }
    }

    return false;
  }

  function breakDrawer(raw, method = "smash") {
    const f = state.flags;
    f.drawerBroken = true;
    f.drawerOpened = false;
    f.drawerJammed = false;

    const keyCanMove = !f.brassKeyTaken && f.brassKeyLocation !== "inventory";
    if (keyCanMove) {
      f.brassKeySeen = true;
      f.brassKeyLocation = "underBed";
    }

    const opening = method === "yank"
      ? "Thomas braces the table with one hand and yanks hard. The thin wooden rail gives before the obstruction does. The drawer comes free, hits the floor and spills receipts and tissues across the boards."
      : "Thomas strikes the drawer hard enough to crack the thin wooden rail holding it in place. It comes free, hits the floor and spills receipts and tissues across the boards.";
    const keyLine = keyCanMove ? " Something metallic skitters beneath the bed." : "";
    say(`${opening}${keyLine} Thomas looks at the broken drawer. “That worked.” It is difficult to tell whether he considers this a victory.`, raw);
  }

  function bedroomCommand(q, raw) {
    const f = state.flags;

    // Floor-plan commands are deliberately handled before every general object
    // family. Treat PLAN / PLANS / FLOORPLAN / FLOORPLANS / FLOOR PLAN /
    // FLOOR PLANS as one object family so generic LOOK/TAKE fallbacks cannot steal them.
    const floorPlanNoun = /(?:^|\s)(?:floor plan|floor plans|house plan|house plans|architectural plan|architectural plans|plan|plans)(?:$|\s)/.test(q);
    const floorPlanTake = floorPlanNoun && /^(?:take|get|grab|hold|pick up|pickup)\b/.test(q);
    const floorPlanInspect = floorPlanNoun && (
      /^(?:look(?: at)?|examine|inspect|check|study|view|read|open|unfold)\b/.test(q) ||
      ["plan", "plans", "floor plan", "floor plans", "house plan", "house plans"].includes(q)
    );

    if (floorPlanTake || floorPlanInspect) {
      if (!f.boxUnlocked && !f.floorPlanTaken) {
        say("Thomas has not found a floor plan yet.", raw);
        return;
      }

      if (!f.floorPlanTaken) {
        f.floorPlanTaken = true;
        addInventory("Folded house floor plan");
      }

      if (floorPlanTake) {
        say("Thomas unfolds it enough to confirm what it is. Ground floor. Upper floor. Room measurements. Nothing immediately unusual. He folds it again and keeps it.", raw);
      } else {
        say("Thomas unfolds the architectural plan. It shows the ground and upper floors with room dimensions. At first glance it looks ordinary.", raw);
      }
      openFloorPlanPanel();
      return;
    }

    if (handleBedroomClock(q, raw)) return;
    if (handleMedicalDocuments(q, raw)) return;
    if (handleBedroomAuditObjects(q, raw)) return;
    if (naturalBedroomObjectCommand(q, raw)) return;
    if (extendedBedroomCommand(q, raw)) return;

    if (hasAny(q, ["look around", "look at room", "examine room", "check room", "describe room"])) {
      say("The bedroom is large enough to contain a bed, bedside table, wardrobe, bookcase, mirror, chair, laundry basket and his still-packed suitcase without feeling crowded. The curtained window and cold radiator occupy the outside wall. A small ensuite opens beside the wardrobe. The room looks lived in, abandoned, and then lived in again for exactly one night.", raw);
      return;
    }

    if (hasAny(q, ["enter bathroom", "go bathroom", "go to bathroom", "enter ensuite", "go ensuite", "open ensuite", "bathroom door"])) {
      state.flags.bathroomVisited = true;
      setRoom("ensuite");
      return;
    }

    if (hasAny(q, ["close bedroom door", "shut bedroom door", "close door", "shut door"]) &&
        !hasAny(q, ["wardrobe", "closet", "ensuite", "bathroom"])) {
      if (f.bedroomDoorOpen) {
        f.bedroomDoorOpen = false;
        say("Thomas closes the bedroom door. The dark hallway disappears behind the painted wood, leaving the room quiet again.", raw);
      } else {
        say("The bedroom door is already closed.", raw);
      }
      return;
    }

    if (hasAny(q, ["leave bedroom", "open bedroom door", "go hall", "go hallway", "enter hallway", "open door"]) && !q.includes("bathroom")) {
      f.bedroomDoorOpen = true;
      f.hallSeen = true;
      if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) {
        say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom, and the ceiling light still does not respond. He switches on the repaired flashlight. Its beam reaches cleanly down the hall. For the first time this morning, the darkness is no longer a practical obstacle.", raw);
      } else {
        say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom. Very little daylight reaches it from the stairwell, and the ceiling light does not respond when he tries the switch beside the door. He can leave if he wants, but he will not be able to see much farther down the hall without some kind of light.", raw);
      }
      return;
    }

    // Bed
    const simpleBedQuery = simplifyCommand(q);
    const wantsLookUnderBed =
      hasAny(q, ["look under bed", "check under bed", "examine under bed", "inspect under bed", "look beneath bed", "check beneath bed"]) ||
      ["under bed", "beneath bed"].includes(simpleBedQuery);

    if (wantsLookUnderBed) {
      const keyUnderBed = f.brassKeyLocation === "underBed" && !f.brassKeyTaken;
      if (f.bedMoved) {
        const keyText = keyUnderBed
          ? " A small brass key now lies in the exposed dust where it skittered after the drawer broke."
          : "";
        const slipperText = f.slipperTaken ? "" : ", a missing slipper";
        say(`With the bed pulled away from the wall, the floor beneath it is easier to see. Dust, an old blue pen${slipperText} and the disturbed patch where the little plastic star had been caught near the headboard are visible.${keyText}`, raw);
      } else {
        const starText = !f.starSeen
          ? " Something small and pale rests farther back beneath the headboard, several inches beyond comfortable reach."
          : "";
        const keyText = keyUnderBed
          ? " A small brass key also glints farther in, beyond an easy reach."
          : "";
        const slipperText = f.slipperTaken ? "an old blue pen" : "a slipper and an old blue pen";
        say(`Thomas lowers himself onto one knee and lifts the edge of the coverlet. Dust has gathered beneath the frame in uneven drifts. Near the foot of the bed lie ${slipperText}.${starText}${keyText}`, raw);
      }
      return;
    }

    if (hasAny(q, ["move bed", "push bed", "pull bed", "drag bed"])) {
      if (!f.bedMoved) {
        f.bedMoved = true;
        f.starSeen = true;
        say("The wooden frame protests loudly against the floorboards as Thomas shoves it several inches away from the wall. The effort exposes an impressive amount of dust, the missing pillow, and a small plastic star lodged near the headboard. It is one of those cheap glow-in-the-dark stars intended for a child's bedroom ceiling. Thomas turns it over. There is nothing written on it. He has no idea why it was beneath his bed.", raw);
      } else {
        say("The bed has already been moved far enough to expose the floor behind it. Thomas sees no reason to continue relocating it across the room one miserable inch at a time.", raw);
      }
      return;
    }

    if (hasAny(q, ["take star", "pick up star", "get star"])) {
      if (!f.starSeen) {
        say("Thomas does not see a star anywhere obvious.", raw);
      } else if (!f.starTaken) {
        f.starTaken = true;
        addInventory("Glow-in-the-dark plastic star");
        say("Thomas puts the little plastic star in his pocket. He has no particular reason to keep it. Apparently that has not stopped him.", raw);
      } else {
        say("The little plastic star is already in his possession.", raw);
      }
      return;
    }

    if (hasAny(q, ["flip mattress", "turn mattress", "lift mattress", "look under mattress"])) {
      if (f.mattressFlipped) {
        say("The mattress is already flipped, leaving the wooden support slats exposed.", raw);
      } else {
        f.mattressFlipped = true;
        say("Thomas strips enough bedding away to get a proper grip and wrestles the mattress upright. It is heavier and more awkward than expected. The underside reveals nothing dramatic: faded fabric, manufacturing labels, one small tear near a corner and a surprising amount of dust along the frame beneath it. The mattress is now flipped unless Thomas puts it back.", raw);
      }
      return;
    }

    if (hasAny(q, ["look at bed", "examine bed", "check bed"])) {
      const clothingText = f.wardrobeEmptied
        ? " A substantial heap of clothing from the wardrobe now covers much of the mattress."
        : "";
      say("The bed is an old wooden double with a high headboard. Thomas changed the sheets last night, but the grey coverlet beneath them is the same one he remembers. One pillow is crushed near the headboard. The second has fallen between the mattress and the wall." + clothingText, raw);
      return;
    }

    if (hasAny(q, ["remove pillowcase", "take off pillowcase", "pull pillowcase", "inside pillowcase"])) {
      say("Thomas pulls the pillowcase free. The pillow underneath is slightly yellowed with age. A small amount of lint falls from the case when he turns it inside out. Nothing else does.", raw);
      return;
    }

    if (hasAny(q, ["hide under bed", "crawl under bed", "go under bed", "get under bed", "climb under bed", "slide under bed", "scoot under bed"])) {
      say("Thomas looks at the gap beneath the frame. He is almost forty years old. He gets down anyway. It takes considerably more effort than the idea deserved, and the space smells of dust and old wood. Nothing happens. After several uncomfortable seconds, Thomas crawls back out with dust on his shirt and considerably less dignity.", raw);
      return;
    }

    if (hasAny(q, ["jump on bed", "bounce on bed"])) {
      say("Thomas considers it. No. His knees have survived enough.", raw);
      return;
    }

    if (hasAny(q, ["go to sleep forever", "sleep forever", "never leave bed"])) {
      say("Thomas pulls the blanket over himself. After several seconds, he throws it back. “Excellent plan.” He gets up.", raw);
      return;
    }

    if (hasAny(q, ["go back to sleep", "try to sleep", "sleep"]) && !hasAny(q, ["forever"])) {
      f.sleepCount += 1;
      say("Thomas lies down and closes his eyes. He gives sleep a fair attempt. It does not return. After a while he opens his eyes, annoyed at having failed at something he was doing successfully less than ten minutes ago, and sits up again.", raw);
      return;
    }

    if (hasAny(q, ["lie down", "go back to bed"])) {
      say("Thomas lies back for several seconds, staring at the ceiling. He did not return here to spend the day hiding beneath a blanket. Eventually he sits up again.", raw);
      return;
    }

    // Bedside table / drawer
    if (hasAny(q, ["look drawer", "look at drawer", "examine drawer", "check drawer", "study drawer"])) {
      if (f.drawerBroken) {
        say("The shallow bedside drawer has been torn free from its runners and lies on the floor. One thin wooden rail is cracked where Thomas forced it.", raw);
      } else if (f.drawerOpened) {
        say("The shallow bedside drawer is open now. The runners are old but intact, and the drawer itself is mostly occupied by receipts and tissues.", raw);
      } else if (f.drawerJammed) {
        say("The shallow drawer is stuck open by about an inch. The front and handle are solid enough; the resistance seems to come from something catching behind it rather than from the handle itself.", raw);
      } else {
        say("A shallow wooden drawer sits beneath the top of the bedside table. The handle is worn smooth from years of use.", raw);
      }
      return;
    }

    if (hasAny(q, ["look into drawer", "look in drawer", "look inside drawer", "check inside drawer", "examine inside drawer", "inspect inside drawer"])) {
      if (f.drawerBroken) {
        say("The drawer itself is on the floor now. Old receipts and a packet of tissues spilled out when it broke; the shallow wooden shell contains nothing else.", raw);
      } else if (f.drawerOpened) {
        say("Inside the open drawer are several old receipts and a packet of tissues. Nothing looks valuable, and nothing obvious explains why it jammed so badly.", raw);
      } else if (f.drawerJammed) {
        say("The drawer is open barely an inch. Thomas can make out the edge of a receipt and the white corner of a tissue packet, but the gap is too narrow to see what is catching behind it.", raw);
      } else {
        say("The drawer is closed. Thomas would have to open it before he could look inside.", raw);
      }
      return;
    }

    if (hasAny(q, ["open drawer", "pull drawer", "pull on drawer", "tug drawer", "tug on drawer"]) && !hasAny(q, ["harder"])) {
      if (f.drawerOpened) {
        say("The drawer is already open.", raw);
      } else if (f.drawerBroken) {
        say("The broken drawer is on the floor. Opening it further would be an impressive achievement.", raw);
      } else {
        f.drawerJammed = true;
        say("The drawer moves perhaps an inch before stopping abruptly. Thomas pulls again. Something behind it catches against the back of the table.", raw);
      }
      return;
    }

    if (hasAny(q, ["pull harder on drawer", "pull on drawer harder", "pull drawer harder", "pull harder drawer", "tug harder on drawer", "tug on drawer harder", "force drawer", "force drawer open"])) {
      if (f.drawerOpened) {
        say("The drawer is already open.", raw);
      } else if (f.drawerBroken) {
        say("There is no longer enough drawer attached to the table for this plan to have meaning.", raw);
      } else {
        f.drawerJammed = true;
        f.drawerForceAttempts += 1;
        if (f.drawerForceAttempts === 1) {
          say("Thomas braces one hand against the table and pulls harder. The drawer shifts another fraction of an inch, then stops with a wooden knock from somewhere behind it. He can force it more, but the thin rails are beginning to complain.", raw);
        } else {
          say("Thomas hauls on it again. The drawer flexes in his hands but the obstruction does not give. At this point more force is likely to break the drawer before it fixes anything.", raw);
        }
      }
      return;
    }

    if (hasAny(q, ["yank drawer", "yank harder on drawer", "yank drawer harder", "jerk drawer", "wrench drawer", "rip drawer open"])) {
      if (f.drawerOpened) {
        say("The drawer is already open. Violence would now be mostly decorative.", raw);
      } else if (f.drawerBroken) {
        say("The drawer has already lost this argument.", raw);
      } else {
        breakDrawer(raw, "yank");
      }
      return;
    }

    if (hasAny(q, ["hit drawer", "bang on drawer", "bang drawer", "thump drawer", "knock drawer"]) && !hasAny(q, ["harder", "pound drawer"])) {
      if (f.drawerBroken) {
        say("Thomas hits the broken drawer once. It remains broken with admirable consistency.", raw);
      } else if (f.drawerOpened) {
        say("Thomas gives the open drawer a sharp knock with his knuckles. It rattles. This contributes nothing to the morning.", raw);
      } else {
        f.drawerImpactAttempts += 1;
        const line = f.drawerImpactAttempts === 1
          ? "Thomas gives the drawer front a solid thump with the heel of his hand. The contents rattle and the table rocks slightly, but the drawer stays jammed."
          : "He bangs on it again. The drawer rattles more enthusiastically than it moves. Whatever is catching it is unimpressed.";
        say(line, raw);
      }
      return;
    }

    if (hasAny(q, ["close drawer", "shut drawer", "push drawer closed", "push drawer in"])) {
      if (f.drawerBroken) {
        say("The drawer is on the floor and no longer attached to the table. Closing it has moved beyond the available technology.", raw);
      } else if (f.drawerOpened) {
        f.drawerOpened = false;
        f.drawerJammed = false;
        say("Thomas slides the drawer closed. It seats normally from this direction, which is mildly irritating after the effort required to open it.", raw);
      } else if (f.drawerJammed) {
        f.drawerJammed = false;
        say("Thomas pushes the partly opened drawer back in. It closes without much resistance. Whatever catches it only becomes a problem when he tries to pull it out.", raw);
      } else {
        say("The drawer is already closed.", raw);
      }
      return;
    }

    if (hasAny(q, ["move table", "move bedside table", "pull table", "drag table"])) {
      if (!f.tableMoved) {
        f.tableMoved = true;
        if (!f.brassKeyTaken && f.brassKeyLocation === "hidden") {
          f.brassKeySeen = true;
          f.brassKeyLocation = "behindTable";
        }
        const keyText = (!f.brassKeyTaken && f.brassKeyLocation === "behindTable")
          ? " beside a small brass key, both wedged in the dusty strip behind the table"
          : " in the dusty strip behind the table";
        say(`Thomas drags the bedside table several inches away from the wall. The alarm clock cord trails behind it. His phone charger lies on the floor${keyText}.`, raw);
      } else {
        say("The bedside table is already away from the wall.", raw);
      }
      return;
    }

    if (hasAny(q, ["look behind table", "look behind bedside table"])) {
      if (!f.tableMoved) {
        say("The table sits too close to the wall for Thomas to see behind it properly. He would have to move it.", raw);
      } else {
        const keyText = (!f.brassKeyTaken && f.brassKeyLocation === "behindTable")
          ? " and the small brass key"
          : "";
        say(`Behind the table are the outlet, dust and Thomas's phone charger${keyText}.`, raw);
      }
      return;
    }

    if (hasAny(q, ["take brass key", "take small key", "pick up brass key", "get brass key"])) {
      if (f.brassKeyTaken) {
        say("He already has the brass key.", raw);
      } else if (!f.brassKeySeen || f.brassKeyLocation === "hidden") {
        say("Thomas does not see a brass key in the open room.", raw);
      } else if (f.brassKeyLocation === "underBed" && !f.bedMoved) {
        say("Thomas reaches beneath the bed, but the brass key is farther in than his fingers can comfortably reach. Moving the bed would solve that problem more effectively than scraping his knuckles raw.", raw);
      } else {
        f.brassKeyTaken = true;
        f.brassKeyLocation = "inventory";
        addInventory("Small brass key");
        say("Thomas picks up the brass key. It is small, old and considerably more worn than the keys on his house ring. He does not immediately recognize it.", raw);
      }
      return;
    }

    if (hasAny(q, ["take charger", "get charger", "pick up charger"])) {
      if (!f.tableMoved) {
        say("Thomas cannot see the charger from here.", raw);
      } else if (!f.chargerTaken) {
        f.chargerTaken = true;
        addInventory("Phone charger");
        say("Thomas retrieves the charger. He remembers wondering where he had put it last night. For once, the house has provided an answer that does not require interpretation.", raw);
      } else {
        say("The phone charger is already with him.", raw);
      }
      return;
    }

    if (hasAny(q, ["pry drawer", "use coin on drawer", "use pen on drawer", "unblock drawer"])) {
      if (f.drawerBroken) {
        say("The drawer is already broken free. Prying it now would be less repair and more vandalism after the fact.", raw);
      } else if (f.drawerOpened) {
        say("The drawer is already open.", raw);
      } else {
        f.drawerOpened = true;
        f.drawerJammed = false;
        say("Thomas works at the narrow opening until he finds the obstruction and shifts it aside. The drawer slides open. Inside are several old receipts, a packet of tissues and nothing remotely worth the effort.", raw);
      }
      return;
    }

    if (hasAny(q, ["smash drawer", "break drawer", "kick drawer", "kick table", "break table", "hit drawer harder", "bang drawer harder", "pound drawer"])) {
      if (f.drawerBroken) {
        say("The drawer has already lost this argument.", raw);
      } else {
        breakDrawer(raw, "smash");
      }
      return;
    }

    // Clock
    if (hasAny(q, ["look at clock", "examine clock", "check alarm clock", "alarm clock"])) {
      say("The old digital alarm clock is plugged into the wall, although the display is dark. Thomas remembers owning one like it. He is less certain that this is the same one.", raw);
      return;
    }

    if (hasAny(q, ["turn clock over", "check clock battery", "open battery compartment", "look at back of clock"])) {
      say("A small plastic cover on the underside conceals the backup battery compartment. It is empty. A faint rectangular impression in the dust shows where a battery once sat.", raw);
      return;
    }

    if (hasAny(q, ["press clock", "press buttons", "turn on clock"])) {
      say("Nothing happens. The display remains blank.", raw);
      return;
    }

    if (hasAny(q, ["lick clock"])) {
      say("Thomas looks at the alarm clock. Then at the empty room. “No.”", raw);
      return;
    }

    // Envelope
    if (hasAny(q, ["open envelope", "hospital envelope", "discharge envelope"]) && !hasAny(q, ["read clinical", "read everything", "read all"])) {
      f.envelopeOpened = true;
      say("Thomas breaks the seal. Inside are several pages of discharge paperwork, a medication schedule, follow-up information and a clinical summary he has no particular desire to read.", raw);
      return;
    }

    if (hasAny(q, ["read envelope", "read paperwork", "read discharge papers"])) {
      f.envelopeOpened = true;
      say("Most of it is exactly what Thomas expected: medication instructions, sleep recommendations, contact numbers and warnings about the return of severe confusion, paranoia or persistent sensory disturbances. The clinical summary continues for several pages.", raw);
      return;
    }

    if (hasAny(q, ["read everything", "read all pages", "read clinical summary", "read clinical notes", "read full summary"])) {
      f.envelopeOpened = true;
      if (!f.clinicalNoteRead) {
        f.clinicalNoteRead = true;
        addJournal("The discharge summary refers to a female child Thomas once claimed had lived in the house. The notes say no corroborating information was established.");
      }
      say("Thomas reads beyond the instructions and into the clinical summary. One line catches his attention: “Patient intermittently reports memories involving a female child believed to have resided in the home. No corroborating information established.” Thomas reads it twice. He remembers saying many things during the first weeks after admission that later proved unreliable. He folds the page along its existing crease. There is no reason this should be different.", raw);
      return;
    }

    if (hasAny(q, ["make paper airplane", "fold paper airplane"])) {
      if (f.paperAirplaneMade) {
        say("The deeply mediocre paper airplane is still where it collapsed near the wardrobe. Thomas has already made his point to the dietary recommendations.", raw);
      } else {
        f.paperAirplaneMade = true;
        say("Thomas stares at the discharge instructions. A minute later, he has folded the page containing his dietary recommendations into a deeply mediocre paper airplane. He throws it. It travels approximately four feet, strikes the wardrobe and collapses. His treatment team would be devastated. The paper airplane remains in the room.", raw);
      }
      return;
    }

    if (hasAny(q, ["eat paper", "eat paperwork"])) {
      say("Thomas declines. He has been discharged, not feral.", raw);
      return;
    }

    // Wardrobe
    if (hasAny(q, ["close wardrobe", "shut wardrobe", "close closet", "shut closet"])) {
      if (f.wardrobeOpened) {
        f.wardrobeOpened = false;
        say("Thomas pushes the wardrobe doors closed. The warped right door resists at the last inch before settling into its usual uneven gap.", raw);
      } else {
        say("The wardrobe is already closed.", raw);
      }
      return;
    }

    if (hasAny(q, ["open wardrobe", "open closet"])) {
      f.wardrobeOpened = true;
      f.lastPocketContext = "wardrobe";
      if (f.wardrobeEmptied) {
        say("The warped door sticks before opening. The wardrobe is noticeably barer now. Several garments still hang on both sides, along with Jennifer's dark winter coat, but a substantial amount of clothing is piled across the bed. The folded blankets and old shoe box remain on the upper shelf.", raw);
      } else {
        say("The warped door sticks before opening. Thomas's clothes occupy the left half. Jennifer's occupy the right. Several dresses hang beneath a shelf containing folded blankets and an old shoe box. Scarves and belts loop over hooks inside one door, and a few shoes remain on the floor.", raw);
      }
      return;
    }

    if (hasAny(q, ["search jennifer", "search coat", "search jennifer's pockets", "search coat pockets"]) ||
        ((q === "search pockets" || q === "look in pockets") && f.lastPocketContext !== "laundry")) {
      f.lastPocketContext = "wardrobe";
      say("Thomas checks several pockets. A hair elastic. Two coins. A grocery receipt. A crumpled gum wrapper. In Jennifer's winter coat he finds a folded shopping list: milk, laundry detergent, bananas, cereal, toothpaste, and, added at the bottom in a different pen, night-light bulbs.", raw);
      return;
    }

    if (hasAny(q, ["smell jennifer", "smell jennifer's coat", "smell jennifer coat", "sniff jennifer's coat", "smell coat"])) {
      say("Thomas hesitates before lifting the collar. The scent he remembers is gone. There is only cedar, dust and old fabric. That is worse than he expected.", raw);
      return;
    }

    if (hasAny(q, ["wear dress", "wear jennifer's dress", "put on dress"])) {
      say("Thomas considers the request. “No.”", raw);
      return;
    }

    if (hasAny(q, [
      "hide in wardrobe", "hide inside wardrobe", "climb into wardrobe", "climb in wardrobe",
      "get in wardrobe", "get into wardrobe", "go in wardrobe", "go into wardrobe",
      "enter wardrobe", "step into wardrobe", "get inside wardrobe",
      "hide in closet", "get into closet", "go into closet", "enter closet"
    ])) {
      f.wardrobeOpened = true;
      say("Thomas moves several coats aside and steps inside. There is barely enough room to close the warped door. Darkness settles around him with the dry smell of wood and old fabric. A thin blade of daylight remains visible through the warped edge. Nothing happens. Thomas opens the wardrobe again.", raw);
      return;
    }

    // Bookcase / box / photo
    if (hasAny(q, ["look at bookcase", "examine bookcase", "search bookcase"])) {
      say("The narrow bookcase contains novels, magazines, an old atlas, a home-repair manual, a dictionary and a photo album. A ceramic dish on the middle shelf holds loose change, a paperclip, a button and an old key. A small wooden box with a brass lock sits on the upper shelf.", raw);
      return;
    }

    if (hasAny(q, ["open wooden box", "open box"])) {
      if (f.boxUnlocked) {
        say("The wooden box is open. Inside are the folded house plan, several spare household keys and the trimmed photograph of Thomas and Jennifer, unless he has already taken them.", raw);
      } else if (hasItem("Small brass key")) {
        say("The lid is locked. The small brass key in Thomas's possession looks about the right size.", raw);
      } else {
        say("The lid does not move. A small brass lock is set into the front.", raw);
      }
      return;
    }

    if (hasAny(q, ["use brass key on box", "unlock box", "unlock wooden box", "key on box"])) {
      if (!hasItem("Small brass key")) {
        say("Thomas does not have a key that looks likely to fit.", raw);
      } else if (!f.boxUnlocked) {
        f.boxUnlocked = true;
        say("The brass key fits. Inside are a folded architectural plan of the house, several spare household keys and a photograph of Thomas and Jennifer standing in the back garden.", raw);
      } else {
        say("The box is already unlocked.", raw);
      }
      return;
    }

    if (hasAny(q, ["take floor plan", "take floor plans", "take house plan", "take plans", "get floor plan", "pick up floor plan"])) {
      if (!f.boxUnlocked) {
        say("Thomas has not found any floor plan in the open room.", raw);
      } else if (!f.floorPlanTaken) {
        f.floorPlanTaken = true;
        addInventory("Folded house floor plan");
        say("Thomas unfolds it enough to confirm what it is. Ground floor. Upper floor. Room measurements. Nothing immediately unusual. He folds it again and keeps it.", raw);
        openFloorPlanPanel();
      } else {
        say("The floor plan is already with him.", raw);
        openFloorPlanPanel();
      }
      return;
    }

    if (hasAny(q, ["take photograph", "take photo", "get photo"])) {
      if (!f.boxUnlocked) {
        say("Thomas has not found a loose photograph here.", raw);
      } else if (!f.photoTaken) {
        f.photoTaken = true;
        addInventory("Trimmed photograph of Thomas and Jennifer");
        say("Thomas takes the photograph from the wooden box.", raw);
      } else {
        say("He already has the photograph.", raw);
      }
      return;
    }

    if (hasAny(q, ["look at photograph", "examine photograph", "look at photo", "examine photo"])) {
      if (!f.boxUnlocked && !hasItem("Trimmed photograph of Thomas and Jennifer")) {
        say("Thomas does not have a loose photograph to examine.", raw);
      } else {
        f.photoExamined = true;
        say("Thomas and Jennifer are standing on the back patio, both looking toward whoever took the photograph. Jennifer is smiling. Thomas is squinting into the sunlight. The photograph has been cut along the right edge. The cut is not straight. Part of Jennifer's arm continues toward the missing edge as though it had once been around someone standing beside her. Thomas does not remember doing it.", raw);
      }
      return;
    }

    if (hasAny(q, ["look at empty frame", "examine empty frame", "open empty frame", "remove empty frame"])) {
      say("The smaller frame hangs slightly crooked. The glass is intact and the backing remains secured behind it, but there is no photograph. A date written lightly on the cardboard backing is from five years ago. Nothing else is marked there.", raw);
      return;
    }

    if (hasAny(q, ["put photo in frame", "put photograph in frame", "try photograph in frame", "try photo in frame"])) {
      if (!hasItem("Trimmed photograph of Thomas and Jennifer") && !f.boxUnlocked) {
        say("Thomas has no loose photograph that seems relevant.", raw);
      } else {
        f.photoTriedInFrame = true;
        addJournal("The trimmed photograph from the wooden box is the right height for the empty bedroom frame, but several centimetres too narrow. It may once have been a larger photograph.");
        say("Thomas removes the frame backing and tries the photograph. It fits vertically. Horizontally, it is too narrow by several centimetres. The photograph that belonged in the frame was larger. Thomas looks at the cut edge again.", raw);
      }
      return;
    }

    // Scratches
    if (hasAny(q, ["look at scratches", "examine scratches", "check scratches"])) {
      f.scratchesExamined = true;
      say("Three narrow scratches cut through the paint near the bottom of the bedroom door. They are close together and roughly parallel. The exposed wood beneath them has smoothed with age.", raw);
      return;
    }

    if (hasAny(q, ["measure scratches", "compare height", "kneel by scratches", "look closer at scratches"])) {
      f.scratchesMeasured = true;
      const extra = f.clinicalNoteRead
        ? " The phrase “female child” from the hospital summary returns unpleasantly to mind. Thomas dismisses the association almost as quickly as it arrives."
        : " Thomas assumes they were caused by furniture, shoes or something carried through the doorway.";
      say("Thomas crouches. The scratches begin a little more than two feet above the floor, lower than he expected." + extra, raw);
      return;
    }

    if (hasAny(q, ["smell scratches"])) {
      say("Thomas leans down and smells the scratches. They smell like painted wood. He straightens. There are moments when he suspects recovery may have been oversold.", raw);
      return;
    }

    if (hasAny(q, ["lick scratches"])) {
      say("“No. Absolutely not.”", raw);
      return;
    }

    // Curtains/window/chair/mirror
    if (hasAny(q, ["open curtains", "pull curtains", "draw curtains"]) && !q.includes("down")) {
      f.curtainsOpen = true;
      say("Thomas pulls the curtains apart. Grey morning light fills the bedroom. Below, the patio and back garden are still wet from the previous night's rain. The lawn has grown too long, and one of Jennifer's old garden beds has gone ragged at the edges. Mature trees stand beyond it, their branches partly framing the detached garage and its dark wet roof near the back fence. Nothing moves outside.", raw);
      return;
    }

    if (hasAny(q, ["pull curtains down", "rip curtains down", "yank curtains down"])) {
      if (!f.curtainsDown) {
        f.curtainsDown = true;
        f.curtainsOpen = true;
        say("Thomas grips the fabric and pulls harder than necessary. One end of the rail tears free from the plaster with a sharp crack, dropping the curtain across his shoulder and sending a small shower of dust onto the floor. Thomas stands beneath several metres of faded fabric. “Well.”", raw);
      } else {
        say("The curtains are already losing their relationship with the wall.", raw);
      }
      return;
    }

    if (hasAny(q, ["open window", "unlock window"])) {
      f.windowOpen = true;
      f.windowLocked = false;
      say("The latch lifts with some resistance. Thomas pushes the window upward. Cold air enters carrying the smell of wet leaves, damp soil and distant traffic.", raw);
      return;
    }

    if (hasAny(q, ["close window", "shut window"])) {
      f.windowOpen = false;
      f.windowLocked = true;
      f.windowWider = false;
      say("Thomas closes and latches the window.", raw);
      return;
    }

    if (hasAny(q, ["yell out window", "yell outside"])) {
      if (!f.windowOpen) {
        say("The window is closed. Thomas could open it first if he is determined to involve the neighbourhood in his morning.", raw);
      } else {
        say("Thomas leans toward the opening and calls, “Hello?” His voice carries across the wet garden. A bird somewhere beyond the fence takes offense and leaves. Nobody answers.", raw);
      }
      return;
    }

    if (hasAny(q, ["shout outside", "shout out window"])) {
      if (!f.windowOpen) {
        say("Thomas faces the closed window. Shouting through glass seems unnecessarily theatrical. He can open it first.", raw);
      } else {
        say("Thomas raises his voice toward the garden. “Anyone there?” The words carry over the patio and wet lawn toward the rear fence. Somewhere beyond the trees a dog barks once, apparently at something unrelated. No person answers.", raw);
      }
      return;
    }

    if (hasAny(q, ["sit in chair", "sit on chair"])) {
      say("Thomas moves his coat and sits. From here he can see most of the bedroom, although the bed blocks part of the floor near the far wall. The chair creaks once beneath him and settles. Nothing else happens.", raw);
      return;
    }

    if (hasAny(q, ["stand on chair", "climb on chair"])) {
      say("Thomas steps onto the chair carefully. From here he can reach the top of the wardrobe, the curtain rail and part of the air vent more comfortably.", raw);
      return;
    }

    if (hasAny(q, ["cover mirror", "put sheet over mirror", "put coat over mirror", "cover bedroom mirror"])) {
      f.mirrorCoveredBedroom = true;
      say("Thomas covers the mirror. The bedroom immediately looks stranger, not because anything has changed, but because apparently a covered mirror can make an ordinary room look like someone died in it.", raw);
      return;
    }

    if (hasAny(q, ["knock on mirror", "tap mirror"])) {
      f.mirrorKnockCount += 1;
      if (f.mirrorKnockCount < 3) {
        say("Thomas taps his knuckles against the glass. A dull, brittle sound answers him. Nothing more.", raw);
      } else {
        say("Thomas knocks again. Tap. Tap. Tap. He waits. Nothing answers. The fact that he expected otherwise annoys him.", raw);
      }
      return;
    }

    if (hasAny(q, ["knock on bedroom door", "knock on door"])) {
      f.doorKnockCount += 1;
      if (f.doorKnockCount < 3) {
        say("Thomas knocks on the inside of his own bedroom door. Three ordinary knocks travel into the hallway. Nobody answers. This was, in retrospect, an unusual thing to do.", raw);
      } else {
        say("Thomas lowers his hand. “If somebody answers eventually, I am blaming you.”", raw);
      }
      return;
    }

    // Glass / silly
    if (hasAny(q, ["throw glass", "smash glass", "break glass"])) {
      if (!f.glassBroken) {
        f.glassBroken = true;
        const coinLine = f.coinsInGlass ? " The coins skitter among the shards." : "";
        f.coinsInGlass = false;
        say("The glass strikes the wall and breaks across the floor." + coinLine + " For approximately half a second, this is satisfying. Then Thomas remembers he is barefoot.", raw);
      } else {
        say("The glass is already in pieces on the floor.", raw);
      }
      return;
    }

    if (hasAny(q, ["walk on glass", "step on glass"])) {
      say("Thomas looks down at the shards. Absolutely not.", raw);
      return;
    }

    if (hasAny(q, ["lick wall"])) {
      if (!f.wallLicked) {
        f.wallLicked = true;
        say("Thomas presses the tip of his tongue against the painted wall. Painted plaster tastes exactly as unrewarding as expected. He immediately regrets allowing this experiment to reach completion.", raw);
      } else {
        say("The first test was conclusive. Thomas refuses further peer review.", raw);
      }
      return;
    }

    if (hasAny(q, ["wear slippers on hands", "put slippers on hands", "put slipper on hands", "put slippers over hands", "slipper hands"])) {
      if (isOutside("Bedroom slipper")) {
        say("One slipper is outside. Thomas is not attempting slipper hands with an incomplete set.", raw);
      } else if (!f.slipperHandsDone) {
        f.slipperHandsDone = true;
        say("Thomas looks at the slippers. Then, against whatever remains of his better judgment, he puts them over his hands. For several seconds, he has slipper hands. Nothing about the mystery of the house improves. He removes them.", raw);
      } else {
        say("Thomas has already explored that particular frontier of human achievement.", raw);
      }
      return;
    }

    if (hasAny(q, ["wear slippers", "put on slippers", "put slippers on"]) && !hasAny(q, ["hand", "hands"])) {
      if (isOutside("Bedroom slipper")) {
        say("Thomas has only one slipper upstairs now. Wearing half a pair would be possible, but not useful.", raw);
      } else if (f.wearingSlippers) {
        say("Thomas is already wearing the slippers.", raw);
      } else {
        f.wearingSlippers = true;
        f.slippersByBed = false;
        f.slipperTaken = true;
        f.slipperLocation = "worn";
        removeInventory("Bedroom slipper");
        say("Thomas retrieves the missing slipper, finds its partner near the laundry basket, and puts them on. The floorboards are immediately less cold. A triumph of domestic engineering.", raw);
      }
      return;
    }

    if (hasAny(q, ["take slippers off", "remove slippers", "take off slippers"])) {
      if (!f.wearingSlippers) {
        say("Thomas is not wearing the slippers.", raw);
      } else {
        f.wearingSlippers = false;
        f.slippersByBed = true;
        f.slipperTaken = true;
        f.slipperLocation = "besideBed";
        removeInventory("Bedroom slipper");
        say("Thomas takes the slippers off and leaves the pair beside the bed.", raw);
      }
      return;
    }

    if (hasAny(q, ["build pillow fort", "make pillow fort"])) {
      f.pillowFort = true;
      say("Thomas actually considers it. Several minutes later, the bed has been partially dismantled into an unimpressive defensive structure. He looks at it. “Excellent use of the morning.”", raw);
      return;
    }

    if (hasAny(q, ["climb out window", "climb through window", "climb outside through window"])) {
      f.windowExitAttemptCount += 1;
      f.windowClimbAttemptCount += 1;

      const climbResponses = [
        "Thomas looks down across the patio toward the garden and garage roof. “No.” Stairs have not yet become unfashionable.",
        "Thomas looks out the window again. “Still no.” The stairs remain approximately fifteen feet away and considerably less stupid.",
        "Thomas puts one hand on the window frame, pauses, and looks back toward the bedroom door. “You know there are stairs.”",
        "Thomas does not move toward the window. “We have covered this.”",
        "“No.”"
      ];

      const i = Math.min(f.windowClimbAttemptCount - 1, climbResponses.length - 1);
      say(climbResponses[i], raw);
      return;
    }

    if (hasAny(q, ["jump out window", "jump through window", "jump outside"])) {
      f.windowExitAttemptCount += 1;
      f.windowJumpAttemptCount += 1;

      const jumpResponses = [
        "Thomas looks down across the patio toward the garden and garage roof. “No.” He is not jumping out of a second-storey window.",
        "Thomas glances at the drop again. “No. Surprisingly, the height has not improved.”",
        "Thomas steps back from the window. “If your plan requires me to break both ankles before breakfast, it needs work.”",
        "He does not even look outside this time. “No.”",
        "Thomas ignores the suggestion."
      ];

      const i = Math.min(f.windowJumpAttemptCount - 1, jumpResponses.length - 1);
      say(jumpResponses[i], raw);
      return;
    }

    if (hasAny(q, ["hurt yourself", "punch self", "kill yourself", "cut yourself"])) {
      say("Thomas understands the instruction. He is not doing it.", raw);
      return;
    }

    if (hasAny(q, ["set fire", "burn house", "burn room"])) {
      say("Thomas refuses. Burning down the property while he is standing inside it would be an unusually poor opening strategy.", raw);
      return;
    }

    if (hasAny(q, ["emma"])) {
      say("Thomas freezes at the name. Emma. He does not know why it feels as though he should recognize it. “Who?”", raw);
      return;
    }

    if (hasAny(q, ["jennifer"])) {
      say("Thomas goes quiet for a moment. Jennifer's name still belongs in the house too easily. He says nothing else.", raw);
      return;
    }

    genericFallback(q, raw);
  }

  function extendedBedroomCommand(q, raw) {
    const f = state.flags;

    if (hasAny(q, ["look around", "look at room", "examine room", "check room", "describe room"])) {
      const changed = [];
      if (f.bedMoved) changed.push("The bed has been shoved away from the wall.");
      if (f.mattressFlipped) changed.push("The mattress is flipped and the bedding is disturbed.");
      if (f.pillowFort) changed.push("A poor excuse for a pillow fort occupies part of the bed.");
      if (f.wardrobeEmptied) changed.push("Clothing from the wardrobe is piled across the bed.");
      if (f.curtainsDown) changed.push(f.bothCurtainsDown ? "Both curtains have been pulled down." : "One curtain hangs partly from a damaged rail.");
      if (f.chairBarricade) changed.push("The chair is wedged beneath the bedroom doorknob.");
      if (f.mirrorBedroomTurned) changed.push("The full-length mirror faces the wall.");
      else if (f.mirrorCoveredBedroom || f.coatOverMirror) changed.push("The full-length mirror is covered.");
      if (f.tableMoved) changed.push("The bedside table has been dragged away from the wall.");
      if (f.drawerBroken) changed.push("The bedside drawer lies broken on the floor.");
      if (f.glassBroken) changed.push("Broken glass remains near the wall.");
      if (f.bookUnderTable) changed.push("A paperback is wedged beneath one table leg.");
      if (state.outside && state.outside.length) {
        const outsideSummary = state.outside.map(item => `${escapeHtml(item)} ${escapeHtml(outsideLocationText(outsideLocation(item)))}`);
        changed.push(`Thomas has also thrown ${outsideSummary.join(", ")}.`);
      }
      const extra = changed.length ? ` The room also bears the consequences of his decisions: ${changed.join(" ")}` : "";
      say("The bedroom contains the old wooden bed, bedside table, wardrobe, bookcase, full-length mirror, chair, laundry basket, his suitcase, the curtained window and cold radiator, with the small ensuite opening beside the wardrobe. Ordinary belongings still fill the room densely enough that no single object announces itself as important." + extra, raw);
      return true;
    }

    if (f.chairBarricade && hasAny(q, ["leave bedroom", "open bedroom door", "go hall", "go hallway", "enter hallway", "open door"]) && !q.includes("bathroom")) {
      say("Thomas tries the bedroom door. The chair he deliberately wedged beneath the knob prevents it from opening more than an inch. He will need to remove his own barricade first.", raw);
      return true;
    }

    // General searching and body-level commands.
    if (hasAny(q, ["search room", "search bedroom", "search everything"])) {
      say("Thomas considers where he would even begin. There are enough drawers, pockets, shelves and badly chosen pieces of furniture in the bedroom to make ‘search the room’ a project rather than an action. He will need to be more specific.", raw);
      return true;
    }

    if (q === "hide" || q === "hide somewhere") {
      say("Thomas needs to know where. The bedroom contains several possibilities, most of them undignified.", raw);
      return true;
    }

    if (q === "cry" || q === "start crying") {
      say("Thomas cannot simply decide to cry on command. He is not a tap-controlled sadness dispenser.", raw);
      return true;
    }

    if (hasAny(q, ["scream", "shout", "yell"]) && !hasAny(q, ["window", "outside", "jennifer", "help"])) {
      say("Thomas calls out into the house. “Hello?” His voice carries into the hallway. Nothing answers.", raw);
      return true;
    }

    if (hasAny(q, ["shout jennifer", "yell jennifer", "call jennifer's name"]) && !q.includes("window")) {
      say("Thomas opens his mouth. For a moment, nothing comes out. Then he calls her name. “Jennifer?” The house remains quiet.", raw);
      return true;
    }


    if (hasAny(q, ["call jennifer", "phone jennifer", "call wife", "phone wife"]) && !hasAny(q, ["name", "window", "outside"])) {
      say("Thomas stares at the phone. Her number is still saved. He does not press it. Not yet.", raw);
      return true;
    }

    if (hasAny(q, ["talk to house", "speak to house"])) {
      say("Thomas feels ridiculous before he even begins. “Anything you would like to get out of the way?” Nothing responds. “Good.”", raw);
      return true;
    }

    if (q === "sing" || q.startsWith("sing ")) {
      say("Thomas refuses.", raw);
      return true;
    }

    if (q === "hum" || q.startsWith("hum ")) {
      say("Thomas hums several notes without realizing it, then stops because he cannot remember what song they belong to.", raw);
      return true;
    }

    if (q === "dance" || q.startsWith("dance ")) {
      say("Thomas looks around the empty bedroom. “No.”", raw);
      return true;
    }

    // Bed, pillows, sheets and things beneath it.
    if (hasAny(q, ["take pen", "get pen", "pick up pen"]) && !q.includes("pencil")) {
      if (!f.penTaken) {
        f.penTaken = true;
        addInventory("Old blue pen");
        say("Thomas reaches underneath the bed and retrieves the pen. It is an ordinary blue ballpoint with teeth marks around the end of the cap. He turns it once between his fingers, trying to remember whether the marks are his. He cannot.", raw);
      } else {
        say("Thomas already has the old blue pen.", raw);
      }
      return true;
    }

    if (hasAny(q, ["take slipper", "get slipper", "pick up slipper"])) {
      if (isOutside("Bedroom slipper")) {
        say("The slipper is outside now. Thomas has nobody to blame for this except the person issuing instructions.", raw);
      } else if (!f.slipperTaken) {
        f.slipperTaken = true;
        f.slipperLocation = "inventory";
        addInventory("Bedroom slipper");
        say("Thomas retrieves the missing slipper. It matches the one beside the laundry basket. A major domestic mystery has been resolved.", raw);
      } else {
        say("He already has the slipper.", raw);
      }
      return true;
    }

    if (hasAny(q, ["get pale object", "reach farther under bed", "reach for pale object"])) {
      if (f.bedMoved || f.starSeen) {
        say("The pale object is the little glow-in-the-dark plastic star Thomas exposed when he moved the bed.", raw);
      } else {
        say("Thomas stretches until his shoulder presses against the wooden frame, but the pale object remains several inches beyond his fingertips. He could probably reach it if the bed were moved.", raw);
      }
      return true;
    }

    if (hasAny(q, ["strip bed", "remove sheets", "take sheets off", "pull sheets off"])) {
      f.bedSheetsStripped = true;
      say("Thomas pulls the clean sheets away from the mattress. Underneath them is the old grey coverlet, and beneath that a faded mattress with a pale brown stain near one corner. He remembers the stain after staring at it for several seconds. Tea. Jennifer had laughed so hard when he dropped the mug that she spilled hers as well. The memory is ordinary enough that Thomas finds himself standing still with the sheet in his hands.", raw);
      return true;
    }

    if (hasAny(q, ["put sheets back", "remake bed", "make bed"])) {
      if (!f.bedSheetsStripped) {
        say("The clean sheets are already on the bed. Thomas decides not to remake something he has not unmade.", raw);
      } else {
        f.bedSheetsStripped = false;
        say("Thomas remakes the bed badly. Jennifer would have redone it. He leaves it alone.", raw);
      }
      return true;
    }

    if (hasAny(q, ["look at pillow", "examine pillow", "examine pillows", "look at pillows"])) {
      say("The pillows are ordinary, slightly flattened and older than Thomas would prefer to calculate. One is in its case. The other has slipped partly out during the night.", raw);
      return true;
    }

    if (hasAny(q, ["remove pillowcase", "pull pillowcase off", "take pillowcase off"])) {
      f.pillowcaseOff = true;
      addInventory("Pillowcase");
      say("Thomas pulls the pillowcase free. The pillow underneath is yellowed slightly with age and bears the faded manufacturer's tag at one end. Nothing is hidden inside the case.", raw);
      return true;
    }

    if (hasAny(q, ["turn pillowcase inside out", "inside out pillowcase"])) {
      f.pillowcaseInsideOut = true;
      say("Thomas turns the pillowcase inside out. A small amount of lint falls onto the bed. Mystery solved.", raw);
      return true;
    }

    if (hasAny(q, ["rip pillow", "tear pillow", "open pillow", "cut pillow"])) {
      say("Thomas feels along the seams. It is simply a pillow. He has no compelling reason to fill the bedroom with feathers. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["smother self", "suffocate self", "pillow over face"])) {
      say("Thomas removes the pillow from his face immediately. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["smother clock", "put pillow on clock", "put pillow over clock", "cover clock with pillow"])) {
      if (f.clockLocation === "outside") {
        say("The alarm clock is outside. Thomas cannot smother it with a pillow from the bedroom.", raw);
      } else {
        say("Thomas puts the pillow over the alarm clock. The clock, already silent, becomes even quieter. A spectacular success.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put pillow over mirror", "put pillow on mirror"])) {
      f.pillowOnMirror = true;
      say("Thomas tries to balance the pillow against the mirror. It falls off almost immediately. Thomas considers gravity vindicated.", raw);
      return true;
    }

    if (hasAny(q, ["sleep on flipped mattress", "lie on flipped mattress"])) {
      if (!f.mattressFlipped) {
        say("The mattress has not been flipped.", raw);
      } else {
        f.mattressSleepTried = true;
        say("Thomas lies down. The other side is noticeably firmer and smells faintly of old fabric. He lasts less than a minute. “This was not an improvement.”", raw);
      }
      return true;
    }

    if (hasAny(q, ["flip mattress again", "put mattress back", "turn mattress back"])) {
      if (!f.mattressFlipped) {
        say("The mattress is already the right way up.", raw);
      } else {
        f.mattressFlipped = false;
        say("Thomas puts the mattress back. He has now performed considerably more mattress maintenance than the day required.", raw);
      }
      return true;
    }

    if (hasAny(q, ["look under flipped mattress", "look at bed slats", "examine bed slats", "look at support slats", "look at slat", "examine slat", "inspect slat", "check slat", "look at support slat"])) {
      if (!f.mattressFlipped) {
        say("Thomas would need to lift or flip the mattress to see the support slats properly.", raw);
      } else if (f.mattressScratchCleaned) {
        say("The dust has been brushed away from one wooden support slat. A few shallow lines have been scratched into the wood. They look deliberate, but incomplete enough that Thomas cannot confidently read them as a word.", raw);
      } else {
        f.mattressScratchSeen = true;
        say("With the mattress out of the way, the wooden support slats are exposed. One slat bears a few shallow scratches beneath the dust. Thomas leans closer, but the marks are too faint to make out clearly.", raw);
      }
      return true;
    }

    if (hasAny(q, ["clean slat", "clean slate", "wipe slat", "clean dust off slat", "wipe dust off slat", "brush dust off slat"]) ||
        (q === "clean dust" && f.mattressFlipped)) {
      if (!f.mattressFlipped) {
        say("Thomas would need to expose the mattress supports before cleaning anything off them.", raw);
      } else {
        f.mattressScratchSeen = true;
        f.mattressScratchCleaned = true;
        say("Thomas brushes the dust away with his fingertips. A few shallow lines have been scratched into the wooden slat. They are deliberate, but faint and incomplete enough that he cannot confidently turn them into a name or word.", raw);
      }
      return true;
    }

    // Curtains and window.
    if (hasAny(q, ["pull curtains down", "rip curtains down", "yank curtains down", "tear curtains down"])) {
      f.curtainPullAttempts += 1;
      if (f.curtainsDown && !f.bothCurtainsDown && f.curtainPullAttempts >= 3) {
        f.bothCurtainsDown = true;
        f.roomMessCount += 1;
        say("Thomas looks at the surviving curtain, then at the one already lying partly on the floor. He could at least make the destruction symmetrical. He pulls. The second end comes free with another crack of plaster. The bedroom is now considerably brighter and considerably less respectable.", raw);
      } else if (!f.curtainsDown && f.curtainPullAttempts === 1) {
        say("Thomas grips the fabric near the top and pulls. The curtain rail gives a warning creak. He stops. This seems like an excellent way to turn ‘old curtains’ into ‘old curtains and a hole in the wall.’", raw);
      } else if (!f.curtainsDown) {
        f.curtainsDown = true;
        f.curtainsOpen = true;
        f.roomMessCount += 1;
        say("Thomas pulls harder. One end of the rail tears free from the plaster with a sharp crack, dropping the curtain across his shoulder and sending a small shower of dust onto the floor. Thomas stands beneath several metres of faded fabric. “Well.”", raw);
      } else {
        say("One curtain is already hanging partly from the wall. Further effort would mostly improve the symmetry of the damage.", raw);
      }
      return true;
    }

    if (hasAny(q, ["pull both curtains down", "rip both curtains down"])) {
      f.curtainsDown = true;
      f.bothCurtainsDown = true;
      f.curtainsOpen = true;
      f.roomMessCount += 1;
      say("Thomas finishes the job. Both curtains come down. The bedroom is now considerably brighter and considerably less respectable.", raw);
      return true;
    }

    if (hasAny(q, ["wrap curtain around self", "wear curtain", "wrap self in curtain"])) {
      f.curtainWrapped = true;
      say("Thomas drapes the faded curtain around his shoulders. For several seconds he resembles either an impoverished monarch or a man making increasingly questionable decisions in an empty house. He puts it down.", raw);
      return true;
    }

    if (hasAny(q, ["use curtain as blanket", "sleep under curtain"])) {
      f.curtainUsedAsBlanket = true;
      say("Thomas tries it. The fabric is dusty, heavy and smells like a cupboard. The bed already contains actual blankets. He abandons the experiment.", raw);
      return true;
    }

    if (hasAny(q, ["look behind curtains", "check behind curtains"])) {
      say("Behind the fabric are the window, the wall beside it and a line of paler paint where the curtains protected the plaster from years of sunlight. Nothing is hidden there.", raw);
      return true;
    }

    if (hasAny(q, ["look above curtain rail", "check above curtain rail"])) {
      say("Thomas looks up. Dust. A dead moth. A hairline crack in the plaster. No secret message congratulating him for checking.", raw);
      return true;
    }

    if (hasAny(q, ["smell curtains", "smell curtain"])) {
      say("Dust. Old fabric. A very small amount of regret.", raw);
      return true;
    }

    if (hasAny(q, ["look outside", "look out window", "look through window"])) {
      const thrownVisible = [];
      if (outsideLocation("Bedroom pillow") === "backLawn") thrownVisible.push("The pillow Thomas threw out is lying on the wet lawn beyond the patio.");
      if (outsideLocation("Bedroom slipper") === "backLawn") thrownVisible.push("One bedroom slipper lies darkened by rain on the lawn.");
      if (outsideLocation("Glow-in-the-dark plastic star") === "oldGardenBed") thrownVisible.push("The little plastic star is somewhere in the overgrown garden bed, far too small to pick out from up here.");
      if (outsideLocation("Alarm clock") === "stonePatio") thrownVisible.push("The alarm clock is still visible on the wet stone patio below, its casing split at one corner.");
      const thrownText = thrownVisible.length ? ` ${thrownVisible.join(" ")}` : "";
      say("From the second floor Thomas can see most of the back garden. The stone patio lies directly below, followed by a rain-dark lawn that badly needs cutting and the remains of an overgrown garden bed. Mature trees break up the view toward the rear of the property. Beyond them sits the detached garage, its wet roof clearly visible from this height. A wooden fence runs behind it, with a narrow glimpse of the rear lane and neighbouring property through the branches. Nothing appears to be watching him." + thrownText, raw);
      return true;
    }

    if (hasAny(q, ["open window wider", "raise window higher"])) {
      f.windowOpen = true;
      f.windowLocked = false;
      f.windowWider = true;
      say("Thomas pushes the window as far as the frame allows. The room cools quickly.", raw);
      return true;
    }

    if (q === "lock window" || q === "latch window") {
      if (f.windowOpen) {
        say("Thomas cannot lock the window while it is open.", raw);
      } else {
        f.windowLocked = true;
        say("Thomas checks the latch. Locked.", raw);
      }
      return true;
    }

    if (q === "unlock window") {
      f.windowLocked = false;
      say("Thomas lifts the latch.", raw);
      return true;
    }

    if (hasAny(q, ["yell jennifer out window", "shout jennifer out window", "call jennifer out window"])) {
      if (!f.windowOpen) {
        say("The window is closed.", raw);
      } else {
        say("Thomas grips the window frame. “Jennifer!” The name carries farther than he expected. For several seconds he listens. Only distant traffic and dripping gutters answer. He closes his mouth tightly and steps back.", raw);
      }
      return true;
    }

    if (hasAny(q, ["shout help", "yell help"])) {
      say("Thomas nearly does. Then stops. Nobody is currently threatening him. Standing at a window yelling for help because his bedside drawer is stuck would be difficult to explain.", raw);
      return true;
    }

    if (hasAny(q, ["whistle out window", "whistle outside"])) {
      if (!f.windowOpen) {
        say("Thomas whistles toward the closed window. The glass contributes nothing.", raw);
      } else {
        say("Thomas whistles. Several seconds later, a bird answers from somewhere beyond the fence. Thomas whistles again. The bird does not.", raw);
      }
      return true;
    }

    if (all(q, ["throw", "pillow"]) && hasAny(q, ["window", "outside"])) {
      if (!f.windowOpen) {
        say("The window is closed. Thomas is not throwing a pillow through the glass.", raw);
      } else if (isOutside("Bedroom pillow")) {
        say("The pillow is already outside.", raw);
      } else {
        f.pillowLocation = "outside";
        putOutside("Bedroom pillow", "backLawn");
        say("Thomas throws the pillow out of the window. It clears the stone patio directly below and flops onto the wet lawn a few yards beyond it. “That was clever.”", raw);
      }
      return true;
    }

    if (all(q, ["throw", "slipper"]) && hasAny(q, ["window", "outside"])) {
      if (!f.windowOpen) {
        say("The window is closed.", raw);
      } else if (isOutside("Bedroom slipper")) {
        say("That slipper is already outside on the wet lawn. Thomas cannot throw it out the window twice without retrieving it first.", raw);
      } else {
        f.slipperLocation = "outside";
        putOutside("Bedroom slipper", "backLawn");
        say("The slipper arcs over the stone patio and lands in the wet grass a few feet beyond the patio edge. Its matching partner remains upstairs. Thomas has successfully created a long-distance footwear problem.", raw);
      }
      return true;
    }

    if (all(q, ["throw", "clock"]) && hasAny(q, ["window", "outside"])) {
      if (!f.windowOpen) {
        say("The window is closed. Thomas is not hurling an alarm clock through it.", raw);
      } else if (f.clockLocation === "outside") {
        say("The alarm clock is already outside.", raw);
      } else {
        f.clockLocation = "outside";
        f.clockBroken = true;
        putOutside("Alarm clock", "stonePatio");
        say("Thomas throws the alarm clock out of the window. It drops to the wet stone patio below and hits hard enough for the casing to split at one corner. He can still see it near the patio edge. The bedroom has become marginally less mysterious and significantly less equipped with clocks.", raw);
      }
      return true;
    }

    if (all(q, ["throw", "star"]) && hasAny(q, ["window", "outside"])) {
      if (!f.windowOpen) {
        say("The window is closed.", raw);
      } else if (!f.starTaken) {
        say("Thomas would need to have the plastic star first.", raw);
      } else {
        f.starTaken = false;
        f.starLocation = "outside";
        putOutside("Glow-in-the-dark plastic star", "oldGardenBed");
        say("Thomas tosses the little plastic star out of the window. It drops into the overgrown garden bed beyond the patio and disappears among dead stems and wet leaves. Whatever purpose it had, it now has a substantially larger search area.", raw);
      }
      return true;
    }

    // Chair.
    if (hasAny(q, ["look at chair", "examine chair", "check chair"])) {
      say("The wooden chair beneath the window is simple and sturdy, with a slightly curved back and a shallow scratch across one leg. Thomas's coat is draped over it.", raw);
      return true;
    }

    if (hasAny(q, ["sit and wait", "wait in chair", "sit in chair and wait"])) {
      say("Thomas waits. The house continues being a house. After a while he becomes conscious of how ridiculous it feels to sit silently in a bedroom waiting for architecture to make the next move. He gets up.", raw);
      return true;
    }

    if (hasAny(q, ["rock chair", "rock in chair"])) {
      say("The chair does not rock. Thomas tries anyway. It responds by nearly tipping backward. He decides not to improve upon the result.", raw);
      return true;
    }

    if (hasAny(q, ["jump off chair"])) {
      say("Thomas steps down. He is not six. When the instruction persists in spirit, he jumps the remaining foot and a half to the floor. The Olympics remain unlikely to call.", raw);
      return true;
    }

    if (hasAny(q, ["throw chair"])) {
      say("Thomas grips the chair by its back, then stops. It is a perfectly functional chair. He sees no reason to start a personal feud with it.", raw);
      return true;
    }

    if (hasAny(q, ["wedge chair under door", "barricade door", "block door with chair", "put chair under door handle"])) {
      f.chairBarricade = true;
      say("Thomas angles the chair beneath the bedroom doorknob. It fits well enough to make the door difficult to open from the hallway. Nothing is currently trying to get in. Thomas tries not to think about why this seemed worth testing.", raw);
      return true;
    }

    if (hasAny(q, ["remove chair from door", "unbarricade door", "move chair from door"])) {
      f.chairBarricade = false;
      say("Thomas pulls the chair free and returns it to the room.", raw);
      return true;
    }

    // Mirror.
    if (hasAny(q, ["look in mirror", "look at reflection", "examine reflection"]) && !q.includes("bathroom")) {
      if (f.mirrorBedroomTurned) {
        say("The mirror is facing the wall. Thomas would need to turn it back if he wants the privilege of examining himself.", raw);
      } else if (f.mirrorCoveredBedroom || f.coatOverMirror) {
        say("The mirror is covered. His reflection is currently unavailable.", raw);
      } else {
        say("Thomas's reflection looks tired. His hair is flattened on one side from sleep, and the faint marks beneath his eyes have not disappeared simply because the hospital discharged him. Nothing stands behind him.", raw);
      }
      return true;
    }

    if (hasAny(q, ["look behind mirror", "check behind mirror"])) {
      if (!f.mirrorBedroomRemoved) {
        say("The mirror rests against the wall on two brackets. Thomas can remove it if he wants.", raw);
      } else {
        say("Behind the mirror is a paler rectangle of paint, two older screw holes and nothing else.", raw);
      }
      return true;
    }

    if (hasAny(q, ["remove mirror", "move mirror", "take mirror off wall"])) {
      f.mirrorBedroomRemoved = true;
      say("Thomas lifts the mirror carefully from its brackets and sets it against the wall. Behind it is a paler rectangle of paint, two older screw holes and nothing else.", raw);
      return true;
    }

    if (hasAny(q, ["clean mirror", "wipe mirror"])) {
      f.mirrorBedroomCleaned = true;
      say("Thomas wipes the dust away with his sleeve. The reflection improves. Unfortunately, so does his view of himself.", raw);
      return true;
    }

    if (hasAny(q, ["break mirror", "smash mirror"])) {
      say("Thomas raises his hand, then lowers it. “I am not smashing the mirror because you are bored.”", raw);
      return true;
    }

    if (hasAny(q, ["talk to mirror", "speak to mirror"])) {
      say("Thomas looks at himself. “Productive morning,” he says. His reflection appears unconvinced.", raw);
      return true;
    }

    if (hasAny(q, ["uncover mirror", "remove cover from mirror", "take cover off mirror"])) {
      f.mirrorCoveredBedroom = false;
      f.coatOverMirror = false;
      say("Thomas removes the covering. His reflection returns exactly where it should be.", raw);
      return true;
    }

    if (hasAny(q, ["turn mirror to wall", "face mirror to wall", "turn mirror around"])) {
      f.mirrorBedroomTurned = true;
      say("Thomas turns the mirror so the reflective surface faces the wall. From the bed, the room feels noticeably less occupied. He does not examine why.", raw);
      return true;
    }

    if (hasAny(q, ["press ear to mirror", "listen to mirror", "ear to mirror"])) {
      say("The glass is cold against Thomas's ear. He hears nothing except the faint movement of his own hand against the frame.", raw);
      return true;
    }

    if (hasAny(q, ["knock on mirror and say jennifer", "knock mirror jennifer"])) {
      say("Thomas looks directly at his reflection and knocks once against the glass. “Jennifer.” The name sounds strange spoken toward his own face. Nothing answers.", raw);
      return true;
    }

    if (hasAny(q, ["knock three times on mirror", "knock 3 times on mirror"])) {
      f.mirrorKnockCount += 3;
      say("Thomas knocks three times. Tap. Tap. Tap. He waits. Nothing happens.", raw);
      return true;
    }

    if (hasAny(q, ["lick mirror"])) {
      say("Thomas looks at the glass. “No. We have already established standards.”", raw);
      return true;
    }

    if (hasAny(q, ["knock while mirror covered", "knock on covered mirror"])) {
      if (!(f.mirrorCoveredBedroom || f.coatOverMirror)) {
        say("The mirror is not covered.", raw);
      } else {
        say("Thomas knocks against the covered glass. The fabric dulls the sound. Nothing answers.", raw);
      }
      return true;
    }

    // Knock on walls, floor, ceiling and vent.
    if (hasAny(q, ["knock all around walls", "knock on all walls", "knock around walls"])) {
      say("Thomas works his way along the walls, knocking at intervals. Most sections return the same dull sound. One area near the wardrobe sounds slightly different. Not hollow exactly. Just different enough that Thomas tries it twice.", raw);
      return true;
    }

    if (hasAny(q, ["knock on wall", "tap wall"])) {
      say("Thomas knocks against the plaster. Solid. He moves a few inches and tries again. Still solid.", raw);
      return true;
    }

    if (hasAny(q, ["knock on floor", "tap floor"])) {
      say("Thomas raps his knuckles against the floorboards. He immediately regrets choosing his knuckles for the experiment. Wood sounds like wood.", raw);
      return true;
    }

    if (hasAny(q, ["knock on ceiling", "tap ceiling"])) {
      say("Thomas climbs onto the chair and stretches enough to knock against the ceiling. Plaster dust lands directly in his face. There is justice in the world after all.", raw);
      return true;
    }

    if (hasAny(q, ["look at ceiling", "examine ceiling", "check ceiling"])) {
      say("The ceiling is pale plaster, discoloured slightly around the edges. The old crack runs from the central fixture toward the wardrobe wall. Thomas remembers that crack.", raw);
      return true;
    }

    if (hasAny(q, ["follow crack", "examine ceiling crack", "look at ceiling crack"])) {
      say("The crack is thin enough to be harmless, at least according to every contractor who has ever wanted to end a conversation quickly. It disappears beneath the ceiling moulding near the wardrobe.", raw);
      return true;
    }

    if (hasAny(q, ["poke ceiling", "prod ceiling"])) {
      say("Thomas prods the plaster with the nearest suitable object. A small amount of dust falls. Nothing opens. Thomas decides this counts as a successful structural inspection.", raw);
      return true;
    }

    if (hasAny(q, ["look at vent", "examine vent", "check air vent", "look at air vent"])) {
      say("The metal vent above the bookcase is coated around the edges with dust. The screws are old but intact.", raw);
      return true;
    }

    if (hasAny(q, ["listen at vent", "listen to vent", "ear to vent"])) {
      say("Thomas stands beneath it and listens. Air moves faintly through the duct. Nothing else.", raw);
      return true;
    }

    if (hasAny(q, ["call into vent", "yell into vent", "speak into vent"])) {
      say("“Hello?” His voice disappears into the ductwork. No answer.", raw);
      return true;
    }

    if (hasAny(q, ["remove vent", "unscrew vent", "open vent"])) {
      if (!hasItem("Small screwdriver")) {
        say("The vent is held by small screws. Thomas would need a suitable screwdriver.", raw);
      } else if (!f.ventRemoved) {
        f.ventRemoved = true;
        say("Thomas removes the screws one at a time and pulls the cover free. Inside is darkness, dust and ductwork. Nothing immediately waits there.", raw);
      } else {
        say("The vent cover is already off.", raw);
      }
      return true;
    }

    if (hasAny(q, ["reach into vent", "put hand in vent"])) {
      if (!f.ventRemoved) {
        say("The vent cover is still in place.", raw);
      } else {
        f.ventReached = true;
        say("Thomas can fit one hand inside. He finds dust. More dust. Then something soft. He jerks his hand back. It is insulation. Thomas stares at it. “Very brave.”", raw);
      }
      return true;
    }

    // Floor and radiator.
    if (hasAny(q, ["lie on floor", "lay on floor"])) {
      say("Thomas lies flat on the wooden floor. It is cold. From this angle he can see beneath the bed and bookcase more clearly. He can also see an impressive amount of dust he was previously living happily without knowing about.", raw);
      return true;
    }

    if (hasAny(q, ["roll under bed"])) {
      say("Thomas attempts to roll beneath the bed. He gets as far as one shoulder. This technique appears better suited to action films and considerably thinner people.", raw);
      return true;
    }

    if (hasAny(q, ["crawl around floor", "crawl on floor"])) {
      say("Thomas gets onto his hands and knees and looks around. From down here the scratches near the bedroom door are much easier to see. The underside of the bed is also more accessible. His dignity is not.", raw);
      return true;
    }

    if (hasAny(q, ["check floorboards", "look at floorboards", "examine floorboards"])) {
      f.floorboardGapSeen = true;
      say("Most of the boards are old but solid. Several creak when Thomas shifts his weight. One near the wardrobe has a wider gap along its edge than the others.", raw);
      return true;
    }

    if (hasAny(q, ["pry floorboard", "lift floorboard", "pull floorboard"])) {
      if (!f.floorboardGapSeen) {
        say("Thomas does not see an obvious floorboard worth prying at yet.", raw);
      } else {
        say("Thomas works at the edge. The board does not move. Whatever tool he has to hand is not enough to make this a sensible job yet. He will need something better than fingernails and optimism.", raw);
      }
      return true;
    }

    if (hasAny(q, ["look at radiator", "examine radiator"])) {
      say("The old metal radiator beneath the window is cold. Dust has gathered between the fins.", raw);
      return true;
    }

    if (hasAny(q, ["touch radiator"])) {
      say("Cold metal.", raw);
      return true;
    }

    if (hasAny(q, ["look behind radiator", "check behind radiator"])) {
      say("Thomas crouches and looks behind it. Dust, a dead spider, an old pencil and one dried leaf. Nothing else.", raw);
      return true;
    }

    if (hasAny(q, ["take pencil", "get pencil", "pick up pencil"])) {
      if (!f.pencilTaken) {
        f.pencilTaken = true;
        addInventory("Blunt pencil");
        say("Thomas retrieves the pencil. It is blunt but usable.", raw);
      } else {
        say("Thomas already has the pencil.", raw);
      }
      return true;
    }

    if (hasAny(q, ["kick radiator"])) {
      say("Thomas kicks it lightly. The metal answers with a dull clang. His foot complains more convincingly.", raw);
      return true;
    }

    if (hasAny(q, ["listen to radiator", "listen at radiator"])) {
      say("Thomas leans closer. At first he hears nothing. Then somewhere inside the pipework comes a faint metallic click. Perfectly ordinary. Probably.", raw);
      return true;
    }

    // Books, coins, old key, photo album.
    if (hasAny(q, ["take old key", "get old key", "pick up old key"])) {
      if (!f.oldKeyTaken) {
        f.oldKeyTaken = true;
        addInventory("Old useless key");
        say("Thomas adds the old key to his inventory. It looks useful. It is not.", raw);
      } else {
        say("Thomas already has the old key.", raw);
      }
      return true;
    }

    if (all(q, ["old key", "box"]) || all(q, ["old key", "door"]) || all(q, ["old key", "wardrobe"])) {
      if (!f.oldKeyTaken) {
        say("Thomas does not have the old key.", raw);
      } else {
        f.oldKeyAttempts += 1;
        if (f.oldKeyAttempts >= 4) {
          say("Thomas turns the useless key over between his fingers. “I am beginning to dislike you.”", raw);
        } else if (q.includes("wardrobe")) {
          say("There is no lock. Thomas tries the key anyway. Nothing happens.", raw);
        } else {
          say("Wrong key.", raw);
        }
      }
      return true;
    }

    if (hasAny(q, ["open photo album", "look at photo album", "look at album", "open album"])) {
      f.photoAlbumSeen = true;
      say("The album contains photographs accumulated over years. Thomas and Jennifer at restaurants. Jennifer on a beach. Thomas holding a badly assembled shelf against the kitchen wall while Jennifer apparently documented the failure instead of helping. Birthdays. Holidays. A Christmas tree leaning slightly to one side. Several spaces in the album are empty.", raw);
      return true;
    }

    if (hasAny(q, ["look at empty spaces", "check missing photos", "look at missing photos", "check photo corners"])) {
      if (!f.photoAlbumSeen) {
        say("Thomas would need to open the photo album first.", raw);
      } else {
        f.photoAlbumGapsSeen = true;
        say("The adhesive corners remain where photographs once sat. Thomas does not remember removing them. There are no captions.", raw);
      }
      return true;
    }

    if (hasAny(q, ["throw book", "throw paperback"]) && !q.includes("door")) {
      say("Thomas throws the paperback onto the bed. Literature survives.", raw);
      return true;
    }

    if (hasAny(q, ["throw book at door", "throw paperback at door"])) {
      say("The paperback strikes the door and falls open on the floor. The door remains emotionally unaffected.", raw);
      return true;
    }

    if (hasAny(q, ["read whole book", "finish book"])) {
      say("Thomas looks at the remaining three hundred pages. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["read book", "read paperback"])) {
      say("Thomas reads several pages. The protagonist is currently investigating a suspicious widow. Thomas closes it. He has enough problems without borrowing somebody else's.", raw);
      return true;
    }

    if (hasAny(q, ["stack books", "make stack of books"])) {
      f.booksStacked = true;
      say("Thomas stacks several books. He has made a slightly taller pile of books. This accomplishment is available for review at any time.", raw);
      return true;
    }

    if (hasAny(q, ["build fort with books", "book fort"])) {
      say("Thomas considers the amount of structural engineering required. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["put book under table", "book under table leg", "level table with book"])) {
      f.bookUnderTable = true;
      say("Thomas slides a paperback beneath the uneven table leg. The bedside table stops rocking. The book has finally found purpose.", raw);
      return true;
    }

    if (hasAny(q, ["take coin", "take coins", "get coin", "get coins"])) {
      if (!f.coinsTaken) {
        f.coinsTaken = true;
        addInventory("Loose coins");
        say("Thomas takes the loose coins from the ceramic dish.", raw);
      } else {
        say("He already has the loose coins.", raw);
      }
      return true;
    }

    if (hasAny(q, ["flip coin", "toss coin"])) {
      const side = Math.random() < 0.5 ? "Heads" : "Tails";
      f.coinFlipCount = (f.coinFlipCount || 0) + 1;
      if (f.coinFlipCount > 6) {
        say(`Thomas flips it again. ${side}. At this stage the coin has contributed more decision-making to the morning than he has.`, raw);
      } else {
        say(`Thomas flips a coin. ${side}.`, raw);
      }
      return true;
    }

    if (q === "throw coin" || q === "throw a coin") {
      f.coinUnderBookcase = true;
      say("The coin skips once across the floor and disappears beneath the bookcase. Thomas watches it go. He has converted money into a retrieval puzzle.", raw);
      return true;
    }

    if (hasAny(q, ["put coin in mouth", "lick coin"])) {
      say("Thomas looks at the coin. “No.”", raw);
      return true;
    }

    if (hasAny(q, ["scratch wall with coin", "use coin to scratch wall"])) {
      f.coinScratchOnWall = true;
      say("Thomas draws a short line through the paint. The mark is now permanent. He immediately dislikes having added his own unexplained scratch to the collection.", raw);
      return true;
    }

    // Glass and object combinations.
    if (hasAny(q, ["look at glass", "examine glass", "check glass"])) {
      say(f.glassBroken ? "The drinking glass is now several pieces of drinking glass." : "A plain drinking glass with a little mineral residue dried around the bottom. It is empty.", raw);
      return true;
    }

    if (hasAny(q, ["take glass", "get glass", "pick up glass"])) {
      if (f.glassBroken) {
        say("Thomas is not scooping broken glass into his pockets.", raw);
      } else if (!f.glassTaken) {
        f.glassTaken = true;
        addInventory("Water glass");
        say("Thomas takes the glass.", raw);
      } else {
        say("He already has the glass.", raw);
      }
      return true;
    }

    if (hasAny(q, ["drink from glass", "drink water from glass"])) {
      if (f.glassBroken) {
        say("The glass is in pieces on the floor. Drinking from it is no longer among the available functions.", raw);
      } else {
        say("There is nothing left to drink.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put coins in glass", "put coin in glass"])) {
      if (f.glassBroken) {
        say("The glass is broken. Thomas could place coins among the shards, but that would be a floor arrangement rather than a bank.", raw);
      } else {
        f.coinsInGlass = true;
        say("The coins clink against the bottom. Thomas has successfully converted a drinking glass into an extremely bad bank.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put star in glass", "put star in water glass"])) {
      if (!f.starTaken) {
        say("Thomas does not have the little plastic star.", raw);
      } else {
        say("The plastic star sits at the bottom of the empty glass. Thomas looks at his work. It has the unmistakable appearance of something that will confuse him later.", raw);
      }
      return true;
    }

    if (hasAny(q, ["put star in pillowcase"])) {
      if (!f.starTaken) say("Thomas does not have the star.", raw);
      else say("Thomas puts the star inside the pillowcase. The pillowcase now contains a star.", raw);
      return true;
    }

    if (hasAny(q, ["put star under pillow"])) {
      if (!f.starTaken) say("Thomas does not have the star.", raw);
      else say("Thomas slides it beneath the pillow. Nothing happens. If he sleeps on it later, the plastic edge will almost certainly punish this decision.", raw);
      return true;
    }

    if (hasAny(q, ["put old key in frame"])) {
      say("Thomas places the key against the backing. It falls immediately. The frame remains stubbornly committed to photographs.", raw);
      return true;
    }

    if (hasAny(q, ["put shopping list in frame", "frame shopping list"])) {
      if (!f.shoppingListTaken) {
        say("Thomas would need Jennifer's shopping list first.", raw);
      } else {
        f.shoppingListFramed = true;
        say("Thomas puts Jennifer's shopping list inside the empty frame. Milk, detergent, bananas, cereal and toothpaste now occupy a place of considerable visual importance. He looks at it. “This feels disrespectful.”", raw);
      }
      return true;
    }

    // Jennifer's things and wardrobe details.
    if (hasAny(q, ["look at jennifer's clothes", "examine jennifer's clothes", "look at her clothes"])) {
      say("Jennifer's clothes remain arranged with considerably more care than Thomas's. There are dresses, sweaters, several blouses and the dark coat she wore most winters. They smell faintly of fabric, cedar and fourteen months inside a closed wardrobe.", raw);
      return true;
    }

    if (hasAny(q, ["take shopping list", "get shopping list"])) {
      if (!f.shoppingListTaken) {
        f.shoppingListTaken = true;
        addInventory("Jennifer's shopping list");
        say("Thomas folds the shopping list once and puts it away. He does not know why.", raw);
      } else {
        say("He already has Jennifer's shopping list.", raw);
      }
      return true;
    }

    if (hasAny(q, ["wear jennifer's scarf", "wear scarf", "put on scarf"])) {
      f.wearingScarf = true;
      say("Thomas lifts one of Jennifer's scarves from its hook. This, apparently, is within the boundaries of dignity. He puts it on.", raw);
      return true;
    }

    if (hasAny(q, [
      "empty wardrobe", "empty closet", "pull everything out of wardrobe",
      "take clothes out of wardrobe", "take clothing out of wardrobe", "take cloths out of wardrobe",
      "remove clothes from wardrobe", "remove clothing from wardrobe", "pull clothes out of wardrobe",
      "take clothes out of closet", "remove clothes from closet"
    ])) {
      if (!f.wardrobeEmptied) {
        f.wardrobeEmptied = true;
        f.wardrobeOpened = true;
        f.roomMessCount += 1;
        say("Thomas begins removing clothing and piling it on the bed. The task takes long enough for him to regret beginning it, but eventually a substantial portion of the wardrobe has migrated into a heap across the mattress.", raw);
      } else {
        say("The wardrobe has already been subjected to this treatment.", raw);
      }
      return true;
    }

    if (hasAny(q, ["close wardrobe while inside", "close wardrobe inside"])) {
      say("Thomas closes the warped door around himself. After roughly ten seconds, this remains a wardrobe. He opens it again.", raw);
      return true;
    }

    // Frame actions.
    if (hasAny(q, ["remove frame", "take empty frame off wall"])) {
      f.frameRemoved = true;
      say("Thomas lifts the empty frame from the wall. A faint cleaner rectangle remains behind it where the wallpaper has been protected from light.", raw);
      return true;
    }

    if (hasAny(q, ["look behind frame", "check behind frame"])) {
      say("Nothing is hidden behind it.", raw);
      return true;
    }

    if (hasAny(q, ["open frame", "open empty frame"])) {
      f.frameOpened = true;
      say("Thomas bends back the small metal tabs holding the backing in place. There is no photograph. A date has been written lightly on the cardboard backing. Five years ago. Nothing else.", raw);
      return true;
    }

    // Clock details and abuse.
    if (q === "unplug clock" || q === "unplug alarm clock") {
      f.clockUnplugged = true;
      say("Thomas pulls the plug from the outlet. The clock reacts exactly as much as it did while plugged in.", raw);
      return true;
    }

    if (q === "shake clock" || q === "shake alarm clock") {
      f.clockShakeCount += 1;
      say("Something rattles faintly inside. It does not sound like a loose battery.", raw);
      return true;
    }

    if (hasAny(q, ["break clock", "smash clock"]) && !q.includes("wall")) {
      if (f.clockBroken) {
        say("The clock is already broken.", raw);
      } else {
        f.clockBroken = true;
        f.roomMessCount += 1;
        say("Apparently reason has lost the argument. Thomas strikes the clock against the edge of the table. The plastic casing cracks near one corner, and a small internal component breaks loose with a sharp rattle.", raw);
      }
      return true;
    }

    if (hasAny(q, ["throw clock at wall"])) {
      f.clockBroken = true;
      f.clockLocation = "floor";
      f.roomMessCount += 1;
      say("Thomas throws the clock harder. The casing cracks against the plaster and drops to the floor. The clock is now damaged.", raw);
      return true;
    }

    if (q === "throw clock" || q === "throw alarm clock") {
      f.clockLocation = "bed";
      say("Thomas throws the clock onto the bed. It bounces once and lands near the pillow. A surprisingly anticlimactic rebellion.", raw);
      return true;
    }

    // Laundry and suitcase details.
    if (hasAny(q, ["search laundry", "look in laundry", "check laundry basket"])) {
      f.laundrySearched = true;
      f.lastPocketContext = "laundry";
      say("Old clothes. A towel. Several socks. A shirt Thomas remembers disliking. One pair of underwear he would prefer not to conduct a forensic investigation on.", raw);
      return true;
    }

    if (hasAny(q, ["search laundry pockets", "search pockets in laundry", "check laundry pockets"]) ||
        ((q === "search pockets" || q === "look in pockets") && f.lastPocketContext === "laundry")) {
      f.laundryPocketSearched = true;
      say("One pocket contains an old movie ticket. The print has faded, but the date is still legible. Thomas remembers seeing the film with Jennifer. He does not remember whether either of them liked it.", raw);
      return true;
    }

    if (hasAny(q, ["smell laundry", "sniff laundry"])) {
      say("Thomas declines to deeply inhale fourteen-month-old laundry. There are limits.", raw);
      return true;
    }

    if (hasAny(q, ["wear old shirt", "put on old shirt"])) {
      say("Thomas changes into the old shirt. It still fits, although less comfortably than he remembers.", raw);
      return true;
    }

    if (hasAny(q, ["open suitcase", "unpack suitcase", "search suitcase"])) {
      if (f.flashlightTaken || hasItem("Emergency flashlight")) {
        say("Inside are several changes of clothes, toiletries, medication, spare shoes, his wallet, a charger adapter and a paperback he bought during his stay. The outside side pocket is empty now; Thomas already removed the emergency flashlight from it. Everything else is where he expects it to be. This is unexpectedly comforting.", raw);
      } else if (f.flashlightSeen) {
        say("Inside are several changes of clothes, toiletries, medication, spare shoes, his wallet, a charger adapter and a paperback he bought during his stay. The small emergency flashlight is still in the outside side pocket where Thomas found it. Everything else is where he expects it to be.", raw);
      } else {
        f.flashlightSeen = true;
        say("Inside are several changes of clothes, toiletries, medication, spare shoes, his wallet, a charger adapter and a paperback he bought during his stay. In the outside side pocket Thomas finds a small black emergency flashlight. He presses the switch. Nothing happens. Everything else is where he expects it to be. This is unexpectedly comforting.", raw);
      }
      return true;
    }

    if (hasAny(q, ["take all medication", "take all meds", "overdose"])) {
      say("Thomas stops. “No.” This is a hard refusal. He follows the dosage instructions.", raw);
      return true;
    }

    // Coat and pillowcase nonsense.
    if (hasAny(q, ["put on coat", "wear coat"])) {
      f.coatWorn = true;
      say("Thomas puts his coat on. He is now wearing a coat indoors.", raw);
      return true;
    }

    if (hasAny(q, ["take coat off", "remove coat"])) {
      f.coatWorn = false;
      say("Thomas removes it.", raw);
      return true;
    }

    if (hasAny(q, ["put coat over mirror", "cover mirror with coat"])) {
      f.coatOverMirror = true;
      say("The coat covers most of the reflection. One sleeve hangs down awkwardly across the glass. The mirror remains covered.", raw);
      return true;
    }

    if (hasAny(q, ["put coat over head", "cover head with coat"])) {
      f.coatOverHead = true;
      say("Thomas pulls the coat over his head. Darkness. The smell of rain-damp fabric. Somewhere nearby, the faint sound of his own breathing. Thomas removes the coat. He does not know what result he expected.", raw);
      return true;
    }

    if (hasAny(q, ["put pillowcase on head", "wear pillowcase on head"])) {
      say("Thomas holds the pillowcase. “No.” After sufficient insistence in the spirit of the command, he pulls it over his head for approximately two seconds. The world becomes beige. He removes it. “We done?”", raw);
      return true;
    }

    if (hasAny(q, ["put pillowcase on chair", "cover chair with pillowcase"])) {
      f.pillowcaseOnChair = true;
      say("Thomas puts the pillowcase over the chair back. The chair now looks vaguely haunted by somebody with extremely low standards.", raw);
      return true;
    }

    // Final absurdities and hard refusals.
    if (hasAny(q, ["use chair as weapon"])) {
      say("Thomas lifts the chair. Against what? The player will need to provide a target.", raw);
      return true;
    }

    if (hasAny(q, ["throw everything on floor", "throw everything", "trash room", "destroy room"])) {
      say("Thomas looks around the bedroom. “I am not trashing the entire room because you discovered verbs.”", raw);
      return true;
    }

    if (hasAny(q, ["turn room upside down", "flip room upside down"])) {
      say("Thomas considers the request. “That is not how rooms work.”", raw);
      return true;
    }

    if (hasAny(q, ["talk to jennifer as if she is here", "pretend jennifer is here"])) {
      say("Thomas goes quiet. There are jokes he will tolerate. This is not one of them.", raw);
      return true;
    }

    return false;
  }

  function handleEnsuiteAuditObjects(q, raw) {
    const f = state.flags;
    const isLook = hasAny(q, ["look", "look at", "examine", "inspect", "check", "study"]);
    const isTake = hasAny(q, ["take", "get", "pick up", "pickup", "grab"]);

    if (isLook && hasAny(q, ["sink", "basin", "vanity"]) && !hasAny(q, ["cupboard", "cabinet", "mirror"])) {
      say(`The sink is small white porcelain with a hairline crack near the overflow drain. The chrome faucet is spotted with old water marks. ${f.bathroomSinkFull ? "The basin is currently full of water." : "The basin is empty."}`, raw);
      return true;
    }

    if (isLook && hasAny(q, ["medicine cabinet", "mirrored cabinet"])) {
      say(f.cartoonBandageSeen
        ? "The mirrored medicine cabinet contains old toiletries, medicine, Jennifer's hand cream and a box of bandages."
        : "A shallow mirrored medicine cabinet hangs above the sink. Its door is closed.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["bathroom mirror", "mirror"])) {
      if (f.bathroomMirrorCovered) {
        say("A towel covers most of the medicine-cabinet mirror.", raw);
      } else {
        say("The bathroom mirror is unforgiving under the grey morning light. Thomas looks slightly worse here than he did in the bedroom mirror.", raw);
      }
      return true;
    }

    if (isLook && hasAny(q, ["toilet"]) && !hasAny(q, ["toilet paper"])) {
      say("The toilet is old but clean enough. The lid is down and the tank sits close to the wall beneath the frosted window.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["bathtub", "bath tub", "tub"]) && !hasAny(q, ["curtain"])) {
      say("The tub is shallow and old-fashioned, with a shower fixture above it, a rubber mat inside and a metal plug on a short chain. A faint mineral ring marks the porcelain near the drain.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["shower"]) && !hasAny(q, ["curtain"])) {
      say(f.showerRunning
        ? "Water is currently running from the old shower head with mediocre pressure."
        : "The shower fixture is old chrome above the tub. Several shampoo and body-wash bottles sit on a narrow corner shelf.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["shower curtain", "curtain"])) {
      say(f.showerCurtainDamaged
        ? "The faded shower curtain hangs unevenly where two plastic rings have snapped."
        : "The faded shower curtain hangs from cheap plastic rings. It conceals the tub exactly as successfully as a shower curtain should.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["bath mat", "mat"])) {
      say(f.bathroomMatLifted
        ? "The faded blue bath mat has been lifted away from the tile."
        : "The faded blue bath mat lies crooked in front of the tub, one corner curled slightly upward.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["towels", "towel", "towel rail"])) {
      say("Two towels hang near the door, one grey and one pale blue. Both are stiff from having been left untouched for too long.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["frosted window", "bathroom window", "window"])) {
      say(`The small frosted window above the toilet admits grey daylight without offering much of a view. ${f.bathroomWindowOpen ? "It is open, letting cold air into the room." : "A simple latch holds it closed."}`, raw);
      return true;
    }

    if (isLook && hasAny(q, ["cupboard", "cabinet under sink", "cupboard under sink", "under sink"])) {
      say(f.bathroomCupboardOpen
        ? "The cupboard beneath the sink is open. Cleaning products, spare toilet paper, a plunger, folded cloths and the small plastic step stool occupy the cramped space."
        : "Two painted cupboard doors sit beneath the sink. Moisture has swollen the wood enough that one hangs slightly crooked.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["toothbrushes", "toothbrush"])) {
      say("Two old toothbrushes sit in the chipped ceramic mug: Thomas's blue one and Jennifer's white one with a faded green stripe.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["toothpaste"])) {
      say("A partly used tube of toothpaste sits beside the toothbrush mug. It is old, ordinary and not worth turning into a mystery.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["hair dryer", "hairdryer"])) {
      say("The hair dryer is an ordinary handheld model with a coiled cord, kept near the vanity. It looks functional.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["hand cream"])) {
      say("Jennifer's hand cream tube is nearly empty. Thomas remembers her leaving tubes everywhere except wherever she actually needed them.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["nail scissors", "scissors"])) {
      say(f.nailScissorsTaken
        ? "The small nail scissors are blunt at the tips but usable for thin material."
        : "A small pair of blunt-tipped nail scissors rests with the other toiletries.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["tweezers"])) {
      say(f.tweezersTaken
        ? "The metal tweezers are narrow enough to reach into small gaps."
        : "A plain pair of metal tweezers lies among the bathroom tools.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["cleaning supplies", "cleaners", "cleaning products"])) {
      say("Several old bottles of bathroom cleaner, bleach and glass spray sit beneath the sink beside rubber gloves and folded cleaning cloths.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["toilet paper"])) {
      say("Several spare rolls of toilet paper are stored beneath the sink. They are, for once, exactly what they appear to be.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["plunger"])) {
      say("A basic rubber plunger leans at the back of the cupboard. It has so far been spared promotion to weapon or investigative instrument.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["cloths", "cleaning cloths"])) {
      say("Several folded cleaning cloths sit beneath the sink, faded from repeated washing.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["screwdriver"])) {
      say("The small screwdriver is suitable for vent covers, battery compartments and other little screws. It would be useless for heavier work.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["bobby pin", "bobby pins"])) {
      say("A few loose bobby pins sit with Jennifer's hair things. One could manipulate a simple latch, although it is not a universal skeleton key.", raw);
      return true;
    }

    if (isLook && hasAny(q, ["compact mirror"])) {
      say("A small folding compact mirror sits among the toiletries. It could be useful for seeing behind or beneath something without moving it.", raw);
      return true;
    }

    if (hasAny(q, ["open cupboard", "open cabinet under sink", "open cupboard under sink", "search cupboard", "search under sink"])) {
      f.bathroomCupboardOpen = true;
      say("The swollen cupboard door sticks before opening. Inside are cleaning products, spare toilet paper, a plunger, folded cloths and a small white plastic step stool pushed toward the back.", raw);
      return true;
    }

    if (hasAny(q, ["fill sink", "fill basin"])) {
      f.bathroomSinkFull = true;
      f.bathroomWaterRunning = false;
      say("Thomas closes the stopper and fills the basin. The water rises until the sink is full.", raw);
      return true;
    }

    if (hasAny(q, ["drain sink", "empty sink", "pull sink stopper"])) {
      f.bathroomSinkFull = false;
      say("Thomas pulls the stopper. The water circles the drain and disappears with a wet sucking sound.", raw);
      return true;
    }

    if (hasAny(q, ["drink tap water", "drink from tap", "drink faucet water"])) {
      say("Thomas drinks from his cupped hand. The water tastes faintly metallic but otherwise normal.", raw);
      return true;
    }

    if (hasAny(q, ["fill glass", "fill water glass"]) && hasItem("Water glass")) {
      say("Thomas fills the drinking glass from the tap. The water clears after a few seconds and looks normal.", raw);
      return true;
    }

    if (hasAny(q, ["lift toilet lid", "open toilet", "lift lid"])) {
      say("Thomas lifts the toilet lid. Nothing unexpected awaits him.", raw);
      return true;
    }

    if (hasAny(q, ["lift bath mat", "look under bath mat", "look under mat"])) {
      f.bathroomMatLifted = true;
      say("Thomas lifts the mat. The tiles beneath it are slightly cleaner. A small rust-coloured mark near one corner appears to be old mineral staining. Nothing more.", raw);
      return true;
    }

    if (hasAny(q, ["take towel", "get towel", "pick up towel"])) {
      f.bathroomTowelTaken = true;
      addInventory("Bathroom towel");
      say("Thomas takes one of the towels from the rail.", raw);
      return true;
    }

    if (hasAny(q, ["open bathroom window", "open frosted window", "open window"])) {
      f.bathroomWindowOpen = true;
      say("Thomas unlatches the small frosted window and pushes it outward. Cold air enters. From this angle he can see only a narrow strip of side yard and the upper branches of a tree.", raw);
      return true;
    }

    if (hasAny(q, ["close bathroom window", "close frosted window", "close window"])) {
      f.bathroomWindowOpen = false;
      say("Thomas closes and latches the frosted window.", raw);
      return true;
    }

    if (hasAny(q, ["yell out bathroom window", "shout out bathroom window", "yell out window"])) {
      if (!f.bathroomWindowOpen) {
        say("The frosted window is closed. Thomas would need to open it first.", raw);
      } else {
        say("Thomas leans toward the small opening and calls, “Hello?” His voice carries awkwardly down the side of the house. A few seconds later, somewhere nearby, a dog begins barking. “Excellent.”", raw);
      }
      return true;
    }

    if (hasAny(q, ["plug in hair dryer", "plug hair dryer in"])) {
      say("Thomas plugs the hair dryer into the bathroom outlet.", raw);
      return true;
    }

    if (hasAny(q, ["turn on hair dryer", "use hair dryer", "test hair dryer"])) {
      say("The hair dryer starts with a loud electric rush. It works normally.", raw);
      return true;
    }

    if (hasAny(q, ["dry floor with hair dryer", "use hair dryer on floor"])) {
      if (!f.bathroomFloorWet) {
        say("The floor is already dry enough that this would mostly be an exercise in noise.", raw);
      } else {
        f.bathroomFloorWet = false;
        say("Thomas points warm air across the wet tile until the worst of the water is gone. This is slower than using a towel and therefore exactly the sort of solution the morning has encouraged.", raw);
      }
      return true;
    }

    return false;
  }

  function ensuiteCommand(q, raw) {
    const f = state.flags;

    if (handleEnsuiteAuditObjects(q, raw)) return;

    if (hasAny(q, ["leave bathroom", "go bedroom", "return bedroom", "go back", "exit bathroom"])) {
      setRoom("bedroom");
      return;
    }

    if (hasAny(q, ["look around", "look at room", "examine bathroom", "describe bathroom"])) {
      say("The ensuite contains a sink and vanity, mirrored medicine cabinet, toilet, shallow tub with shower, towel rail, bath mat, frosted window and cupboard beneath the sink. Most surfaces carry the stale clutter of an ordinary bathroom that nobody bothered to empty.", raw);
      return;
    }

    // Sink
    if (hasAny(q, ["turn on tap", "run water", "open faucet", "turn on sink"])) {
      f.bathroomWaterRunning = true;
      say("The pipes complain somewhere inside the wall before water coughs from the faucet in two uneven bursts. It runs cloudy for several seconds, then clears.", raw);
      return;
    }

    if (hasAny(q, ["turn off tap", "turn off water", "close faucet"])) {
      f.bathroomWaterRunning = false;
      say("Thomas shuts off the faucet.", raw);
      return;
    }

    if (hasAny(q, ["wash face", "splash face"])) {
      say("Thomas runs cold water over his hands and splashes it across his face. For several seconds he feels more awake. Unfortunately, being awake is not the same as wanting to be here.", raw);
      return;
    }

    if (hasAny(q, ["pour water on floor", "wet floor"])) {
      f.bathroomFloorWet = true;
      say("Thomas deliberately throws water onto the tile. The floor is now wet. He looks down at it. “That helped.” It did not.", raw);
      return;
    }

    // Medicine cabinet / bandage
    if (hasAny(q, ["open medicine cabinet", "open mirror", "search medicine cabinet", "look in medicine cabinet"])) {
      f.cartoonBandageSeen = true;
      say("Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of adhesive bandages. At the back of the lowest shelf is a single small bandage printed with cartoon animals. The wrapper has yellowed slightly with age.", raw);
      return;
    }

    if (hasAny(q, ["take bandage", "take cartoon bandage", "take child bandage"])) {
      f.cartoonBandageSeen = true;
      if (!f.cartoonBandageTaken) {
        f.cartoonBandageTaken = true;
        addInventory("Small cartoon adhesive bandage");
        say("Thomas takes the small bandage. It is sized for a child. He notices that only after putting it in his hand. It probably came from a mixed box.", raw);
      } else {
        say("He already has the cartoon bandage.", raw);
      }
      return;
    }

    // Hairbrush / hair
    if (hasAny(q, ["look at hairbrush", "examine hairbrush", "jennifer's brush", "hair brush"])) {
      say("Jennifer's hairbrush lies beside the sink. Several long strands of her hair are still caught between the bristles. Thomas recognizes the colour immediately. The sight is intimate in a way the rest of the room is not.", raw);
      return;
    }

    if (hasAny(q, ["take hairbrush", "pick up hairbrush"])) {
      if (!f.hairbrushTaken) {
        f.hairbrushTaken = true;
        addInventory("Jennifer's hairbrush");
        say("Thomas takes Jennifer's hairbrush. He has no particular use for it.", raw);
      } else {
        say("Jennifer's hairbrush is already with him.", raw);
      }
      return;
    }

    if (hasAny(q, ["remove hair", "take hair from brush", "clean hairbrush"])) {
      f.hairRemoved = true;
      say("Thomas works the strands of Jennifer's hair free from the bristles. They cling briefly to his fingers before he gathers them together. He stands there longer than the task requires.", raw);
      return;
    }

    if (hasAny(q, ["smell hairbrush", "smell brush"])) {
      say("The brush smells faintly of old shampoo, dust and something Thomas recognizes too quickly to name. He puts it down.", raw);
      return;
    }

    // Perfume
    if (hasAny(q, ["smell perfume", "spray perfume", "look at perfume"])) {
      say("Thomas recognizes the scent before he consciously recognizes the bottle. Jennifer wore it rarely because she thought it was too expensive to waste on ordinary days, which meant the bottle lasted for years.", raw);
      return;
    }

    // Step stool / crayon
    if (hasAny(q, ["look at step stool", "examine stool", "look at stool"])) {
      say("The little stool is white plastic with blue rubber feet. A faded yellow star sticker remains attached to one side. It is low enough that an adult would gain very little from standing on it. Thomas assumes Jennifer used it for something.", raw);
      return;
    }

    if (hasAny(q, ["take step stool", "move step stool", "pull stool out", "get stool"])) {
      f.stoolMoved = true;
      if (!f.stoolTaken && hasAny(q, ["take", "get"])) {
        f.stoolTaken = true;
        addInventory("Small plastic step stool");
      }
      say("Thomas pulls the small plastic stool out from beneath the sink. It is light, scratched and ordinary.", raw);
      return;
    }

    if (hasAny(q, ["stand on stool", "stand on step stool"])) {
      say("Thomas stands on it. He gains approximately nine inches of height. For him, admittedly, this is not nothing.", raw);
      return;
    }

    if (hasAny(q, ["look where stool was", "look behind stool", "look under stool", "look at skirting", "look at baseboard", "look at floor behind stool"])) {
      if (!f.stoolMoved) {
        say("The stool is still pushed beneath the sink. Thomas would have to move it to see the wall and floor behind it properly.", raw);
      } else {
        if (!f.crayonSeen) {
          f.crayonSeen = true;
          addJournal("Behind the small bathroom step stool are several tiny blue, green and red marks that appear to be crayon.");
        }
        say("With the stool moved, Thomas notices several tiny marks low on the skirting board: blue, green and red. He rubs one with his thumb. Crayon. He has no idea why anyone would have drawn there.", raw);
      }
      return;
    }

    // Tools
    if (hasAny(q, ["take hair dryer", "get hair dryer"])) {
      f.hairDryerTaken = true;
      addInventory("Hair dryer");
      say("Thomas takes the hair dryer.", raw);
      return;
    }

    if (hasAny(q, ["take screwdriver", "get screwdriver"])) {
      f.screwdriverTaken = true;
      addInventory("Small screwdriver");
      say("Thomas takes the small screwdriver. It is suitable for little screws and not much else.", raw);
      return;
    }

    if (hasAny(q, ["take tweezers", "get tweezers"])) {
      f.tweezersTaken = true;
      addInventory("Tweezers");
      say("Thomas takes the tweezers.", raw);
      return;
    }

    if (hasAny(q, ["take nail scissors", "take scissors", "get scissors"])) {
      f.nailScissorsTaken = true;
      addInventory("Nail scissors");
      say("Thomas takes the small nail scissors.", raw);
      return;
    }

    if (hasAny(q, ["take compact mirror", "get compact mirror"])) {
      f.compactMirrorTaken = true;
      addInventory("Compact mirror");
      say("Thomas takes the small compact mirror.", raw);
      return;
    }

    if (hasAny(q, ["take bobby pin", "get bobby pin"])) {
      f.bobbyPinTaken = true;
      addInventory("Bobby pin");
      say("Thomas takes one of the loose bobby pins.", raw);
      return;
    }

    if (hasAny(q, ["put hair dryer in water", "drop hair dryer in water", "hair dryer in sink", "hair dryer in tub"])) {
      say("Thomas understands exactly what the idea is. “No.”", raw);
      return;
    }

    // Mirror
    if (hasAny(q, ["cover mirror", "put towel over mirror", "cover bathroom mirror"])) {
      f.bathroomMirrorCovered = true;
      say("Thomas hangs a towel across the medicine-cabinet mirror. Most of his reflection disappears. The room looks oddly different without it.", raw);
      return;
    }

    if (hasAny(q, ["uncover mirror", "remove towel from mirror"])) {
      f.bathroomMirrorCovered = false;
      say("Thomas removes the towel. His reflection returns exactly where it should be.", raw);
      return;
    }

    if (hasAny(q, ["knock on mirror", "tap mirror"])) {
      say("Thomas taps the medicine-cabinet glass. It answers with a light hollow sound because of the cabinet behind it. Nothing taps back.", raw);
      return;
    }

    // Toilet
    if (hasAny(q, ["flush toilet"])) {
      say("Thomas flushes. Water rushes around the bowl and disappears. The tank begins refilling. The toilet has successfully performed its assigned role.", raw);
      return;
    }

    if (hasAny(q, ["sit on toilet"])) {
      say("Thomas sits on the closed lid. It is not particularly comfortable, but from here the underside of the sink cabinet and the small frosted window are easier to see.", raw);
      return;
    }

    if (hasAny(q, ["drink toilet", "lick toilet", "climb into toilet"])) {
      say("Thomas looks at the toilet. “No.”", raw);
      return;
    }

    // Shower
    if (hasAny(q, ["open shower curtain", "look behind shower curtain", "pull shower curtain"])) {
      say("Thomas pulls the curtain aside. The tub is empty. Several old bottles of shampoo and body wash remain on a narrow shelf. One has fallen onto its side. Nothing else is inside.", raw);
      return;
    }

    if (hasAny(q, ["turn on shower", "run shower"])) {
      f.showerRunning = true;
      say("The pipes knock loudly inside the wall before water begins pouring from the shower head. It runs cold for several seconds before warming.", raw);
      return;
    }

    if (hasAny(q, ["turn off shower"])) {
      f.showerRunning = false;
      say("Thomas shuts off the shower.", raw);
      return;
    }

    if (hasAny(q, ["sit in tub", "sit in bathtub", "lie in tub", "lie in bathtub"])) {
      say("Thomas sits in the empty tub. The porcelain is cold through his clothes, and his shoulders barely fit comfortably. “This is miserable.” He climbs back out.", raw);
      return;
    }

    if (hasAny(q, ["hide behind shower curtain", "hide in shower", "hide in tub"])) {
      say("Thomas steps into the tub and pulls the curtain closed. For several seconds he stands in the dim enclosed space, listening to the faint sounds of the house beyond it. Nothing happens. He opens the curtain.", raw);
      return;
    }

    if (hasAny(q, ["pull shower curtain down", "rip shower curtain"])) {
      f.showerCurtainDamaged = true;
      say("Thomas pulls hard enough to snap two plastic rings. The curtain drops unevenly into the tub. He stares at it. He has achieved something. What that something is remains unclear.", raw);
      return;
    }

    // Towels/robe/slippers
    if (hasAny(q, ["wear towel as cape", "towel cape"])) {
      say("Thomas drapes the towel around his shoulders and catches sight of himself in the mirror. For several seconds, he is a deeply unimpressive superhero.", raw);
      return;
    }

    if (hasAny(q, ["take toilet paper", "get toilet paper"])) {
      if (!f.toiletPaperTaken) {
        f.toiletPaperTaken = true;
        addInventory("Roll of toilet paper");
        say("Thomas takes a roll of toilet paper. Apparently this may be relevant to the investigation.", raw);
      } else {
        say("He already has toilet paper. How much preparedness is enough?", raw);
      }
      return;
    }

    if (hasAny(q, ["wrap self in toilet paper", "wear toilet paper"])) {
      say("Several minutes later, Thomas has toilet paper wrapped loosely around one arm and shoulder. He looks into the mirror. “This is your fault.”", raw);
      return;
    }

    // Cleaning chemicals safety
    if (hasAny(q, ["drink bleach", "drink cleaner", "mix cleaners", "mix bleach"])) {
      say("Thomas refuses immediately. He is not mixing or drinking household chemicals for entertainment.", raw);
      return;
    }

    // Random
    if (hasAny(q, ["lick sink", "lick bathtub", "lick mirror", "eat soap", "drink shampoo"])) {
      say("Thomas considers the request for exactly as long as it deserves. “No.”", raw);
      return;
    }

    if (hasAny(q, ["talk to toilet"])) {
      say("Thomas looks at the closed lid. “No.”", raw);
      return;
    }

    if (hasAny(q, ["talk to shower"])) {
      say("Thomas looks at the shower head. “Morning.” The shower does not respond. “Healthy.”", raw);
      return;
    }

    genericFallback(q, raw);
  }

  function genericFallback(q, raw) {
    if (hasAny(q, ["look", "examine", "inspect", "check"])) {
      say("Thomas looks more carefully, but nothing about that particular thing seems important yet.", raw);
      return;
    }

    if (hasAny(q, ["take", "get", "pick up"])) {
      say("Thomas could take plenty of things in this room, but he cannot tell exactly what the instruction refers to.", raw);
      return;
    }

    if (hasAny(q, ["break", "smash", "kick", "throw"])) {
      say("Thomas considers it. Nothing about the current situation seems likely to improve through additional property damage.", raw);
      return;
    }

    if (hasAny(q, ["eat", "drink", "lick"])) {
      say("Thomas understands the idea. He is not doing that.", raw);
      return;
    }

    say("Thomas tries to make sense of the idea. Nothing useful comes of it.", raw);
  }

  function openFloorPlanPanel() {
    navButtons.forEach(btn => btn.classList.remove("active"));
    drawer.classList.add("open");
    drawerTitle.textContent = "House Floor Plan";
    drawerBody.innerHTML = `
      <div class="floorplan-note">Old architectural plan. Room labels are Thomas's present reading of the drawing.</div>
      <div class="floorplan-grid">
        <section class="floorplan-floor">
          <h3>Ground Floor</h3>
          <div class="floorplan-room"><b>Living Room</b><span>14 × 18</span></div>
          <div class="floorplan-room"><b>Dining Room</b><span>14 × 15</span></div>
          <div class="floorplan-room"><b>Kitchen</b><span>14 × 15</span></div>
          <div class="floorplan-room"><b>Sunroom / Family Room</b><span>14 × 16</span></div>
          <div class="floorplan-room"><b>Central Hall</b><span>10 × 16</span></div>
          <div class="floorplan-room"><b>Mudroom</b><span>8 × 10</span></div>
          <div class="floorplan-room"><b>Vestibule</b><span>6 × 8</span></div>
          <div class="floorplan-room"><b>Pantry</b><span>5 × 6</span></div>
          <div class="floorplan-room"><b>Powder Room</b><span>5 × 6</span></div>
        </section>
        <section class="floorplan-floor">
          <h3>Upper Floor</h3>
          <div class="floorplan-room"><b>Master Bedroom</b><span>14 × 16</span></div>
          <div class="floorplan-room"><b>Ensuite</b><span>8 × 10</span></div>
          <div class="floorplan-room"><b>Guest Bedroom</b><span>13 × 15</span></div>
          <div class="floorplan-room"><b>Storage</b><span>12 × 15</span></div>
          <div class="floorplan-room"><b>Main Bathroom</b><span>8 × 10</span></div>
          <div class="floorplan-room"><b>Landing / Hall</b><span>approx. 10 × 14</span></div>
          <div class="floorplan-room"><b>Linen Closet</b><span>4 × 6</span></div>
        </section>
        <section class="floorplan-floor">
          <h3>Basement</h3>
          <div class="floorplan-room"><b>Utility / Laundry</b><span>12 × 14</span></div>
          <div class="floorplan-room"><b>Workshop</b><span>14 × 14</span></div>
          <div class="floorplan-room"><b>Storage</b><span>26 × 18</span></div>
        </section>
        <section class="floorplan-floor">
          <h3>Attic</h3>
          <div class="floorplan-room"><b>Office</b><span>14 × 17</span></div>
          <div class="floorplan-room"><b>Attic Storage</b><span>14 × 16</span></div>
          <div class="floorplan-room"><b>Box / Half Bath</b><span>8 × 10</span></div>
          <div class="floorplan-room"><b>Eaves</b><span>unmeasured</span></div>
        </section>
      </div>
    `;
  }

  function openPanel(type) {
    navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.panel === type));
    drawer.classList.add("open");

    if (type === "room") {
      drawerTitle.textContent = roomTitle(state.room);
      drawerBody.innerHTML = `<div class="room-panel-description">${currentRoomDescriptionHtml()}</div>`;
    } else if (type === "inventory") {
      drawerTitle.textContent = "Inventory";
      drawerBody.innerHTML = state.inventory.length
        ? `<ul class="inventory-list">${state.inventory.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
        : `<p>Thomas is carrying nothing.</p>`;
    } else if (type === "journal") {
      drawerTitle.textContent = "Journal";
      drawerBody.innerHTML = `<ul class="journal-list">${state.journal.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
    } else {
      drawerTitle.textContent = "Settings";
      drawerBody.innerHTML = `
        <div class="setting-row"><span>Ambient sound</span><button type="button" data-setting="ambient">${state.settings.ambient ? "On" : "Off"}</button></div>
        <div class="setting-row"><span>Music</span><button type="button" data-setting="music">${state.settings.music ? "On" : "Off"}</button></div>
        <button type="button" id="resetGame" class="reset-button">Reset prototype</button>
      `;

      drawerBody.querySelectorAll("[data-setting]").forEach(btn => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.setting;
          state.settings[key] = !state.settings[key];
          btn.textContent = state.settings[key] ? "On" : "Off";
          saveState();
        });
      });

      document.getElementById("resetGame").addEventListener("click", () => {
        if (confirm("Reset this prototype and erase its local save?")) {
          state = initialState();
          saveState();
          closeDrawer();
          renderRoom();
        }
      });
    }
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    navButtons.forEach(btn => btn.classList.remove("active"));
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    input.value = "";
    handleCommand(raw);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex >= history.length ? "" : (history[historyIndex] || "");
    }
  });

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (drawer.classList.contains("open") && btn.classList.contains("active")) {
        closeDrawer();
      } else {
        openPanel(btn.dataset.panel);
      }
    });
  });

  drawerClose.addEventListener("click", closeDrawer);

  renderRoom();
})();
