import * as dotenv from 'dotenv';

dotenv.config();

export const RABBIT_DSN = process.env.RABBIT_DSN;

export const ELASTIC_API = process.env.ELASTIC_API;