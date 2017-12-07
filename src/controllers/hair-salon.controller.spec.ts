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
      const errorMessage = 'No hairSalon found with ID.';
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

});
