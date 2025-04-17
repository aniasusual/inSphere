"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/jamRoutes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const jamsController_1 = require("../controllers/jamsController");
const multer_1 = require("../middleware/multer");
const jamsRouter = (0, express_1.Router)();
jamsRouter.post('/create', auth_1.isAuthenticated, multer_1.singleFile, jamsController_1.createJam);
jamsRouter.get('/local', auth_1.isAuthenticated, jamsController_1.getLocalJams);
jamsRouter.route("/getSearchData").get(jamsController_1.getSearchData);
jamsRouter.route("/find-jams-around").post(jamsController_1.findJamsAround);
exports.default = jamsRouter;
