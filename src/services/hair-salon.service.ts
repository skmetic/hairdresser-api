import { getManager, Repository } from 'typeorm';
import { Inject, Singleton } from 'typescript-ioc';
import { HairSalon } from '../models/hair-salon.entity';

@Singleton
export class HairStudioService {
  constructor() {}

  private getHairSalonRepository(): Repository<HairSalon> {
    return getManager().getRepository(HairSalon);
  }

  public async getAllHairSalons(): Promise<HairSalon[]> {
    return this.getHairSalonRepository().find();
  }

  public async findHairSalonById(id: number): Promise<HairSalon> {
    const result = await this.getHairSalonRepository().findOneById(id);
    if (!result) {
      throw new Error(`No hair salon was found for ID ${id}`);
    }
    return result;
  }
  
  public async saveHairSalon(hairSalon: HairSalon): Promise<HairSalon> {
    return this.getHairSalonRepository().save(hairSalon);
  }

  public async updateHairSalon(hairSalon: HairSalon): Promise<HairSalon | undefined> {
    await this.getHairSalonRepository().updateById(hairSalon.id, hairSalon);
    return this.getHairSalonRepository().findOneById(hairSalon.id); 
  }

  public async deleteHairSalon(id: number) {
    return this.getHairSalonRepository().deleteById(id);
  }
}
