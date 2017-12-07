import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.entity';
import { Validator, validate } from 'class-validator';
import { ErrorMessages } from '../exceptions/error-messages';
export class CustomerController {
  validator: Validator;
  constructor(@Inject private customerService: CustomerService) {
    this.validator = new Validator();
  }

  public async getAllCustomers(ctx: IRouterContext) {
    ctx.body = await this.customerService.getAllCustomers();
  }

  public async getCustomerById(ctx: IRouterContext) {
    try {
      ctx.body = await this.customerService.findCustomerById(ctx.params.id);
    } catch (e) {
      ctx.throw(404, e.message);
    }
  }

  public async saveCustomer(ctx: IRouterContext) {
    try {
      const reqBody = ctx.request.body;
      if (reqBody.firstName && reqBody.lastName && reqBody.phone && reqBody.email) {
        const customer: Customer = Customer.newCustomer(ctx.request.body);
        const errors = await validate(customer)
        if (errors.length > 0) {
          throw new Error (ErrorMessages.INVALID_PARAMS)
        }
        const result = await this.customerService.saveCustomer(customer);
        ctx.body = result;
      } else {
        throw new Error(ErrorMessages.MISSING_PARAMS);
      }
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }

  public async deleteCustomer(ctx: IRouterContext) {
    try {
      let customerId: number|string = ctx.params.id;
      if (!this.validator.isNumber(customerId)) {
        if (!this.validator.isNumberString(ctx.params.id)) {
          throw new Error(ErrorMessages.PARAMETER_SHOULD_BE_NUMBER);
        }
        customerId = parseInt(ctx.params.id);
      }
      await this.customerService.deleteCustomer(<number>customerId);
      ctx.status = 200;
    } catch (e) {
      ctx.throw(400, e.message);
    }
  }
}
