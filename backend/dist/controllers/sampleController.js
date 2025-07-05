"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleController = void 0;
class SampleController {
    getSampleData(req, res) {
        const sampleData = [
            { id: 1, name: 'Sample 1' },
            { id: 2, name: 'Sample 2' },
        ];
        res.json(sampleData);
    }
}
exports.SampleController = SampleController;
