const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                 */
/* -------------------------------------------- */

class ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    // All Actors have resources.
    return {
      resources: new SchemaField({
        health: new SchemaField({
          min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 4 })
        }),

        turbotoken: new SchemaField({
          min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        })
      })
    };
  }
}

export class ActionHeroDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      catchphrase: new StringField({ required: true, blank: true }),
      tokens: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      abilityone: new SchemaField({
        name: new StringField({ required: true, blank: true }),
        description: new HTMLField({ required: true, blank: true })
      }),
      abilitytwo: new SchemaField({
        name: new StringField({ required: true, blank: true }),
        description: new HTMLField({ required: true, blank: true })
      }),
      abilitythree: new SchemaField({
        name: new StringField({ required: true, blank: true }),
        description: new HTMLField({ required: true, blank: true })
      }),
      stunts: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      brawl: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      tough: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      tech: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      weapons: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      drive: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      sneak: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      wits: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      }),
      hot: new SchemaField({
        dice: new NumberField({ required: true, integer: true, min: 4, max: 20, initial: 4 }),
      })
    };
  }  
}

/* -------------------------------------------- */
/*  Item Models                                 */
/* -------------------------------------------- */

export class ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      rarity: new StringField({
        required: true,
        blank: false,
        options: ["common", "uncommon", "rare", "legendary"],
        initial: "common"
      }),
      price: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
    };
  }
}

export class WeaponDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      damage: new NumberField({ required: true, integer: true, positive: true, initial: 5 })
    };
  }
}