/**
 * Amazon CloudWatch Agent JSON Schema
 */
export interface CloudWatchAgentConfigLinux {
  agent?: AgentDefinition;
  metrics?: MetricsDefinition;
  logs?: LogsDefinition;
  [k: string]: unknown;
}

/**
 * Amazon CloudWatch Agent JSON Schema
 */
export interface CloudWatchAgentConfigWindows {
  agent?: AgentDefinition;
  metrics?: MetricsDefinition;
  logs?: LogsDefinition;
  [k: string]: unknown;
}

/**
 * General configuration for Amazon CloudWatch Agent
 */
export interface AgentDefinition {
  /**
   * How often the metrics defined will be collected
   */
  metrics_collection_interval?: number;
  /**
   * Specifies the location to where the CloudWatch agent writes log messages. If you specify an empty string, the log goes to stdout
   */
  logfile?: string;
  /**
   * Specifies the region to use for the CloudWatch endpoint
   */
  region?: string;
  /**
   * Specifies running the CloudWatch agent with debug log messages
   */
  debug?: boolean;
  /**
   * Specifies running the CloudWatch agent with AWS SDK debug logging. Multiple options must be separated by vertical bars.
   */
  aws_sdk_log_level?: string;
  credentials?: CredentialsDefinition;
  /**
   * Hostname will be tagged by default unless you specifying append_dimensions, this flag allow you to omit hostname from tags without specifying append_dimensions
   */
  omit_hostname?: boolean;
  [k: string]: unknown;
}

/**
 * The credentials with which agent can access aws resources
 */
export interface CredentialsDefinition {
  /**
   * The target IAM role with which agent can access aws resources
   */
  role_arn?: string;
}

/**
 * configuration for metrics to be collected
 */
export interface MetricsDefinition {
  /**
   * The namespace to use for the metrics collected by the agent. The default is CWAgent
   */
  namespace?: string;
  /**
   * Specifies the dimensions on which collected metrics are to be aggregated
   *
   * @minItems 1
   * @maxItems 1024
   */
  aggregation_dimensions?: [string[], ...string[][]];
  /**
   * Adds Amazon EC2 metric dimensions to all metrics collected by the agent, we only support fixed key value pair now: ImageId:{aws:ImageId},InstanceId:{aws:InstanceId},InstanceType:{aws:InstanceType},AutoScalingGroupName:{aws:AutoScalingGroupName}.
   */
  append_dimensions?: {
    [k: string]: string;
  };
  metrics_collected: {
    collectd?: CollectdDefinitions;
    cpu?: CpuDefinitions;
    disk?: DiskDefinitions;
    diskio?: DiskioDefinitions;
    statsd?: StatsdDefinitions;
    swap?: BasicMetricDefinition;
    mem?: BasicMetricDefinition;
    net?: NetDefinitions;
    netstat?: BasicMetricDefinition;
    processes?: BasicMetricDefinition;
    procstat?: ProcstatDefinitions;
    ethtool?: EthtoolDefinitions;
    nvidia_smi?: NvidiaGpuDefinitions;
    [k: string]: BasicMetricDefinition;
  };
  /**
   * Max time to wait before batch publishing the metrics, unit is second.
   */
  force_flush_interval?: number;
  credentials?: CredentialsDefinition;
  /**
   * The override endpoint to use to access cloudwatch
   */
  endpoint_override?: string;
}

export interface BasicMetricDefinition {
  metrics_collection_interval?: TimeIntervalDefinition;
  append_dimensions?: GeneralAppendDimensionsDefinition;
  measurement: MetricsMeasurementDefinition;
  [k: string]: unknown;
}

export type TimeIntervalDefinition = number;
export type TimeIntervalWithZeroDefinition = number;

export interface GeneralAppendDimensionsDefinition {
  [k: string]: string;
}

export interface StatsdDefinitions {
  allowed_pending_messages?: number;
  service_address?: string;
  metrics_collection_interval?: TimeIntervalDefinition;
  metrics_aggregation_interval?: TimeIntervalWithZeroDefinition;
  metric_separator?: string;
}

export type MetricsMeasurementDefinition = (
  | string
  | {
      name?: string;
      rename?: string;
      unit?: string;
      [k: string]: unknown;
    }
)[];

export interface CollectdDefinitions {
  service_address?: string;
  name_prefix?: string;
  collectd_auth_file?: string;
  collectd_security_level?: 'none' | 'sign' | 'encrypt';
  /**
   * @maxItems 10
   */
  collectd_typesdb?:
    | []
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string];
  metrics_aggregation_interval?: TimeIntervalWithZeroDefinition;
}

export type CpuDefinitions = BasicMetricDefinition & {
  /**
   * @maxItems 1
   */
  resources?: [] | ['*'];
  totalcpu?: boolean;
  [k: string]: unknown;
};

export type DiskDefinitions = BasicMetricDefinition &
  BasicResourcesDefinition & {
    /**
     * @maxItems 256
     */
    ignore_file_system_types?: string[];
    drop_device?: boolean;
    [k: string]: unknown;
  };
export type DiskioDefinitions = BasicMetricDefinition & BasicResourcesDefinition;
export type NetDefinitions = BasicMetricDefinition & BasicResourcesDefinition;

export interface BasicResourcesDefinition {
  /**
   * @maxItems 256
   */
  resources?: string[];
  [k: string]: unknown;
}

/**
 * The credentials with which agent can access aws resources
 */
export interface CredentialsDefinition {
  /**
   * The target IAM role with which agent can access aws resources
   */
  role_arn?: string;
}

export type LogsDefinition = LogsDefinition1 & {
  logs_collected?: {
    files?: LogsFilesDefinition;
    windows_events?: LogsWindowsEventsDefinition;
  };
  metrics_collected?: {
    app_signals?: {
      hosted_in?: string;
      /**
       * Custom rules defined by customer
       */
      rules?: {
        selectors: {
          /**
           * dimension used for matching
           */
          dimension: string;
          /**
           * regex used for match
           */
          match: string;
          [k: string]: unknown;
        }[];
        replacements?: {
          /**
           * dimension to be replaced
           */
          target_dimension: string;
          /**
           * replacement value
           */
          value: string;
          [k: string]: unknown;
        }[];
        /**
         * action to be done, either keep, drop or replace
         */
        action: 'drop' | 'keep' | 'replace';
        /**
         * name of rule
         */
        rule_name?: string;
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    ecs?: {
      metrics_collection_interval?: TimeIntervalDefinition;
      /**
       * Disable the extraction of metrics from EMF logs
       */
      disable_metric_extraction?: boolean;
    };
    kubernetes?: {
      cluster_name?: string;
      metrics_collection_interval?: TimeIntervalDefinition;
      /**
       * Disable the extraction of metrics from EMF logs
       */
      disable_metric_extraction?: boolean;
      [k: string]: unknown;
    };
    prometheus?: {
      cluster_name?: string;
      log_group_name?: string;
      prometheus_config_path?: string;
      emf_processor?: EmfProcessorDefinition;
      ecs_service_discovery?: EcsServiceDiscoveryDefinition;
      /**
       * Disable the extraction of metrics from EMF logs
       */
      disable_metric_extraction?: boolean;
    };
    [k: string]: unknown;
  };
  log_stream_name?: string;
  /**
   * Max time to wait before batch publishing the log, unit is second.
   */
  force_flush_interval?: number;
  credentials?: CredentialsDefinition2;
  /**
   * The override endpoint to use to access cloudwatch logs
   */
  endpoint_override?: string;
};
export type LogsDefinition1 = {
  [k: string]: unknown;
};
