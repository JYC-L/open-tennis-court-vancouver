"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSampleRoutes = void 0;
const sampleController_1 = require("../controllers/sampleController");
function setSampleRoutes(app) {
    const controller = new sampleController_1.SampleController();
    app.get('/api/sample', controller.getSampleData.bind(controller));
}
exports.setSampleRoutes = setSampleRoutes;
