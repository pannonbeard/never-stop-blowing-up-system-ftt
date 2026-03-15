export class characterSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
    this.editMode = false;
    this.healthStatus = 'Healthy'
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "actor"],
      template: "modules/never-stop-blowing-up/module/sheets/character.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
    });
  }

  get template() {
    return `systems/never-stop-blowing-up/module/sheets/character.hbs`;
  }

  getData() {
    const context = super.getData();
    context.system = this.actor.system;
    
    // Add edit mode state
    context.editMode = this.editMode || false;

    // Add health status
    context.healthStatus = this.getHealthStatus();
    
    // Create skills array for template
    context.skills = [
      { key: 'stunts', name: 'Stunts', dice: context.system.stunts.dice },
      { key: 'brawl', name: 'Brawl', dice: context.system.brawl.dice },
      { key: 'tough', name: 'Tough', dice: context.system.tough.dice },
      { key: 'tech', name: 'Tech', dice: context.system.tech.dice },
      { key: 'weapons', name: 'Weapons', dice: context.system.weapons.dice },
      { key: 'drive', name: 'Drive', dice: context.system.drive.dice },
      { key: 'sneak', name: 'Sneak', dice: context.system.sneak.dice },
      { key: 'wits', name: 'Wits', dice: context.system.wits.dice },
      { key: 'hot', name: 'Hot', dice: context.system.hot.dice }
    ];
    
    return context;
  }

  getHealthStatus(){
    if(this.actor.system.resources.health.value >= 4){
      return 'Dead'
    }
    else if(this.actor.system.resources.health.value == 3){
      return 'Adrenalized'
    }
    else if(this.actor.system.resources.health.value == 2){
      return 'Severe'
    }
    else if(this.actor.system.resources.health.value == 1){
      return 'Superficial'
    }
    return 'Healthy';
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add injury/heal buttons
    html.find('.add-injury').click(this._onAddInjury.bind(this));
    html.find('.heal-injury').click(this._onHealInjury.bind(this));

    // Add token buttons
    // html.find('.spend-token').click(this._onSpendToken.bind(this));
    html.find('.gain-token').click(this._onGainToken.bind(this));

    // Add settings toggle
    html.find('.settings-toggle').click(this._onToggleEditMode.bind(this));
    
    // Add reset skills button
    html.find('.reset-skills').click(this._onResetSkills.bind(this));

    // Add skill increase/decrease buttons (delegated for dynamic elements)
    html.on('click', '.increase-skill', this._onIncreaseSkill.bind(this));
    html.on('click', '.decrease-skill', this._onDecreaseSkill.bind(this));

    // Add skill roll buttons (delegated for dynamic elements)
    html.on('click', '.roll-skill', this._onRollSkill.bind(this));

    html.on('click', '.add-ability', this._onAddAbility.bind(this));
    html.on('click', '.remove-ability', this._onRemoveAbility.bind(this));
  }

  async _onAddAbility(event) {
    event.preventDefault();
    
    await this.actor.addAbility();
  }

  async _onRemoveAbility(event) {
    event.preventDefault();
  
    await this.actor.removeAbility(event);
  }

  async _onAddInjury(event) {
    event.preventDefault();
  
    await this.actor.addInjury();
  }

  async _onHealInjury(event) {
    event.preventDefault();

    await this.actor.healInjury();
  }

  async _onSpendToken(event) {
    event.preventDefault();
    await this.actor.spendToken();
  }

  async _onGainToken(event) {
    event.preventDefault();
    await this.actor.gainToken();
  }

  async _onToggleEditMode(event) {
    event.preventDefault();
    this.editMode = !this.editMode;
    this.render();
  }

  async _onResetSkills(event) {
    event.preventDefault();
    
    // Confirm reset
    const confirmed = await Dialog.confirm({
      title: "Reset Skills",
      content: "<p>Are you sure you want to reset all skills to d4?</p>",
      yes: () => true,
      no: () => false
    });
    
    if (confirmed) {
      const skills = ['stunts', 'brawl', 'tough', 'tech', 'weapons', 'drive', 'sneak', 'wits', 'hot'];
      
      for (const skill of skills) {
        // Keep decreasing until we reach d4
        while (this.actor.system[skill].dice > 4) {
          await this.actor.decreaseSkillDice(skill);
        }
      }
    }
  }

  async _onIncreaseSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    await this.actor.increaseSkillDice(skill);
  }

  async _onDecreaseSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    await this.actor.decreaseSkillDice(skill);
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    console.log("[NSBU] Rolling skill", skill, "on", this.actor?.name);

    try {
      await this._rollExplodingDice(skill);
    } catch (err) {
      console.error("[NSBU] Roll failed", err);
      ui.notifications.error("Roll failed: " + (err.message ?? err));
    }
  }

  async _rollExplodingDice(skillName) {
    const skillData = this.actor.system[skillName];
    let currentDie = skillData.dice;
    let total = 0;
    let rolls = [];
    let rollObjects = [];
    let naturalExplosions = 0; // Only count explosions from natural max rolls
    let tokensSpent = 0;

    // Dice progression: 4 → 6 → 8 → 10 → 12 → 20
    const dieProgression = [4, 6, 8, 10, 12, 20];

    while (true) {

      // Roll the current die (show with Dice So Nice if available)
      const rollFormula = `1d${currentDie}`;
      let rollObj = new Roll(rollFormula, {});
      rollObj = await rollObj.evaluate();
      rollObjects.push(rollObj);
      if (game.dice3d) await game.dice3d.show(rollObj, game.user, true);

      let roll = rollObj.total;
      const originalRoll = roll;
      let tokensUsedThisRoll = 0;
      
      // Allow token spending to increase this roll
      let tokenSpendResult = await this._promptTokenSpend(currentDie, roll, this.actor.system.tokens - tokensSpent);
      if (tokenSpendResult.spent > 0) {
        roll += tokenSpendResult.spent;
        tokensUsedThisRoll = tokenSpendResult.spent;
        tokensSpent += tokenSpendResult.spent;
      }

      const wasNaturalMax = (roll === currentDie);

      rolls.push({ 
        die: currentDie, 
        originalResult: originalRoll, 
        finalResult: roll, 
        tokensUsed: tokensUsedThisRoll,
        wasNaturalMax: wasNaturalMax
      });
      total += roll;

      // Check if this roll explodes (rolls maximum after token spending)
      if (roll !== currentDie) {
        break; // No explosion, stop rolling
      }

      // Find the next die in progression
      const currentIndex = dieProgression.indexOf(currentDie);
      if (currentIndex === -1 || currentIndex === dieProgression.length - 1) {
        break; // Can't explode further
      }

      currentDie = dieProgression[currentIndex + 1];
      
      // Only count as a natural explosion if the original roll was max (before token spending)
      if (wasNaturalMax) {
        naturalExplosions++;
      }
    }

    // Spend the tokens
    for (let i = 0; i < tokensSpent; i++) {
      await this.actor.spendToken();
    }

    // Permanently increase the character's skill die ONLY for natural explosions
    for (let i = 0; i < naturalExplosions; i++) {
      await this.actor.increaseSkillDice(skillName);
    }

    // Create chat message
    const skillLabel = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    let message = `<h3>${this.actor.name} rolls ${skillLabel}</h3>`;
    message += `<p><strong>Total:</strong> ${total}</p>`;
    message += `<p><strong>Rolls:</strong> ${rolls.map(r => {
      if (r.tokensUsed > 0) {
        return `${r.finalResult} (d${r.die}, ${r.tokensUsed} token${r.tokensUsed > 1 ? 's' : ''} spent)`;
      } else {
        return `${r.finalResult} (d${r.die})`;
      }
    }).join(' + ')}</p>`;
    
    if (naturalExplosions > 0) {
      message += `<p><em>${naturalExplosions} natural explosion${naturalExplosions > 1 ? 's' : ''}! Skill increased!</em></p>`;
    }
    if (tokensSpent > 0) {
      message += `<p><em>${tokensSpent} token${tokensSpent > 1 ? 's' : ''} spent!</em></p>`;
    }

    // Send to chat
    const hasExplosions = naturalExplosions > 0;
    const wrappedMessage = hasExplosions ? `<div class="explosion-roll">${message}</div>` : message;
    
    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: wrappedMessage,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: rollObjects
    });

    // Refresh the sheet so die values stay in sync
    this.render();
  }

  async _promptTokenSpend(dieSize, currentRoll, availableTokens) {
    return new Promise((resolve) => {
      if (availableTokens <= 0) {
        resolve({ spent: 0 });
        return;
      }

      const maxNeeded = dieSize - currentRoll;
      const maxSpendable = Math.min(availableTokens, maxNeeded);

      if (maxSpendable <= 0) {
        resolve({ spent: 0 });
        return;
      }

      // Create a simple dialog for token spending
      const content = `
        <p>You rolled ${currentRoll} on a d${dieSize}.</p>
        <p>Spend tokens to increase this roll? (Max needed: ${maxNeeded})</p>
        <p>Available tokens: ${availableTokens}</p>
        <input type="number" id="token-spend" min="0" max="${maxSpendable}" value="1" style="width: 60px;">
      `;

      new Dialog({
        title: "Spend Tokens?",
        content: content,
        buttons: {
          spend: {
            label: "Spend",
            callback: (html) => {
              const spent = parseInt(html.find('#token-spend').val()) || 0;
              resolve({ spent: Math.min(spent, maxSpendable) });
            }
          },
          skip: {
            label: "Skip",
            callback: () => resolve({ spent: 0 })
          }
        },
        default: "skip"
      }).render(true);
    });
  }
}