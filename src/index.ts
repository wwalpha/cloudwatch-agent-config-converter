import { S3Event, S3Handler } from 'aws-lambda';
// import { DEFAULT_CONFIG_LINUX } from './consts';
import {
  BasicMetricDefinition,
  CloudWatchAgentConfigLinux,
  CloudWatchAgentConfigWindows,
  LogsDefinition,
  MonitoringConfigs,
} from 'typings';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SNSClient } from '@aws-sdk/client-sns';

const client = new S3Client({ region: process.env.AWS_REGION });
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME as string;
const S3_OBJECT_KEY_DEFAULT_LINUX = process.env.S3_OBJECT_KEY_DEFAULT_LINUX as string;
const S3_OBJECT_KEY_DEFAULT_WINDOWS = process.env.S3_OBJECT_KEY_DEFAULT_WINDOWS as string;
let defaultConfigLinux: CloudWatchAgentConfigLinux;
let defaultConfigWindows: CloudWatchAgentConfigWindows;

export const handler: S3Handler = async (event: S3Event) => {
  // If the default configs are not defined, fetch them from S3
  defaultConfigLinux ??= (await getDefaultConfig(S3_OBJECT_KEY_DEFAULT_LINUX)) as unknown as CloudWatchAgentConfigLinux;
  defaultConfigWindows ??= (await getDefaultConfig(
    S3_OBJECT_KEY_DEFAULT_WINDOWS
  )) as unknown as CloudWatchAgentConfigWindows;

  for (;;) {
    // Pop the first record from the event
    const record = event.Records.pop();

    // If there are no more records, break the loop
    if (record === undefined) {
      break;
    }

    // Get the bucket and key from the record
    const bucket = record.s3.object.key;
    const key = record.s3.object.key;

    // Fetch the object from S3
    const context = await getObject(bucket, key);

    // Put the file to S3
    await putObject('linux-config.json', JSON.stringify(context));
  }
};

const createConfigLinux = async (configs: MonitoringConfigs[]) => {
  const linuxConfig: CloudWatchAgentConfigLinux = { ...defaultConfigLinux };
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

const createConfigWindows = async (text: string) => {};

const getDefaultConfig = async (key: string) => {
  const object = await client.send(new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
  const context = await object.Body?.transformToString();

  if (context === undefined) {
    throw new Error(`Failed to read the context of the file or the file is empty. Key: ${key}`);
  }

  return context;
};

const getConfigs = async (bucket: string, key: string) => {
  // Fetch the object from S3
  const context = await getObject(bucket, key);

  // Split the context into lines
  const lines = context.split('\n');

  // Map the lines to MonitoringConfigs
  return lines.map((line) => {
    const items = line.split('|');

    if (items.length !== 10) {
      throw new Error('Invalid number of items');
    }

    return {
      os: items[0].toUpperCase(),
      kind: items[1].toUpperCase(),
    };
  });
};

/**
 * Fetch the object from S3
 *
 * @param bucket
 * @param key
 * @returns context
 */
const getObject = async (bucket: string, key: string) => {
  // Fetch the object from S3
  const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const context = await object.Body?.transformToString();

  if (context === undefined) {
    throw new Error('Failed to read the context of the file');
  }

  return context;
};

/**
 * Put the object to S3
 *
 * @param key
 * @param body
 */
const putObject = async (key: string, body: string) => {
  // Put the file to S3
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: body,
    })
  );
};
