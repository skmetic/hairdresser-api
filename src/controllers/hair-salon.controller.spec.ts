import { expect } from 'chai';
import { Context } from 'koa';
import { IRouterContext } from 'koa-router';
import 'mocha';
import * as sinon from 'sinon';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { HairSalonController } from './hair-salon.controller';
import { HairSalon } from '../models/hair-salon.entity';
import { HairSalonService } from '../services/hair-salon.service';
import { HairSalonTestBuilder } from '../tesutilities/hair-salon.test-builder';
import { ErrorMessages } from '../exceptions/error-messages';

describe('HairSalonControler', () => {
  let controlerUnderTest: HairSalonController;
  let hairSalonService: HairSalonService;

  const testId = 226;
  const hairSalonWithId: HairSalon = HairSalonTestBuilder.newHairSalon()
    .withDefaultValues()
    .withId(testId)
    .build();
  const hairSalonWithoutId: HairSalon = HairSalonTestBuilder.newHairSalon()
    .withDefaultValues()
    .build();

  beforeEach(() => {
    hairSalonService = mock(HairSalonService);
    controlerUnderTest = new HairSalonController(instance(hairSalonService));
  });

  // ---------------------------------------------------------------------------------
  //    Get  all Hair salons
  // ---------------------------------------------------------------------------------

  describe('getAllHairSalons', () => {
    it('puts the hairSalons on the body', async () => {
      const hairSalons = HairSalonTestBuilder.generateListOfDefaultHairSalons(6);
      when(hairSalonService.getAllHairSalons()).thenReturn(Promise.resolve(hairSalons));
      const ctx: Context = {} as Context;
      await controlerUnderTest.getAllHairSalons(ctx);
      expect(ctx.body).to.equal(hairSalons);
    });
  });

   // ---------------------------------------------------------------------------------
  //    Get hair salon by
  // ---------------------------------------------------------------------------------

  describe('getHairSalonById', () => {
    it('return with 404 if no hairSalon is found', async () => {
      const errorMessage = ErrorMessages.HAIR_SALON_NOT_FOUND;
      const ctx: Context = {
        params: { id: testId },
        throw: () => null
      } as Context;
      when(hairSalonService.findHairSalonById(testId)).thenThrow(new Error(errorMessage));
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(404, errorMessage);

      await controlerUnderTest.getHairSalonById(ctx);

      ctxMock.verify();
    });

    it('puts the found hairSalon on the body', async () => {
      const ctx: Context = {} as Context;
      ctx.params = { id: testId };
      when(hairSalonService.findHairSalonById(testId)).thenReturn(Promise.resolve(hairSalonWithId));

      await controlerUnderTest.getHairSalonById(ctx);
      verify(hairSalonService.findHairSalonById(testId)).called();
      expect(ctx.body).to.equal(hairSalonWithId);
    });
  });

   // ---------------------------------------------------------------------------------
  //    Save hairSalon
  // ---------------------------------------------------------------------------------

  describe('saveHairSalon', () => {
    it('delegates to hairSalonService and responds with 200', async () => {
      const requestBody = {
        name: hairSalonWithoutId.name,
        address: hairSalonWithoutId.address,
        phone: hairSalonWithoutId.phone,
        email: hairSalonWithoutId.email
      };
      const ctx: Context = { throw: () => null, request: { body: requestBody } } as Context;
      when(hairSalonService.saveHairSalon(anything())).thenReturn(Promise.resolve(hairSalonWithId));
      await controlerUnderTest.saveHairSalon(ctx);

      const [firstArg] = capture(hairSalonService.saveHairSalon).last();
      expect(firstArg.id).equals(undefined);
      expect(firstArg.name).equals(requestBody.name);
      expect(firstArg.address).equals(requestBody.address);
      expect(firstArg.phone).equals(requestBody.phone);
      expect(firstArg.email).equals(requestBody.email);

      expect(ctx.body).to.equal(hairSalonWithId);
    });

    it('does not delegate to hairSalonService', async () => {
      const requestBody = {
        name: hairSalonWithoutId.name,
        address: hairSalonWithoutId.address,
        email: hairSalonWithoutId.email
      };
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      await controlerUnderTest.saveHairSalon(ctx);
      verify(hairSalonService.saveHairSalon(anything())).never();
    });

    it('responds with 400 Missing parameters', async () => {
      const requestBody = {
        name: hairSalonWithoutId.name,
        address: hairSalonWithoutId.address,
        email: hairSalonWithoutId.email
      };
      const errorMessage = ErrorMessages.MISSING_PARAMS;
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveHairSalon(ctx);
      ctxMock.verify();
    });

    it('responds with 400 Parameter of invalide type.', async () => {
      const requestBody = {
        name: hairSalonWithoutId.name,
        address: hairSalonWithoutId.address,
        phone: hairSalonWithoutId.phone,
        email: 'invalid email address'
      };
      const errorMessage = ErrorMessages.INVALID_PARAMS
      const ctx: Context = { request: { body: requestBody }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);
      await controlerUnderTest.saveHairSalon(ctx);
      ctxMock.verify();
    });
  });

  // ---------------------------------------------------------------------------------
  //    Delete hairSalon
  // ---------------------------------------------------------------------------------

  describe('deleteHairSalon', () => {
    it('delegates id to hairSalonService and responds with 200', async () => {
      const ctx: Context = { params: { id: testId } } as Context;
      when(hairSalonService.deleteHairSalon(testId)).thenReturn(Promise.resolve());

      await controlerUnderTest.deleteHairSalon(ctx);

      verify(hairSalonService.deleteHairSalon(testId)).called();
      expect(ctx.status).to.equal(200);
    });

    it('respond with 400 wrong type param', async () => {
      const wrongId = 'wrongId';
      const errorMessage = 'Parameter should be a number.';
      const ctx: Context = { params: { id: wrongId }, throw: () => null } as Context;
      const ctxMock = sinon.mock(ctx);
      ctxMock.expects('throw').withExactArgs(400, errorMessage);

      await controlerUnderTest.deleteHairSalon(ctx);

      ctxMock.verify();
    });
  });


});
