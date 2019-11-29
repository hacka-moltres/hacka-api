import { json, urlencoded } from 'body-parser';
import * as express from 'express';

import * as configs from './configs';
import cors from './cors';
import api from './routes/api';

const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors);
app.use('/api', api);
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(3000, () => {
  console.clear();
  console.table(configs);
});
