import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const controller = new HealthController();

  it('reports the service as ok', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
