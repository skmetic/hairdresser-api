import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsString, IsDate, IsMilitaryTime } from 'class-validator';
import { HairSalon } from './hair-salon.entity';

@Entity()
export class WorkingHours {
  @PrimaryGeneratedColumn() id?: number;
  @Column()
  @IsDate()
  date: Date;
  @Column()
  @IsMilitaryTime()
  startTime: string;
  @Column()
  @IsMilitaryTime()
  endTime: string;
  @ManyToOne(type => HairSalon, hairSalon => hairSalon.workingHours)
  hairSalon: HairSalon;

  public static async newWorkingHours(obj: {
    id?: number;
    date: Date;
    startTime: string;
    endTime: string;
    hairSalon: Object;
  }) {
    const newWorkingHours = new WorkingHours();
    if (obj.id) newWorkingHours.id = obj.id;
     newWorkingHours.date = obj.date;
     newWorkingHours.startTime = obj.startTime;
    newWorkingHours.endTime = obj.endTime;
    if (obj.hairSalon) newWorkingHours.hairSalon = HairSalon.newHairSalon(<HairSalon>obj.hairSalon);
    return newWorkingHours;
  }
}
