import { WorkingHours } from "../models/working-hours.entity";
import { HairSalonTestBuilder } from './hair-salon.test-builder';
import { HairSalon } from '../models/hair-salon.entity';

export class WorkingHoursTestBuilder{

  private workingHours: WorkingHours = new WorkingHours();

  public static newWorkingHours() {
    return new WorkingHoursTestBuilder();
  }

  public withId(id: number): WorkingHoursTestBuilder {
    this.workingHours.id = id;
    return this;
  }
  public withDate(date: Date): WorkingHoursTestBuilder {
    this.workingHours.date = date;
    return this;
  }
  public withStartTime(startTime: string): WorkingHoursTestBuilder {
    this.workingHours.startTime = startTime;
    return this;
  }
  public withEndTime(phone: string): WorkingHoursTestBuilder {
    this.workingHours.phone = phone;
    return this;
  }
  public withHairSalon(hairSalon: HairSalon): WorkingHoursTestBuilder {
    this.workingHours.hairSalon = hairSalon;
    return this;
  }

  public withDefaultValues(): WorkingHoursTestBuilder{
    return this
      .withDate(new Date('2017-12-01'))
      .withStartTime('09:00')
      .withEndTime('20:00')
      .withHairSalon(HairSalonTestBuilder
        .newHairSalon()
        .withDefaultValues()
        .build()
      )
  }

  public build(): WorkingHours{
    return this.workingHours;
  }

  public static generateListOfDefaultWorkingHourss(length: number) {
    const result = [];
    let i = 0;
    while (i++ < length) {
      result.push(WorkingHoursTestBuilder.newWorkingHours().withDefaultValues().withId(Math.random() * 100).build())
    }
    return result;
  }
}
