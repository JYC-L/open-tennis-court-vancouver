import { Request, Response } from 'express';

export class SampleController {
  public getSampleData(req: Request, res: Response): void {
    const sampleData = [
      { id: 1, name: 'Sample 1' },
      { id: 2, name: 'Sample 2' },
    ];
    res.json(sampleData);
  }
}