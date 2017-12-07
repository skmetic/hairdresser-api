import { Container, Inject } from 'typescript-ioc';
import { Route } from '../models/route.model';
import { Routes } from './routes';
import { IRoute, NextFunction } from 'express';
import { IRouterContext } from 'koa-router';
import { HairSalonController } from '../controllers/hair-salon.controller';

export class HairSalonRoutes extends Routes {
  constructor(@Inject private hairSalonController: HairSalonController) {
    super();
  }
  protected getRoutes(): Route[] {
    return [
      Route.newRoute('/hairsalon', 'get', (ctx: IRouterContext) => this.hairSalonController.getAllHairSalons(ctx)),
      Route.newRoute('/hairsalon', 'post', (ctx: IRouterContext) => this.hairSalonController.saveHairSalon(ctx)),
      Route.newRoute('/hairsalon/:id', 'get', (ctx: IRouterContext) => this.hairSalonController.getHairSalonById(ctx)),
      Route.newRoute('/hairsalon/:id', 'delete', (ctx: IRouterContext) => this.hairSalonController.deleteHairSalon(ctx)),
    ];
  }
}
