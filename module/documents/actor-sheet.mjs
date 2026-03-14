const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api
const { TextEditor, DragDrop } = foundry.applications.ux

export class NSBUActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        classes: ['sheet', 'actor'],
        tag: 'form',
        position: {
            width: 600,
            height: 600
        },
      }
}