import { HairSalon } from '../models/hair-salon.entity';

export class HairSalonTestBuilder {
  private hairSalon: HairSalon = new HairSalon();

  public static newHairSalon() {
    return new HairSalonTestBuilder();
  }

  public withId(id: number): HairSalonTestBuilder {
    this.hairSalon.id = id;
    return this;
  }
  public withName(name: string): HairSalonTestBuilder {
    this.hairSalon.name = name;
    return this;
  }
  public withAddress(address: string): HairSalonTestBuilder {
    this.hairSalon.address = address;
    return this;
  }
  public withPhone(phone: string): HairSalonTestBuilder {
    this.hairSalon.phone = phone;
    return this;
  }
  public withEmail(email: string): HairSalonTestBuilder {
    this.hairSalon.email = email;
    return this;
  }

  public withDefaultValues(): HairSalonTestBuilder {
    return this.withName('Cher Salon - Chelsea')
      .withAddress('496 Kings Road, London, SW10 0LE')
      .withPhone('0330 100 3515')
      .withEmail('help@treatwell.co.uk');
  }

  public build(): HairSalon {
    return this.hairSalon;
  }

  public static generateListOfDefaultHairSalons(length: number) {
    const result = [];
    let i = 0;
    while (i++ < length) {
      result.push(
        HairSalonTestBuilder.newHairSalon()
          .withDefaultValues()
          .withId(Math.floor(Math.random() * 100))
          .build()
      );
    }
    return result;
  }
}
