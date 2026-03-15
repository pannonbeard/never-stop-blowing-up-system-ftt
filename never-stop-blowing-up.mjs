import { SystemActor, SystemItem } from "./module/documents.mjs";
import { ActionHeroDataModel, WeaponDataModel } from "./module/data-models.mjs";
import { characterSheet } from "./module/sheets/character-sheet.mjs";


Hooks.once("init", () => {
  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = SystemActor;
  CONFIG.Item.documentClass = SystemItem;

  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    hero: ActionHeroDataModel,
  };
  CONFIG.Item.dataModels = {
    weapon: WeaponDataModel,
  };

  // Configure trackable attributes.
  CONFIG.Actor.trackableAttributes = {
    hero: {
      bar: ["resources.health"],
      value: ["progress"]
    },
    pawn: {
      bar: ["resources.health", "resources.power"],
      value: []
    }
  };
  
  foundry.applications.settings.menus.FontConfig.loadFont("OneDay", {
    editor: true,
    fonts: [
      {
        name: "OneDay",
        urls: ["systems/never-stop-blowing-up/assets/fonts/one_day.ttf"],
        sizeAdjust: "110%",
      },
    ],
  });

  foundry.applications.settings.menus.FontConfig.loadFont("FutureGlitch", {
    editor: true,
    fonts: [
      {
        name: "FutureGlitch",
        urls: ["systems/never-stop-blowing-up/assets/fonts/future_glitch.ttf"],
        sizeAdjust: "110%",
      },
    ],
  });
});

Hooks.once("ready", () => { 
  Actors.registerSheet("never-stop-blowing-up", characterSheet, {
      makeDefault: true,
      types: ["hero"],
      label: "NSBU.SheetLabels.Actor",
    }
  );
});