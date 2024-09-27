import express from 'express';
import { createActivity,getActivities,updateActivity,getActivityById,deleteActivity } from '../controllers/activity.controller.js';



const router = express.Router();


router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);



export default router;