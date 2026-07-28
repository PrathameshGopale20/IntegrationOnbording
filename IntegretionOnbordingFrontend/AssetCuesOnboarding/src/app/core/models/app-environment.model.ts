export type AppEnvironmentName = 'Development' | 'UAT' | 'Production';

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  appName: string;
  companyName: string;
  environmentName: AppEnvironmentName;
  version: string;
  buildNumber: string;
}
