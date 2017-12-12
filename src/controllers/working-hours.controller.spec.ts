import { expect } from 'chai';
import { Context } from 'koa';
import { IRouterContext } from 'koa-router';
import * as moment from 'moment';
import 'mocha';
import * as sinon from 'sinon';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { WorkingHoursController } from './working-hours.controller';
import { WorkingHours } from '../models/working-hours.entity';
import { WorkingHoursService } from '../services/working-hours.service';
import { HairSalonService } from '../services/hair-salon.service';
import { WorkingHoursTestBuilder } from '../tesutilities/working-hours.test-builder';
import { ErrorMessages } from '../exceptions/error-messages';
import { HairSalon } from '../models/hair-salon.entity';
import { HairSalonTestBuilder } from '../tesutilities/hair-salon.test-builder';

describe('WorkingHoursControler', () => {
  let controlerUnderTest: WorkingHoursController;
  let workingHoursService: WorkingHoursService;
  let hairSalonService: HairSalonService;
  const testId = 123;
  const workingHoursQuery = {
    hairSalonId: 1,
    startDate: '2017-12-01',
    endDate: '2017-12-10'
  };
  const workingHoursWithId: WorkingHours = WorkingHoursTestBuilder.newWorkingHours()
    .withDefaultValues()
    .withId(testId)
    .build();
  const workingHoursWithoutId: WorkingHours = WorkingHoursTestBuilder.newWorkingHours()
    .withDefaultValues()
    .build();
  const hairSalonWithId: HairSalon = HairSalonTestBuilder.newHairSalon()
    .withDefaultValues()
    .withId(testId)
    .build();
  const workingHoursList: WorkingHours[] = WorkingHoursTestBuilder.generateListOfDefaultWorkingHourss(
    3
  );

  beforeEach(() => {
    workingHoursService = mock(WorkingHoursService);
    hairSalonService = mock(HairSalonService);
    controlerUnderTest = new WorkingHoursController(
      instance(workingHoursService),
      instance(hairSalonService)
    );
  });

  // ---------------------------------------------------------------------------------
  //    Get  all working hours
  // ---------------------------------------------------------------------------------

  describe('getAllWorkingHourss', () => {
    it('puts the workingHourss on the body', async () => {
      const workingHourss = WorkingHoursTestBuilder.generateListOfDefaultWorkingHourss(6);
      when(workingHoursService.getAllWorkingHourss()).thenReturn(Promise.resolve(workingHourss));
      const ctx: Context = {} as Context;
      await controlerUnderTest.getAllWorkingHourss(ctx);
      expect(ctx.body).to.equal(workingHourss);
    });
  });

  // ---------------------------------------------------------------------------------
  //    Get working hours by
  // ---------------------------------------------------------------------------------

  describe('getWorkingHoursById', () => {
    it('return with 404 if no workingHours is found', async () => {
      const errorMessage = ErrorMessages.HAIR_SALON_NOT_FOUND;
      const ctx: Context = {
        params: { id: testId },
        throw: () => undefined
      } as Context;
      when(workingHoursService.findWorkingHoursById(testId)).thenThrow(new Error(errorMessage));
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(404, errorMessage);

      await controlerUnderTest.getWorkingHoursById(ctx);

      ctxMock.verify();
    });

    it('puts the found workingHours on the body', async () => {
      const ctx: Context = {} as Context;
      ctx.params = { id: testId };
      when(workingHoursService.findWorkingHoursById(testId)).thenReturn(
        Promise.resolve(workingHoursWithId)
      );

      await controlerUnderTest.getWorkingHoursById(ctx);
      verify(workingHoursService.findWorkingHoursById(testId)).called();
      expect(ctx.body).to.equal(workingHoursWithId);
    });
  });

  // ---------------------------------------------------------------------------------
  //    Save workingHours
  // ---------------------------------------------------------------------------------

  describe('saveWorkingHours', () => {
    it('delegates to workingHoursService and responds with 200', async () => {
      const requestBody = {
        date: moment(workingHoursWithoutId.date).format('YYYY-MM-DD'),
        startTime: workingHoursWithoutId.startTime,
        endTime: workingHoursWithoutId.endTime,
        hairSalonId: 1
      };
      const ctx: Context = { throw: () => undefined, request: { body: requestBody } } as Context;
      when(workingHoursService.saveWorkingHours(anything())).thenReturn(
        Promise.resolve(workingHoursWithId)
      );
      when(hairSalonService.findHairSalonById(anything())).thenReturn(
        Promise.resolve(hairSalonWithId)
      );
      await controlerUnderTest.saveWorkingHours(ctx);

      const [firstArg] = capture(workingHoursService.saveWorkingHours).last();
      expect(firstArg.id).equals(undefined);
      expect(firstArg.date).equals(requestBody.date);
      expect(firstArg.startTime).equals(requestBody.startTime);
      expect(firstArg.endTime).equals(requestBody.endTime);
      expect(firstArg.hairSalon.id).equals(hairSalonWithId.id);
      expect(firstArg.hairSalon.name).equals(hairSalonWithId.name);
      expect(firstArg.hairSalon.address).equals(hairSalonWithId.address);
      expect(firstArg.hairSalon.email).equals(hairSalonWithId.email);
      expect(ctx.body).to.equal(workingHoursWithId);
    });

    it('does not delegate to workingHoursService', async () => {
      const requestBody = {
        date: workingHoursWithoutId.date,
        startTime: workingHoursWithoutId.startTime,
        hairSalon: workingHoursWithoutId.hairSalon
      };
      const ctx: Context = { request: { body: requestBody }, throw: () => undefined } as Context;
      await controlerUnderTest.saveWorkingHours(ctx);
      verify(workingHoursService.saveWorkingHours(anything())).never();
    });

    it('responds with 400 Missing parameters', async () => {
      const requestBody = {
        date: workingHoursWithoutId.date,
        startTime: workingHoursWithoutId.startTime,
        hairSalon: workingHoursWithoutId.hairSalon
      };
      const errorMessage = ErrorMessages.MISSING_PARAMS;
      const ctx: Context = { request: { body: requestBody }, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveWorkingHours(ctx);
      ctxMock.verify();
    });

    it('responds with 400 Parameter of invalid type.', async () => {
      const requestBody = {
        date: workingHoursWithoutId.date,
        startTime: workingHoursWithoutId.startTime,
        endTime: 'invalid end time',
        hairSalonId: testId
      };
      const errorMessage = ErrorMessages.INVALID_PARAMS;
      const ctx: Context = { request: { body: requestBody }, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveWorkingHours(ctx);
      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //    Delete workingHours
  // ---------------------------------------------------------------------------------

  describe('deleteWorkingHours', () => {
    it('delegates id to workingHoursService and responds with 200', async () => {
      const ctx: Context = { params: { id: testId } } as Context;
      when(workingHoursService.deleteWorkingHours(testId)).thenReturn(Promise.resolve());

      await controlerUnderTest.deleteWorkingHours(ctx);

      verify(workingHoursService.deleteWorkingHours(testId)).called();
      expect(ctx.status).to.equal(200);
    });

    it('respond with 400, parameter should be a number', async () => {
      const wrongId = 'wrongId';
      const errorMessage = 'Parameter should be a number.';
      const ctx: Context = { params: { id: wrongId }, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);

      await controlerUnderTest.deleteWorkingHours(ctx);

      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //    Find working hours
  // ---------------------------------------------------------------------------------

  describe('findWorkingHours', () => {
    it('delegates query params to workingHoursService and responds with result', async () => {
      const ctx: Context = { query: workingHoursQuery, throw: () => undefined } as Context;
      when(workingHoursService.findWorkingHours(anything(), anything(), anything())).thenReturn(
        Promise.resolve(workingHoursList)
      );

      await controlerUnderTest.findWorkingHours(ctx);

      verify(
        workingHoursService.findWorkingHours(
          workingHoursQuery.startDate,
          workingHoursQuery.endDate,
          workingHoursQuery.hairSalonId
        )
      ).called();
      expect(ctx.body).to.equal(workingHoursList);
    });

    it('responds with 400 Missing parameters', async () => {
      const query = {
        startDate: workingHoursQuery.startDate,
        endDate: workingHoursQuery.endDate
      };
      const errorMessage = ErrorMessages.MISSING_QUERY_PARAMS;
      const ctx: Context = { query, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.findWorkingHours(ctx);
      ctxMock.verify();
    });

    it('respond with 400 wrong type param', async () => {
      const query = {
        startDate: 'not a date',
        endDate: workingHoursQuery.endDate,
        hairSalonId: workingHoursQuery.hairSalonId
      };
      const errorMessage = ErrorMessages.INVALID_PARAMS;
      const ctx: Context = { query, throw: () => undefined } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.findWorkingHours(ctx);
      ctxMock.verify();
    });
  });
});
