import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Job, Queue, Worker } from 'bullmq';

import { PrismaService } from 'src/prisma/prisma.service';

export const connection = {
  host: 'localhost',
  port: 6379,
};

@Injectable()
export class MessageQueueService {
  queues: Map<string, Queue>;

  constructor(private db: PrismaService) {
    this.queues = new Map();
  }

  getOrCreateQueue(queueName: string): Queue | any {
    try {
      if (!this.queues.has(queueName)) {
        const queue = new Queue(queueName, { connection });
        this.queues.set(queueName, queue);
      }
      return this.queues.get(queueName)!;
    } catch (error) {
      console.log(error.message);
    }
  }

  // Main Function
  async queueMessage(message: any) {
    const queue = this.getOrCreateQueue(message.chatId);
    try {
      queue.resume();

      await queue.add(message.chatId, message);

      this.startBundlingWorker(queue);

      return { status: 'queued' };
    } catch (error) {
      queue.pause();
      console.log(error, 'is error');
    }
  }

  // Worker
  async startBundlingWorker(queue: Queue) {
    try {
      queue.resume();
      const jobs = await queue.getJobs(['waiting', 'delayed'], 0, -1);
      if (jobs.length > 0) {
        const bundledMessages = jobs.map((job) => job.data);

        // 👇 Do your bundling logic here
        await this.db.message.createMany({
          data: bundledMessages.map((message) => ({
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
          })),
        });

        // Clean up jobs after bundling
        await Promise.all(jobs.map((job: Job) => job.remove()));
        await queue.clean(0, -1);
      }
    } catch (error) {
      queue.pause();
      console.log(error, 'is error');
    }
  }
}
