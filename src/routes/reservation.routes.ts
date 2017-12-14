import { Container, Inject } from 'typescript-ioc';
import { Route } from '../models/route.model';
import { Routes } from './routes';
import { IRoute, NextFunction } from 'express';
import { IRouterContext } from 'koa-router';
import { ReservationController } from '../controllers/reservation.controller';

export class ReservationRoutes extends Routes {
  constructor(@Inject private reservationController: ReservationController) {
    super();
  }
  protected getRoutes(): Route[] {
    return [
      Route.newRoute('/reservation', 'post', (ctx: IRouterContext) => this.reservationController.saveReservation(ctx)),
      Route.newRoute('/reservation/find', 'get', (ctx: IRouterContext) => this.reservationController.findReservations(ctx)),
      Route.newRoute('/reservation/:id', 'delete', (ctx: IRouterContext) => this.reservationController.deleteReservation(ctx)),
    ];
  }
}
