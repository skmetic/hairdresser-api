import { getManager, Repository } from 'typeorm';
import { Inject, Singleton } from 'typescript-ioc';
import { WorkingHours } from '../models/working-hours.entity';
import { ErrorMessages } from '../exceptions/error-messages';
import { HairSalonService } from './hair-salon.service';

@Singleton
export class WorkingHoursService {
  constructor( @Inject private hairSalonService: HairSalonService) { }

  private getWorkingHoursRepository(): Repository<WorkingHours> {
    return getManager().getRepository(WorkingHours);
  }

  public async getAllWorkingHourss(): Promise<WorkingHours[]> {
    return this.getWorkingHoursRepository().find();
  }

  public async findWorkingHoursById(id: number): Promise<WorkingHours> {
    const result = await this.getWorkingHoursRepository().findOneById(id);
    if (!result) {
      throw new Error(ErrorMessages.WORKING_HOURS_NOT_FOUND + id);
    }
    return result;
  }
  
  public async findWorkingHours(startDate: string, endDate: string, hairSalonId: number) {
    // const hairSalon = await this.hairSalonService.findHairSalonById(hairSalonId);
    const result = await this.getWorkingHoursRepository()
    .createQueryBuilder('workingHours')
    .where('workingHours.date BETWEEN :sd AND :ed' , { sd:startDate, ed:endDate })
    .andWhere('workingHours.hairSalonId = :id', { id: hairSalonId })
    .getMany();
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    console.log("result", result);
    return result;   
  }  
  public async saveWorkingHours(workingHours: WorkingHours): Promise<WorkingHours> {
    return this.getWorkingHoursRepository().save(workingHours);
  }

  public async updateWorkingHours(workingHours: WorkingHours): Promise<WorkingHours | undefined> {
    await this.getWorkingHoursRepository().updateById(workingHours.id, workingHours);
    return this.getWorkingHoursRepository().findOneById(workingHours.id); 
  }

  public async deleteWorkingHours(id: number) {
    return this.getWorkingHoursRepository().deleteById(id);
  }
}
