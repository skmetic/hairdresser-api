import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { HairSalonService } from '../services/hair-salon.service';
import { HairSalon } from '../models/hair-salon.entity';
import { Validator, validate } from 'class-validator';


export class HairSalonController {
  validator: Validator;
  constructor( @Inject private hairSalonsService: HairSalonService) {
    this.validator = new Validator();
  }

  public async getAllHairSalons(ctx: IRouterContext) {
    ctx.body = await this.hairSalonsService.getAllHairSalons();
  }

  public async getHairSalonById(ctx: IRouterContext) {
    try {
      ctx.body = await this.hairSalonsService.findHairSalonById(ctx.params.id);
    } catch (e) {
      ctx.throw(404, e.message);
    }
  }
}
