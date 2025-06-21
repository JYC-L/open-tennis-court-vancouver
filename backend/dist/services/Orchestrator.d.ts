export class Orchestrator {
    scrapers: any[];
    courtScheduleRepository: any;
    onDemandUpdate(requestedAt: any, startDate: any, endDate: any): Promise<void>;
    pushToDB(results: any): Promise<void>;
    scheduledUpdate(intervalSeconds: number, offsetSeconds: number, onUpdateCallback: any): Promise<void>;
}
