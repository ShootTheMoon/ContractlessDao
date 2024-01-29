import express from 'express';
export const router = express.Router();

import { get_user } from '../controllers/user.controller';

router.get('/get_user', get_user);
