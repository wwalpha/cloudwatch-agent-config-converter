export * from './amazon-cloudwatch-agent-schema';

export interface MonitoringConfigs {
  os: 'LINUX' | 'WINDOWS';
  kind: 'LOG' | 'PROCESS';
}
