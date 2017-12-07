import { Container, Inject } from 'typescript-ioc';
import { CustomerController } from '../controllers/customer.controller';
import { Route } from '../models/route.model';
import { Routes } from './routes';
import { IRoute, NextFunction } from 'express';
import { IRouterContext } from 'koa-router';

export class CustomerRoutes extends Routes {
  constructor(@Inject private customerController: CustomerController) {
    super();
  }
  protected getRoutes(): Route[] {
    return [
      Route.newRoute('/customers', 'get', (ctx: IRouterContext) => this.customerController.getAllCustomers(ctx)),
      Route.newRoute('/customers', 'post', (ctx: IRouterContext) => this.customerController.saveCustomer(ctx)),
      Route.newRoute('/customers/:id', 'get', (ctx: IRouterContext) => this.customerController.getCustomerById(ctx)),
      Route.newRoute('/customers/:id', 'delete', (ctx: IRouterContext) => this.customerController.deleteCustomer(ctx)),
    ];
  }
}

