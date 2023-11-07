import express from 'express';

const app = express();

app.use(express.json());

import {router as voteRouter} from './routes/vote.routes';

app.post('/vote', voteRouter);

app.listen(3000, () => {
  console.log('Server running');
});
