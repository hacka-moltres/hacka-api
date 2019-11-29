import * as express from 'express';
import * as Joi from 'joi';

import { enQueue, sendToQueue } from './../queue';
import { schema } from './../validator/schema';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  console.clear();
  console.log(req.body);
  const isValid = Joi.validate(req.body, schema, {
    abortEarly: false,
    stripUnknown: { objects: true, arrays: true } as any,
  });

  if (!!isValid.error) {
    const { message, details } = isValid.error;
    res.status(400).send({ message, details });
    return;
  }

  sendToQueue(enQueue.processDataInit, {
    sessionId: req.body.sessionId,
    fingerprint: req.body.fingerprint,
    tags: req.body.tags,
  } as ISession);
  res.status(200).send(true);
  return;
});

router.get('/test', async (req: express.Request, res: express.Response) => {
  sendToQueue(enQueue.processDataInit, {} as ISession);
  res.status(200).send('chegou');
});

export default router;
