import { expect } from 'chai';
import { Context } from 'koa';
import { IRouterContext } from 'koa-router';
import 'mocha';
import * as sinon from 'sinon';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { CustomerController } from './customer.controller';
import { Customer } from '../models/customer.entity';
import { CustomerService } from '../services/customer.service';
import { CustomerTestBuilder } from '../tesutilities/customerTestBuilder';

describe('CustomerControler', () => {
  let controlerUnderTest: CustomerController;
  let customerService: CustomerService;

  const testId = 1928;
  const customerWithId: Customer = CustomerTestBuilder.newCustomer()
    .withDefaultValues()
    .withId(testId)
    .build();
  const customerWithoutId: Customer = CustomerTestBuilder.newCustomer()
    .withDefaultValues()
    .build();

  beforeEach(() => {
    customerService = mock(CustomerService);
    controlerUnderTest = new CustomerController(instance(customerService));
  });

  // ---------------------------------------------------------------------------------
  //    Get  all customer
  // ---------------------------------------------------------------------------------

  describe('getAllCustomers', () => {
    it('puts the customers on the body', async () => {
      const customers = CustomerTestBuilder.generateListOfDefaultCustomers(6);
      when(customerService.getAllCustomers()).thenReturn(Promise.resolve(customers));
      const ctx: Context = {} as Context;
      await controlerUnderTest.getAllCustomers(ctx);
      expect(ctx.body).to.equal(customers);
    });
  });

  // ---------------------------------------------------------------------------------
  //    Get customer by
  // ---------------------------------------------------------------------------------

  describe('getCustomerById', () => {
    it('return with 404 if no customer is found', async () => {
      const errorMessage = 'No customer found with ID.';
      const ctx: Context = {
        params: { id: testId },
        throw: () => null
      } as Context;
      when(customerService.findCustomerById(testId)).thenThrow(new Error(errorMessage));
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(404, errorMessage);

      await controlerUnderTest.getCustomerById(ctx);

      ctxMock.verify();
    });

    it('puts the found customer on the body', async () => {
      const ctx: Context = {} as Context;
      ctx.params = { id: testId };
      when(customerService.findCustomerById(testId)).thenReturn(Promise.resolve(customerWithId));

      await controlerUnderTest.getCustomerById(ctx);
      verify(customerService.findCustomerById(testId)).called();
      expect(ctx.body).to.equal(customerWithId);
    });
  });

  // ---------------------------------------------------------------------------------
  //    Save customer
  // ---------------------------------------------------------------------------------

  describe('saveCustomer', () => {
    it('delegates to customerService and responds with 200', async () => {
      const requestBody = {
        firstName: customerWithoutId.firstName,
        lastName: customerWithoutId.lastName,
        phone: customerWithoutId.phone,
        email: customerWithoutId.email
      };
      const ctx: Context = { throw: () => null, request: { body: requestBody } } as Context;
      when(customerService.saveCustomer(anything())).thenReturn(Promise.resolve(customerWithId));
      await controlerUnderTest.saveCustomer(ctx);

      const [firstArg] = capture(customerService.saveCustomer).last();
      expect(firstArg.id).equals(undefined);
      expect(firstArg.firstName).equals(requestBody.firstName);
      expect(firstArg.lastName).equals(requestBody.lastName);
      expect(firstArg.phone).equals(requestBody.phone);
      expect(firstArg.email).equals(requestBody.email);

      expect(ctx.body).to.equal(customerWithId);
    });

    it('does not delegate to customerService', async () => {
      const requestBody = {
        firstName: customerWithoutId.firstName,
        lastName: customerWithoutId.lastName,
        email: customerWithoutId.email
      };
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      await controlerUnderTest.saveCustomer(ctx);
      verify(customerService.saveCustomer(anything())).never();
    });

    it('responds with 400 Missing parameters', async () => {
      const requestBody = {
        firstName: customerWithoutId.firstName,
        lastName: customerWithoutId.lastName,
        email: customerWithoutId.email
      };
      const errorMessage = 'Missing required parameters.';
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveCustomer(ctx);
      ctxMock.verify();
    });

    it('responds with 400 Parameter of invalide type.', async () => {
      const requestBody = {
        firstName: customerWithoutId.firstName,
        lastName: customerWithoutId.lastName,
        phone: customerWithoutId.phone,
        email: 'customerWithoutId.email'
      };
      const errorMessage = 'Parameter of invalide type.';
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveCustomer(ctx);
      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //    Delete customer
  // ---------------------------------------------------------------------------------

  describe('deleteCustomer', () => {
    it('delegates id to customerService and responds with 200', async () => {
      const ctx: Context = { params: { id: testId } } as Context;
      when(customerService.deleteCustomer(testId)).thenReturn(Promise.resolve());

      await controlerUnderTest.deleteCustomer(ctx);

      verify(customerService.deleteCustomer(testId)).called();
      expect(ctx.status).to.equal(200);
    });

    it('respond with 400 wrong type param', async () => {
      const wrongId = 'wrongId';
      const errorMessage = 'Parameter should be a number.';
      const ctx: Context = { params: { id: wrongId }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);

      await controlerUnderTest.deleteCustomer(ctx);

      ctxMock.verify();
    });
  });
});
