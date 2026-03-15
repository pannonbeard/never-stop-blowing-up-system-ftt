export class SystemActor extends Actor {
  async addInjury(){
    const { value, max } = this.system.resources.health;

    let newHealth = value + 1;
    if(newHealth > max){
      newHealth = max;
    }

    const healthStatus = this.checkHealthStatus(newHealth);

    await this.update({
      "system.resources.health.value": newHealth,
      "healthStatus": healthStatus
    });
  }

  async healInjury(){
    const { value } = this.system.resources.health;

    const newHealth = value - 1;
    const healthStatus = this.checkHealthStatus(newHealth);

    await this.update({
      "system.resources.health.value": newHealth,
      "healthStatus": healthStatus
    });
  }

  checkHealthStatus(value){
    if(value >= 4){
      return 'Incapacitated'
    }
    else if(value == 3){
      return 'Adrenalized'
    }
    else if(value == 2){
      return 'Severe'
    }
    else if(value == 1){
      return 'Superficial'
    }
    else{
      return 'Healthy'
    }
  }

  async increaseSkillDice(skill){
    const { dice } = this.system[skill];

    let newDie = dice;

    switch(dice){
      case 4:
        newDie = 6;
        break;
      case 6:
        newDie = 8;
        break;
      case 8:
        newDie = 10;
        break;
      case 10:
        newDie = 12;
        break;
      case 12:
        newDie = 20;
        break;
      case 20:
        break;
    }

    await this.update({
      [`system.${skill}.dice`]: newDie
    });
  }

  async decreaseSkillDice(skill){
    const { dice } = this.system[skill];

    let newDie = dice;

    switch(dice){
      case 6:
        newDie = 4;
        break;
      case 8:
        newDie = 6;
        break;
      case 10:
        newDie = 8;
        break;
      case 12:
        newDie = 10;
        break;
      case 20:
        newDie = 12;
        break;
      case 4:
        break;
    }

    await this.update({
      [`system.${skill}.dice`]: newDie
    });
  }

  async spendToken(){
    const { tokens } = this.system;
    if (tokens > 0) {
      await this.update({
        "system.tokens": tokens - 1
      });
      return true;
    }
    return false;
  }

  async gainToken(){
    const { tokens } = this.system;
    await this.update({
      "system.tokens": tokens + 1
    });
  }

  async removeAbility(event) {
    let target = event.target
    const index = Number(target.closest("[data-index]").dataset.index);
    const abilities = foundry.utils.deepClone(this.system.abilities ?? []);
    abilities.splice(index, 1);

    await this.update({
      "system.abilities": abilities
    });
  }

  async addAbility() {
    console.log('adding ability')
    const abilities = foundry.utils.deepClone(this.system.abilities ?? []);
    abilities.push({ name: "", description: "" });

    await this.update({
      "system.abilities": abilities
    });
  }
}

export class SystemItem extends Item {
  get isFree() {
    return this.price < 1;
  }
}