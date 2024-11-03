import { Context } from "@aws-appsync/utils";
import * as cdk from 'aws-cdk-lib';
import { BaseDataSource } from 'aws-cdk-lib/aws-appsync';
import { AppSyncHelper, PipelineResolverGroup, UnitResolverFile } from './appsync-helper';
import PipelineResolver from "./pipeline-resolver";

export default class AppSyncMock<T extends Context> {
  public context: T;

  private readonly verbose: boolean = false;
  private readonly stack: cdk.Stack;
  private readonly apiName: string;
  private readonly resolvers: Map<string, UnitResolverFile | PipelineResolverGroup> = new Map<string, UnitResolverFile | PipelineResolverGroup>();
  private availableDatasources: Record<string, BaseDataSource> = {};


  constructor(stack: cdk.Stack, apiName: string, verbose: boolean = false) {
    this.stack = stack;
    this.apiName = apiName;
    this.verbose = verbose;

    this.init();
  }

  public getResolver(resolverName: string) {
    const resolver = this.resolvers.get(resolverName);

    if (!resolver) {
      throw new Error(`Cannot find resolver ${resolverName}, possible resolvers: ${Array.from(this.resolvers.keys())}`);
    }

    const resolverDescriptor = resolver.kind === 'UNIT' 
      ? { fns: [resolver] } as unknown as PipelineResolverGroup
      : resolver;
      
    return new PipelineResolver<T>(
      this.availableDatasources, 
      this.context,
      resolverDescriptor, 
      this.verbose
    );
  }

  public setIdentity(identity: T['identity']) {
    this.context.identity = identity;
  }

  private init() {
    const api = this.stack.node.tryFindChild(this.apiName) as AppSyncHelper;
    const resolvers = [...api.getUnitResolvers(), ...api.getPipelineResolvers()];

    // @ts-expect-error private
    this.availableDatasources = api.datasources;

    this.context = {
      ...this.context,
      // @ts-expect-error private
      // aws libs like dynamo / s3 etc. will have some placeholder value here
      env: api.api.environmentVariables,
      identity: {} as T['identity'],
    }

    for (const resolverFile of resolvers) {
      this.resolvers.set(`${resolverFile.typeName}.${resolverFile.fieldName}`, resolverFile);
    }
  }
}
