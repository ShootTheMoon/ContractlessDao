import express from 'express';
export const router = express.Router();

import {post_castVote} from '../controllers/vote.controller';

router.post('/cast', post_castVote);
