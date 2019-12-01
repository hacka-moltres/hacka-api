import { format } from 'date-fns';
import * as express from 'express';
import * as Joi from 'joi';
import { UAParser } from 'ua-parser-js';

import { findByEmailOrPhone, findTagsByUser } from './../elastic';
import { enQueue, sendToQueue } from './../queue';
import { schema } from './../validator/schema';
import { search } from './../validator/search';

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
  const date = Date.now();

  data.date = date;
  data.dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const tags: string[] = [
    `ip:${ip.split(':').pop()}`,
    `timestamp:${date}`,
    `datetime:${data.dateTime}`,
    `browserName:${browserName}`,
    `browserVersionNumber:${browserVersionNumber}`,
  ];
  data.tags.push(...tags);

  sendToQueue(enQueue.processDataInit, data);

  res.status(200).send({});
  return;
});

router.post('/find', async (req: express.Request, res: express.Response) => {
  const isValid = Joi.validate(req.body, search, {
    abortEarly: false,
    stripUnknown: { objects: true, arrays: true } as any,
  });

  if (!!isValid.error) {
    const { message, details } = isValid.error;
    res.status(400).send({ message, details });
    return;
  }

  const result = await findByEmailOrPhone(req.body.search);
  const userIds = result.total > 0 && result.hits.map((key: { _id: string; }) => key._id);

  res.status(200).json(
    await findTagsByUser(userIds)
  );
  return;
});

router.get('/ping', async (res: express.Response) => {
  sendToQueue(enQueue.processDataInit, {} as ISession);
  res.status(200).send('pong');
});

export default router;
