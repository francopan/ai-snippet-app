import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import snippetRouter from './routes/snippet.route';
import { setUpDB } from './db';

(async () => {
  await setUpDB();

  const app = express();
  app.use(express.json());
  app.use('/snippets', snippetRouter);
  app.listen(3000, () => {
    console.log('Success! Listeninggggg on port 3000!');
  });
})();
