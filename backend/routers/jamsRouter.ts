// src/routes/jamRoutes.ts
import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { createJam, findJamsAround, getLocalJams, getSearchData } from '../controllers/jamsController';
import { singleFile } from '../middleware/multer';

const jamsRouter = Router();
jamsRouter.post('/create', isAuthenticated, singleFile, createJam);
jamsRouter.get('/local', isAuthenticated, getLocalJams);
jamsRouter.route("/getSearchData").get(getSearchData);
jamsRouter.route("/find-jams-around").post(findJamsAround);

export default jamsRouter;