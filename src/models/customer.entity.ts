import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsString, MinLength, IsMobilePhone } from 'class-validator';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn() id?: number;

  @Column()
  @IsString()
  firstName: string;

  @Column()
  @IsString()
  lastName: string;
  @Column()
  @IsString()
  phone: string;

  @Column()
  @IsEmail()
  email: string;

  public static newCustomer(obj: {
    id?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) {
    const newCustomer = new Customer();
    if (obj.id) newCustomer.id = obj.id;
    if (obj.firstName) newCustomer.firstName = obj.firstName;
    if (obj.lastName) newCustomer.lastName = obj.lastName;
    if (obj.phone) newCustomer.phone = obj.phone;
    if (obj.email) newCustomer.email = obj.email;
    return newCustomer;
  }
}
