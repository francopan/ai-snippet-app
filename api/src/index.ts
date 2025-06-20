import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import snippetRouter from './routes/snippet.route';
import { setUpDB } from './db';
import llmRouter from './routes/llm.route';
import compression from 'compression';

(async () => {
  await setUpDB();

  const app = express();
  app.use(compression({ filter: () => false }));
  app.use(express.json());
  app.use('/snippets', snippetRouter);
  app.use("/llm", llmRouter);
  app.listen(3000, () => {
    console.log('Success! Listeninggggg on port 3000!');
  });
})();
