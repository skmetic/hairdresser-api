import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsString, IsDate, IsMilitaryTime } from 'class-validator';
import { HairSalon } from './hair-salon.entity';
import { Customer } from './customer.entity';

@Entity()
export class Reservation {
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

  @Column()
  @IsString()
  treatment: string;

  @ManyToOne(type => HairSalon, hairSalon => hairSalon.reservations)
  hairSalon: HairSalon;
  
  @ManyToOne(type => Customer, customer => customer.reservations)
  customer: Customer;


  public static async newReservation(obj: {
    id?: number;
    date: Date;
    startTime: string;
    endTime: string;
    hairSalon: Object;
    customer: Object;
  }) {
    const newReservation = new Reservation();
    if (obj.id) newReservation.id = obj.id;
     newReservation.date = obj.date;
     newReservation.startTime = obj.startTime;
    newReservation.endTime = obj.endTime;
    if (obj.hairSalon) newReservation.hairSalon = HairSalon.newHairSalon(<HairSalon>obj.hairSalon);
    if (obj.customer) newReservation.customer = Customer.newCustomer(<Customer>obj.customer);
    return newReservation;
  }
}
