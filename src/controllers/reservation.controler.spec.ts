import { expect } from 'chai';
import { Context } from 'koa';
import { IMiddleware, IRouterContext } from 'koa-router';
import { Inject, Singleton } from 'typescript-ioc';
import { Validator, validate } from 'class-validator';
import 'mocha';
import * as sinon from 'sinon';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

import * as moment from 'moment';

import { ErrorMessages } from '../exceptions/error-messages';

import { Reservation } from '../models/reservation.entity';
import { ReservationController } from './reservation.controller';
import { ReservationService } from '../services/reservation.service';
import { ReservationTestBuilder } from '../tesutilities/reservation.test-builder';
import { HairSalon } from '../models/hair-salon.entity';
import { HairSalonService } from '../services/hair-salon.service';
import { HairSalonTestBuilder } from '../tesutilities/hair-salon.test-builder';
import { Customer } from '../models/customer.entity';
import { CustomerService } from '../services/customer.service';
import { CustomerTestBuilder } from '../tesutilities/customer.test-builder';
import { WorkingHoursService } from '../services/working-hours.service';
import { WorkingHoursTestBuilder } from '../tesutilities/working-hours.test-builder';
import { WorkingHours } from '../models/working-hours.entity';

describe('ReservationsController', () => {
  let controllerUnderTest: ReservationController;
  let reservationService: ReservationService;
  let hairSalonService: HairSalonService;
  let customerService: CustomerService;
  let workingHoursService: WorkingHoursService;
  const testId = 123;
  const reservationQuery = {
    startDate: '2017-12-01',
    endDate: '2017-12-10',
    hairSalonId: '1',
    customerId: '1'
  };
  const saveRequestBody = {
    date: '2017-12-10',
    startTime: '10:00',
    endTime: '11:00',
    service: 'Haircut',
    hairSalonId: 1,
    customerId: 1
  };
  const reservationWithId: Reservation = ReservationTestBuilder.newReservation()
    .withDefaultValues()
    .withId(testId)
    .build();
  const reservationWithoutId: Reservation = ReservationTestBuilder.newReservation()
    .withDefaultValues()
    .build();
  const hairSalonWithId: HairSalon = HairSalonTestBuilder.newHairSalon()
    .withDefaultValues()
    .withId(testId)
    .build();
  const customerWithId: Customer = CustomerTestBuilder.newCustomer()
    .withDefaultValues()
    .withId(testId)
    .build();
  const reservationsList: Reservation[] = ReservationTestBuilder.generateListOfDefaultReservations(
    3
  );
  const workingHoursWithId: WorkingHours = WorkingHoursTestBuilder.newWorkingHours()
    .withDefaultValues()
    .withId(3)
    .build();

  beforeEach(() => {
    reservationService = mock(ReservationService);
    hairSalonService = mock(HairSalonService);
    customerService = mock(CustomerService);
    workingHoursService = mock(WorkingHoursService);
    controllerUnderTest = new ReservationController(
      instance(reservationService),
      instance(hairSalonService),
      instance(customerService),
      instance(workingHoursService)
    );
  });

  // ---------------------------------------------------------------------------------
  //   find reservations
  // ---------------------------------------------------------------------------------

  describe('findReservations', async () => {
    it('delegates query to reservationService and puts the found reservations on the body', async () => {
      const ctx = { query: { ...reservationQuery }, throw: () => undefined } as Context;
      when(reservationService.findReservatins(anything())).thenReturn(
        Promise.resolve(reservationsList)
      );
      await controllerUnderTest.findReservations(ctx);

      verify(reservationService.findReservatins(anything())).called();
      expect(ctx.body).to.equal(reservationsList);
    });

    it('delegates query to reservationService and puts the found reservations on the body - called without customerId', async () => {
      const query = {
        startDate: reservationQuery.startDate,
        endDate: reservationQuery.endDate,
        hairSalonId: <string>reservationQuery.hairSalonId
      };
      const ctx = { query, throw: () => undefined } as Context;
      when(reservationService.findReservatins(anything())).thenReturn(
        Promise.resolve(reservationsList)
      );
      await controllerUnderTest.findReservations(ctx);

      verify(reservationService.findReservatins(anything())).called();
      expect(ctx.body).to.equal(reservationsList);
    });

    it('delegates query to reservationService and puts the found reservations on the body - called without hairSalonId', async () => {
      const query = {
        startDate: reservationQuery.startDate,
        endDate: reservationQuery.endDate,
        customerId: <string>reservationQuery.customerId
      };
      const ctx = { query, throw: () => undefined } as Context;
      when(reservationService.findReservatins(anything())).thenReturn(
        Promise.resolve(reservationsList)
      );
      await controllerUnderTest.findReservations(ctx);

      verify(reservationService.findReservatins(anything())).called();
      expect(ctx.body).to.equal(reservationsList);
    });

    it('responds with 400 Missing parameters', async () => {
      const query = {
        endDate: reservationQuery.endDate,
        customerId: <string>reservationQuery.customerId
      };
      const ctx = { query, throw: () => undefined } as Context;
      const errorMessage = ErrorMessages.MISSING_QUERY_PARAMS;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.findReservations(ctx);
      ctxMock.verify();
    });

    it('responds with 400 wrong type param', async () => {
      const query = {
        startDate: 'invalid date format',
        endDate: reservationQuery.endDate,
        hairSalonId: reservationQuery.hairSalonId,
        customerId: reservationQuery.customerId
      };
      const ctx = { query, throw: () => undefined } as Context;
      const errorMessage = ErrorMessages.INVALID_PARAMS;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.findReservations(ctx);
      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //   save reservations
  // ---------------------------------------------------------------------------------

  describe('saveReservation', async () => {
    it('delegates query to reservationService and responds reservationWithId', async () => {
      const ctx = { request: { body: { ...saveRequestBody } }, throw: () => undefined } as Context;
      when(reservationService.saveReservation(anything())).thenReturn(
        Promise.resolve(reservationWithId)
      );
      when(
        reservationService.findReservationForTimeFrameAndHairSalon(
          anything(),
          anything(),
          anything(),
          anything()
        )
      ).thenReturn(Promise.resolve([]));
      when(hairSalonService.findHairSalonById(anything())).thenReturn(
        Promise.resolve(hairSalonWithId)
      );
      when(
        workingHoursService.findWorkingHoursByDayAndHairSalon(anything(), anything())
      ).thenReturn(Promise.resolve([workingHoursWithId]));
      when(customerService.findCustomerById(anything())).thenReturn(
        Promise.resolve(customerWithId)
      );
      await controllerUnderTest.saveReservation(ctx);

      verify(reservationService.saveReservation(anything())).called();
      expect(Object.keys(ctx.body).length).to.equal(7);
      expect(ctx.body).to.equal(reservationWithId);
    });

    it('respond with 400 missing parameter, called with missing customerId', async () => {
      const requestBody = {
        date: saveRequestBody.date,
        startTime: saveRequestBody.startTime,
        endTime: saveRequestBody.endTime,
        service: saveRequestBody.service,
        hairSalonId: saveRequestBody.hairSalonId
      };
      const ctx = { request: { body: { ...requestBody } }, throw: () => undefined } as Context;
    
      const errorMessage = ErrorMessages.MISSING_PARAMS;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });
    it('respond with 400 missing parameter, called with missing customerId', async () => {
      const requestBody = {
        date: saveRequestBody.date,
        startTime: saveRequestBody.startTime,
        endTime:'invalid start time',
        service: saveRequestBody.service,
        hairSalonId: saveRequestBody.hairSalonId,
        customerId: saveRequestBody.customerId
      };
      const ctx = { request: { body: { ...requestBody } }, throw: () => undefined } as Context;
    
      const errorMessage = ErrorMessages.INVALID_PARAMS;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });


    it('respond with 400 missing parameter, called with endTime of wrong type', async () => {
      const requestBody = {
        date: saveRequestBody.date,
        startTime: saveRequestBody.startTime,
        endTime:'invalid start time',
        service: saveRequestBody.service,
        hairSalonId: saveRequestBody.hairSalonId,
        customerId: saveRequestBody.customerId
      };
      const ctx = { request: { body: { ...requestBody } }, throw: () => undefined } as Context;
    
      const errorMessage = ErrorMessages.INVALID_PARAMS;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });

    it('respond with 400 Start time can not be greater then end time, called with the startTime greater than endTime', async () => {
      const requestBody = {
        date: saveRequestBody.date,
        startTime: saveRequestBody.endTime,
        endTime: saveRequestBody.startTime,
        service: saveRequestBody.service,
        hairSalonId: saveRequestBody.hairSalonId,
        customerId: saveRequestBody.customerId
      };
      const ctx = { request: { body: { ...requestBody } }, throw: () => undefined } as Context;
    
      const errorMessage = 'Start time can not be greater then end time.';
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });

    it('respond with 400 hair salon with id does note exist, called hairSalon id that does not exist', async () => {
   
      const ctx = { request: { body: { ...saveRequestBody } }, throw: () => undefined } as Context;
      when(hairSalonService.findHairSalonById(anything())).thenThrow(
        new Error ('No hair salon was found for ID '+saveRequestBody.hairSalonId)
      );
      const errorMessage = 'No hair salon was found for ID '+saveRequestBody.hairSalonId;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });

    it('respond with 400 Working hours do not exist for this hair salon. on the date,', async () => {
   
      const ctx = { request: { body: { ...saveRequestBody } }, throw: () => undefined } as Context;
      when(reservationService.saveReservation(anything())).thenReturn(
        Promise.resolve(reservationWithId)
      );
      when(
        reservationService.findReservationForTimeFrameAndHairSalon(
          anything(),
          anything(),
          anything(),
          anything()
        )
      ).thenReturn(Promise.resolve([]));
      when(hairSalonService.findHairSalonById(anything())).thenReturn(
        Promise.resolve(hairSalonWithId)
      );
      when(
        workingHoursService.findWorkingHoursByDayAndHairSalon(anything(), anything())
      ).thenReturn(Promise.resolve([]));

   
      const errorMessage = 'Working hours do not exist for this hair salon.';
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controllerUnderTest.saveReservation(ctx);
      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //   delete reservations
  // ---------------------------------------------------------------------------------

  describe('deleteReservation', async () => {
    it('delegates query to reservationService and responds with 200', async () => {
      const ctx = { params: { id: testId } } as Context;
      when(reservationService.deleteReservation(testId)).thenReturn(Promise.resolve());
      await controllerUnderTest.deleteReservation(ctx);
      verify(reservationService.deleteReservation(testId)).called();
      expect(ctx.status).to.equal(200);
    });

    it('respond with 400, parameter should be a number', async () => {
      const wrongId = 'wrongId';
      const errorMessage = 'Parameter should be a number.';
      const ctx = { params: { id: wrongId }, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);

      await controllerUnderTest.deleteReservation(ctx);

      ctxMock.verify();
    });
  });
});
