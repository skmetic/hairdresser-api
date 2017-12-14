import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import { Inject } from 'typescript-ioc';
import { createConnection } from 'typeorm';
import * as path from 'path';
import { CustomerRoutes } from './routes/customer.routes';
import { HairSalonRoutes } from './routes/hair-salon.routes';
import { WorkingHoursRoutes } from './routes/working-hours.routes';
import { ReservationRoutes } from './routes/reservation.routes';

export class HairResApi {
  constructor(
    @Inject private customerRoutes: CustomerRoutes,
    @Inject private hairSalonRoutes: HairSalonRoutes,
    @Inject private workingHoursRoutes: WorkingHoursRoutes,
    @Inject private reservationRoutes: ReservationRoutes
  ) { }

  private async createApp() {
    const connection = await createConnection();
    const app: Koa = new Koa();
    const router: Router = new Router();

   
    this.customerRoutes.register(router);
    this.hairSalonRoutes.register(router);
    this.workingHoursRoutes.register(router);
    this.reservationRoutes.register(router);

    app.use(logger());
    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    return Promise.resolve(app);
  }

  public async start() {
    const app = await this.createApp();
    console.log("Server started listening on port 3000...");
    const server = app.listen(3000);
    return Promise.resolve(server);
  }
}
