import * as cdk from 'aws-cdk-lib';
import { MyAppSyncStack } from "./stack";

export default function createStack() {
  const app = new cdk.App();

  return new MyAppSyncStack(app, `MyBackendName`, {
    domainName: 'domainname',
    certificateArn: 'cerficatarn'
  });
}