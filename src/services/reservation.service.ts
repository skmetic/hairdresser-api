import { getManager, Repository } from 'typeorm';
import { Inject, Singleton } from 'typescript-ioc';
import { Reservation } from '../models/reservation.entity';
import { ErrorMessages } from '../exceptions/error-messages';
import { HairSalonService } from './hair-salon.service';
import { CustomerService } from './customer.service';

@Singleton
export class ReservationService {
  constructor(
    @Inject private hairSalonService: HairSalonService,
    @Inject private customerService: CustomerService
  ) {}

  private getReservationRepository(): Repository<Reservation> {
    return getManager().getRepository(Reservation);
  }

  public async findReservatins(query: {
    startDate: string;
    endDate: string;
    customerId?: number;
    hairSalonId?: number;
  }) {
    let queryBuilder = this.getReservationRepository()
      .createQueryBuilder('reservation')
      .where('reservation.date BETWEEN :startDate ADN :endDate', {
        startDate: query.startDate,
        endDate: query.endDate
      });
    if (query.hasOwnProperty('customerId')) {
      queryBuilder = queryBuilder.andWhere('reservation.hairSalonId = :id', {
        id: query.hairSalonId
      });
    }
    if (query.hasOwnProperty('customerId')) {
      queryBuilder = queryBuilder.andWhere('reservation.customerId = :id', {
        id: query.customerId
      });
    }

    const result = await queryBuilder.getMany();
    return result;
  }

  public async findReservationForTimeFrameAndHairSalon(
    date: string,
    startTime: string,
    endTime: string,
    hairSalonId: number
  ) {
    date = `${date} 00: 00: 00.00`;
    return await this.getReservationRepository()
      .createQueryBuilder('res')
      .where('res.date = :date', { date })
      .andWhere('res.hairSalonId = :id', { id: hairSalonId })
      .andWhere(
        '(res.startTime <= :st AND res.endTime >:st) OR (res.startTime <= :st AND res.endTime >= :et ) OR (res.startTime >= :st AND res.endTime <= :et ) OR (res.startTime < :et AND res.endTime >= :et )',
        { st:startTime, et: endTime }
      )
      .getMany();
  }

  public async saveReservation(reservation: Reservation): Promise<Reservation> {
    try {
      return this.getReservationRepository().save(reservation);
    } catch (e) {
      console.log("error saving", e.message)
      return Promise.reject(e);
    }  
  }

  public async updateReservation(reservation: Reservation): Promise<Reservation | undefined> {
    await this.getReservationRepository().updateById(reservation.id, reservation);
    return this.getReservationRepository().findOneById(reservation.id);
  }

  public async deleteReservation(id: number) {
    return  this.getReservationRepository().deleteById(id);
  }
}
