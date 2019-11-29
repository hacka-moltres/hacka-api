import * as amqplib from 'amqplib';
import { RABBIT_DSN } from 'configs';

const resolveConnection = getChannel();
resolveConnection
  .catch((err) => {
    throw err;
  });

export enum enQueue {
  processDataInit = 'processo.data.init',
}

export async function sendToQueue(queue: enQueue, message: ISession) {
  const [channel] = await resolveConnection;
  return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

async function getChannel(): Promise<[amqplib.Channel, amqplib.Connection]> {
  const connection = await amqplib.connect(RABBIT_DSN);
  const channel = await connection.createChannel();

  await channel.assertQueue(enQueue.processDataInit, { durable: true });
  await channel.assertQueue(enQueue.processDataInit + '.nack', { durable: true });

  return [channel, connection];
}

export async function closeConnection() {
  const [channel, connection] = await resolveConnection;
  await channel.close();
  await connection.close();
}