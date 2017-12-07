import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsString} from 'class-validator';
import { WorkingHours } from './working-hours.entity';
import { Reservation } from './reservation.entity';

@Entity()
export class HairSalon {
  @PrimaryGeneratedColumn() id?: number;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  address: string;

  @Column()
  @IsString()
  phone: string;

  @Column()
  @IsEmail()
  email: string;

  @OneToMany(type => WorkingHours, workingHours => workingHours.hairSalon)
  workingHours: WorkingHours[];
  
  @OneToMany(type => Reservation, reservation => reservation.hairSalon)
  reservations: Reservation[];

  public static newHairSalon(obj: {
    id?: number;
    name: string;
    address: string;
    phone: string;
    email: string;
  }) {
    const newHairSalon = new HairSalon();
    if (obj.id) newHairSalon.id = obj.id;
    if (obj.name) newHairSalon.name = obj.name;
    if (obj.address) newHairSalon.address = obj.address;
    if (obj.phone) newHairSalon.phone = obj.phone;
    if (obj.email) newHairSalon.email = obj.email;
    return newHairSalon;
  }
}
