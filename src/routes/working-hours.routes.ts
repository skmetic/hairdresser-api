import { Container, Inject } from 'typescript-ioc';
import { Route } from '../models/route.model';
import { Routes } from './routes';
import { IRoute, NextFunction } from 'express';
import { IRouterContext } from 'koa-router';
import { WorkingHoursController } from '../controllers/working-hours.controller';

export class WorkingHoursRoutes extends Routes {
  constructor(@Inject private workingHoursController: WorkingHoursController) {
    super();
  }
  protected getRoutes(): Route[] {
    return [
      Route.newRoute('/workinghours', 'get', (ctx: IRouterContext) => this.workingHoursController.getAllWorkingHourss(ctx)),
      Route.newRoute('/workinghours', 'post', (ctx: IRouterContext) => this.workingHoursController.saveWorkingHours(ctx)),
      Route.newRoute('/workinghours/find-date', 'get', (ctx: IRouterContext) => this.workingHoursController.findWorkingHoursByDayAndHairSalon(ctx)),
      Route.newRoute('/workinghours/find', 'get', (ctx: IRouterContext) => this.workingHoursController.findWorkingHours(ctx)),
      Route.newRoute('/workinghours/:id', 'get', (ctx: IRouterContext) => this.workingHoursController.getWorkingHoursById(ctx)),
      Route.newRoute('/workinghours/:id', 'delete', (ctx: IRouterContext) => this.workingHoursController.deleteWorkingHours(ctx)),
    ];
  }
}
