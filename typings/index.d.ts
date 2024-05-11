export * from './amazon-cloudwatch-agent-schema-linux';
export * from './amazon-cloudwatch-agent-schema-windows';

export interface MonitoringConfigs {
  os: 'LINUX' | 'WINDOWS';
  kind: 'LOG' | 'PROCESS';
}
