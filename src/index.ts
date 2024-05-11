import { S3Event, S3Handler } from 'aws-lambda';
import { DEFAULT_CONFIG_LINUX } from './consts';
import { BasicMetricDefinition, CloudwatchAgentConfigLinux, LogsDefinition } from 'typings';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({ region: process.env.AWS_REGION });

export const handler: S3Handler = async (event: S3Event) => {
  for (;;) {
    const record = event.Records.pop();

    // If there are no more records, break the loop
    if (record === undefined) {
      break;
    }

    const bucket = record.s3.object.key;
    const key = record.s3.object.key;

    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const context = await object.Body?.transformToString();

    if (context === undefined) {
      throw new Error('Failed to read the context of the file');
    }
  }

  const linuxConfig: CloudwatchAgentConfigLinux = { ...DEFAULT_CONFIG_LINUX };
  const logs: LogsDefinition = {};
  const processes: BasicMetricDefinition = {
    measurement: ['cpu_usage', 'memory_usage', 'vsz', 'rss'],
    resources: ['*'],
  };

  linuxConfig.logs = logs;

  if (linuxConfig.metrics?.metrics_collected !== undefined) {
    linuxConfig.metrics.metrics_collected.processes = processes;
  }
};

const createConfigLinux = async (text: string) => {};

const createConfigWindows = async (text: string) => {};

const validateConfig = async (text: string) => {
  const lines = text.split('\r\n');

  const configs = lines.map((line) => {
    const items = line.split('|');

    if (items.length !== 10) {
      throw new Error('Invalid number of items');
    }

    return items;
  });
};
