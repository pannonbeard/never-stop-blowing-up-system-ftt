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


  
});

Hooks.once("ready", () => { 
  Actors.registerSheet("never-stop-blowing-up", characterSheet, {
      makeDefault: true,
      types: ["hero"],
      label: "NSBU.SheetLabels.Actor",
    }
  );
});