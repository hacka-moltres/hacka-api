import * as express from 'express';
import * as Joi from 'joi';
import { UAParser } from 'ua-parser-js';

import { enQueue, sendToQueue } from './../queue';
import { schema } from './../validator/schema';

const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
  const isValid = Joi.validate(req.body, schema, {
    abortEarly: false,
    stripUnknown: { objects: true, arrays: true } as any,
  });

  if (!!isValid.error) {
    const { message, details } = isValid.error;
    res.status(400).send({ message, details });
    return;
  }

  const data: ISession = req.body;
  const parser = new UAParser;
  const ua = req.headers['user-agent'];
  const fullBrowserVersion = parser.setUA(ua).getBrowser().version;
  const browserVersion = fullBrowserVersion && fullBrowserVersion.split('.', 1).toString();
  const browserVersionNumber = browserVersion && Number(browserVersion);
  const browserName = parser.setUA(ua).getBrowser().name;
  const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).toString();

  const tags: string[] = [
    `ip:${ip.split(':').pop()}`,
    `timestamp:${Date.now()}`,
    `datetime:${(new Date).toLocaleDateString()}`,
    `browserName:${browserName}`,
    `browserVersionNumber:${browserVersionNumber}`,
  ];

  data.tags.push(...tags);

  sendToQueue(enQueue.processDataInit, data);

  res.status(200).send({});
  return;
});

router.get('/ping', async (res: express.Response) => {
  sendToQueue(enQueue.processDataInit, {} as ISession);
  res.status(200).send('pong');
});

export default router;
