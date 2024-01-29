import express from 'express';
export const router = express.Router();

import { get_active } from '../controllers/proposal.controller';

router.get('/get_active', get_active);
