import { Application } from 'express';
import { SampleController } from '../controllers/sampleController';

export function setSampleRoutes(app: Application): void {
  const controller = new SampleController();
  app.get('/api/sample', controller.getSampleData.bind(controller));
}