import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { WorkingHoursService } from '../services/working-hours.service';
import { WorkingHours } from '../models/working-hours.entity';
import { Validator, validate } from 'class-validator';
import { ErrorMessages } from '../exceptions/error-messages';
import { HairSalon } from '../models/hair-salon.entity';
import { HairSalonService } from '../services/hair-salon.service';

export class WorkingHoursController {
  validator: Validator;
  constructor(
    @Inject private workingHoursService: WorkingHoursService,
    @Inject private hairSalonService: HairSalonService
  ) {
    this.validator = new Validator();
  }

  public async getAllWorkingHourss(ctx: IRouterContext) {
    ctx.body = await this.workingHoursService.getAllWorkingHourss();
  }

  public async getWorkingHoursById(ctx: IRouterContext) {
    try {
      ctx.body = await this.workingHoursService.findWorkingHoursById(ctx.params.id);
    } catch (e) {
      ctx.throw(404, e.message);
    }
  }

  public async findWorkingHours(ctx: IRouterContext) {
    try {
      const query = ctx.query;
      if (query.startDate && query.endDate && query.hairSalonId) {
        if (
          !this.validator.isDateString(query.startDate) &&
          !this.validator.isDateString(query.endDate) &&
          !this.validator.isNumberString(query.hairSalonId)
        ) {
          throw new Error(ErrorMessages.INVALID_PARAMS);
        }
        const result = await this.workingHoursService.findWorkingHours(
          query.startDate,
          query.endDate,
          parseInt(query.hairSalonId)
        );
        ctx.body = result;
      } else {
        throw new Error(ErrorMessages.MISSING_QUERY_PARAMS);
      }
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }

  public async saveWorkingHours(ctx: IRouterContext) {
    try {
      const reqBody = ctx.request.body;
      if (reqBody.date && reqBody.startTime && reqBody.endTime && reqBody.hairSalonId) {
        if (
          !this.validator.isNumber(reqBody.hairSalonId) &&
          !this.validator.isDateString(reqBody.date) &&
          !this.validator.isMilitaryTime(reqBody.startTime) &&
          !this.validator.isMilitaryTime(reqBody.endTime)
        ) {
          throw new Error(ErrorMessages.INVALID_PARAMS);
        }
        reqBody.hairSalon = this.hairSalonService.findHairSalonById(reqBody.hairSalonId);
        const workingHours = WorkingHours.newWorkingHours(reqBody);
        const errors = await validate(workingHours);
        if (errors.length > 0) {
          throw new Error(ErrorMessages.INVALID_PARAMS);
        }

        ctx.body = await this.workingHoursService.saveWorkingHours(reqBody);
      } else {
        throw new Error(ErrorMessages.MISSING_PARAMS);
      }
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }

  public async deleteWorkingHours(ctx: IRouterContext) {
    try {
      let hairSalonId: number | string = ctx.params.id;
      if (!this.validator.isNumber(hairSalonId)) {
        if (!this.validator.isNumberString(ctx.params.id)) {
          throw new Error(ErrorMessages.PARAMETER_SHOULD_BE_NUMBER);
        }
        hairSalonId = parseInt(ctx.params.id);
      }
      await this.workingHoursService.deleteWorkingHours(<number>hairSalonId);
      ctx.status = 200;
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }
}
