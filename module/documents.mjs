export class SystemActor extends Actor {
  async addInjury(){
    const { value } = this.system.resources.health;

    await this.update({
      "system.resources.health.value": value + 1
    });
  }

  async healInjury(){
    const { value } = this.system.resources.health;

    await this.update({
      "system.resources.health.value": value - 1
    });
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
}

export class SystemItem extends Item {
  get isFree() {
    return this.price < 1;
  }
}