import express from 'express';
import * as controller from '../controllers/detection_controller.js';

const router = express.Router();

router.post('/', controller.create);
router.post('/test', controller.createTest);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.delete('/all', controller.deleteAll);

export default router;
