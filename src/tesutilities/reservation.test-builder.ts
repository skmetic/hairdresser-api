import { Reservation } from '../models/reservation.entity';
import { CustomerTestBuilder } from './customer.test-builder';
import { HairSalonTestBuilder } from './hair-salon.test-builder';
import { HairSalon } from '../models/hair-salon.entity';
import { Customer } from '../models/customer.entity';

export class ReservationTestBuilder {
  private reservation: Reservation = new Reservation();

  public static newReservation() {
    return new ReservationTestBuilder();
  }

  public withId(id: number): ReservationTestBuilder {
    this.reservation.id = id;
    return this;
  }

  public withDate(date: Date): ReservationTestBuilder {
    this.reservation.date = date;
    return this;
  }

  public withStartTime(startTime: string): ReservationTestBuilder {
    this.reservation.startTime = startTime;
    return this;
  }

  public withEndTime(endTime: string): ReservationTestBuilder {
    this.reservation.endTime = endTime;
    return this;
  }

  public withService(service: string): ReservationTestBuilder {
    this.reservation.service = service;
    return this;
  }

  public withHairSalon(hairSalon: HairSalon): ReservationTestBuilder {
    this.reservation.hairSalon = hairSalon;
    return this;
  }
  public withCustomer(customer: Customer): ReservationTestBuilder {
    this.reservation.customer = customer;
    return this;
  }

  public withDefaultValues(): ReservationTestBuilder {
    return this.withDate(new Date('2017-12-10'))
      .withStartTime('08:30')
      .withEndTime('9:00')
      .withService('Haircut & style')
      .withHairSalon(this.buildDefaultHairSalon())
      .withCustomer(this.buildDefaultCustomer());
  }

  public build(): Reservation {
    return this.reservation;
  }

  public static generateListOfDefaultReservations(length: number) {
    const result = [];
    let i = 0;
    while (i++ < length) {
      result.push(
        ReservationTestBuilder.newReservation()
          .withDefaultValues()
          .withId(Math.floor(Math.random() * 100))
          .build()
      );
    }
    return result;
  }
  public buildDefaultHairSalon(): HairSalon {
    const id = 4;
    return HairSalonTestBuilder.newHairSalon()
      .withDefaultValues()
      .withId(id)
      .build();
  }
  public buildDefaultCustomer(): Customer {
    const id = 2;
    return CustomerTestBuilder.newCustomer()
      .withDefaultValues()
      .withId(id)
      .build();
  }
}
