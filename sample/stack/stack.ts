import path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSyncHelper } from '../../appsync-helper';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { FieldLogLevel } from 'aws-cdk-lib/aws-appsync';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface BackendProps extends cdk.StackProps {
  domainName: string;
  certificateArn: string;
}

export class MyAppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, 'users', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const appSyncApp = new AppSyncHelper(this, `MyBackendApi`, {
      basedir: path.join(__dirname, '../appsync'),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        excludeVerboseContent: false,
        retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
      },
      xrayEnabled: true,
      domainName: { domainName: props.domainName, certificate: Certificate.fromCertificateArn(this, 'certificate', props.certificateArn) },
    });
    appSyncApp.addDynamoDbDataSource('users', usersTable);
    appSyncApp.addNoneDataSource('none');

    const backendUrl = `https://mybackendapi/graphql`;

    new cdk.CfnOutput(this, 'GRAPHQLENDPOINT', { value: appSyncApp.api.graphqlUrl });
    new cdk.CfnOutput(this, 'REGION', { value: cdk.Stack.of(this).region });
    new cdk.CfnOutput(this, 'CUSTOMDOMAINGRAPHQL', { value: backendUrl });
    new cdk.CfnOutput(this, 'APPSYNCID', { value: appSyncApp.api.apiId });
  }
}
