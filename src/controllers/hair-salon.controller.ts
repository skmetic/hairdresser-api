import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { HairSalonService } from '../services/hair-salon.service';
import { HairSalon } from '../models/hair-salon.entity';
import { Validator, validate } from 'class-validator';
import { ErrorMessages } from '../exceptions/error-messages';


export class HairSalonController {
  validator: Validator;
  constructor( @Inject private hairSalonService: HairSalonService) {
    this.validator = new Validator();
  }

  public async getAllHairSalons(ctx: IRouterContext) {
    ctx.body = await this.hairSalonService.getAllHairSalons();
  }

  public async getHairSalonById(ctx: IRouterContext) {
    try {
      ctx.body = await this.hairSalonService.findHairSalonById(ctx.params.id);
    } catch (e) {
      ctx.throw(404, e.message);
    }
  }

  public async saveHairSalon(ctx: IRouterContext) {
    try {
      const reqBody = ctx.request.body;
      if (reqBody.name && reqBody.address && reqBody.phone && reqBody.email) {
        const hairSalon = HairSalon.newHairSalon(reqBody);
        const errors = await validate(hairSalon)
        if (errors.length > 0) {
          throw new Error(ErrorMessages.INVALID_PARAMS);
        }
        ctx.body = await this.hairSalonService.saveHairSalon(reqBody);
      } else {
        throw new Error(ErrorMessages.MISSING_PARAMS);
      }
    }catch (e) {
      ctx.throw(400, e.message);
    }  
  }

  public async deleteHairSalon(ctx: IRouterContext) {
    try {
      let hairSalonId: number|string = ctx.params.id;
      if (!this.validator.isNumber(hairSalonId)) {
        if (!this.validator.isNumberString(ctx.params.id)) {
          throw new Error(ErrorMessages.PARAMETER_SHOULD_BE_NUMBER);
        }
        hairSalonId = parseInt(ctx.params.id);
      }
      await this.hairSalonService.deleteHairSalon(<number>hairSalonId);
      ctx.status = 200;
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }
}
