import { NSBUActorSheet } from './actor-sheet.mjs';

export class NSBUCharacterSheet extends NSBUActorSheet {
  
  /** @inheritDoc */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ['mist-engine', 'sheet', 'actor', 'nsbu-character'],
    tag: 'form',
    position: {
        width: 1100,
        height: 800
    },
  })

  /** @override */
  static PARTS = {
    header: {
      id: 'header',
      template: '../sheets/character-header.hbs'
    },
    character: {
      id: 'character',
      template: '../sheets/character.hbs',
      scrollable: ['.scrollable']
    }
  }

}