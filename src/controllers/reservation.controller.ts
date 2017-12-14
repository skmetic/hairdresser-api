import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { ReservationService } from '../services/reservation.service';
import { Reservation } from '../models/reservation.entity';
import { Validator, validate } from 'class-validator';
import { ErrorMessages } from '../exceptions/error-messages';
import { HairSalon } from '../models/hair-salon.entity';
import { HairSalonService } from '../services/hair-salon.service';
import * as moment from 'moment';
import { CustomerService } from '../services/customer.service';
import { Shared } from '../shared/shared-const';
import { RelationQueryBuilder } from 'typeorm/query-builder/RelationQueryBuilder';
import { WorkingHoursService } from '../services/working-hours.service';

export class ReservationController {
  validator: Validator;

  constructor(
    @Inject private reservationService: ReservationService,
    @Inject private hairSalonService: HairSalonService,
    @Inject private customerService: CustomerService,
    @Inject private workingHoursService: WorkingHoursService
  ) {
    this.validator = new Validator();
  }

  public async findReservations(ctx: IRouterContext) {
    try {
      if (!ctx || !ctx.query || !ctx.query.startDate || !ctx.query.endDate) {
        throw new Error(ErrorMessages.MISSING_QUERY_PARAMS);
      }
      if (
        !this.validator.matches(ctx.query.startDate, Shared.DATE_REGEX) ||
        !this.validator.matches(ctx.query.endDate, Shared.DATE_REGEX)
      ) {
        throw new Error(ErrorMessages.INVALID_PARAMS);
      }
      ctx.query.customerId = this.validator.isNumberString(ctx.query.customerId)
        ? parseInt(ctx.query.customerId)
        : undefined;
      ctx.query.hairSalonId = this.validator.isNumberString(ctx.query.hairSalonId)
        ? parseInt(ctx.query.hairSalonId)
        : undefined;
      ctx.body = await this.reservationService.findReservatins(ctx.query);
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }

  public async saveReservation(ctx: IRouterContext) {
    try {
     
      if (!ctx.request || !ctx.request.body) {
        throw new Error(ErrorMessages.MISSING_JSON);
      }
      const reqBody = ctx.request.body;
      if (
        !reqBody.date ||
        !reqBody.startTime ||
        !reqBody.endTime ||
        !reqBody.hairSalonId ||
        !reqBody.customerId ||
        !reqBody.service
      ) {
        throw new Error(ErrorMessages.MISSING_PARAMS);
      }
      if (
        !this.validator.matches(reqBody.date, Shared.DATE_REGEX) ||
        !this.validator.isMilitaryTime(reqBody.startTime) ||
        !this.validator.isMilitaryTime(reqBody.endTime) ||
        !this.validator.isNumber(reqBody.hairSalonId) ||
        !this.validator.isNumber(reqBody.customerId) ||
        !this.validator.isString(reqBody.service)
      ) {
        throw new Error(ErrorMessages.INVALID_PARAMS);
      }
      if (reqBody.startTime > reqBody.endTime) {
        throw new Error('Start time can not be greater then end time.');
      }

      const hairSalon = await this.hairSalonService.findHairSalonById(reqBody.hairSalonId);
  
      const workingHoursArray = await this.workingHoursService.findWorkingHoursByDayAndHairSalon(
        reqBody.date,
        reqBody.hairSalonId
      );
      if (workingHoursArray.length === 0) {
        throw new Error('Working hours do not exist for this hair salon.');
      }
      const workingHours = workingHoursArray[0];
      if (reqBody.startTime < workingHours.startTime || reqBody.endTime > workingHours.endTime) {
        throw new Error('Reservation is outside working hours');
      }
      const customer = await this.customerService.findCustomerById(reqBody.customerId);
 
      const reservations = await this.reservationService.findReservationForTimeFrameAndHairSalon(
        reqBody.date,
        reqBody.startTime,
        reqBody.endTime,
        reqBody.hairSalonId
      );
      if (reservations.length > 0) {
        throw new Error('The reservation is overlaping other reservations.');
      }
      const reservation = await Reservation.newReservation({
        date: reqBody.date,
        startTime: reqBody.startTime,
        endTime: reqBody.endTime,
        hairSalon,
        customer,
        service: reqBody.service
      });
      ctx.body = await this.reservationService.saveReservation(reservation);
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }

  public async deleteReservation(ctx: IRouterContext) {
    try {
      let reservationId: number | string = ctx.params.id;
      if (!this.validator.isNumber(reservationId)) {
        if (!this.validator.isNumberString(ctx.params.id)) {
          throw new Error(ErrorMessages.PARAMETER_SHOULD_BE_NUMBER);
        }
        reservationId = parseInt(ctx.params.id);
      }
      await this.reservationService.deleteReservation(<number>reservationId);
      ctx.status = 200;
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }
}
