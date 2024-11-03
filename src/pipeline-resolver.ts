import { BaseDataSource } from 'aws-cdk-lib/aws-appsync';
import { Context } from "@aws-appsync/utils";
import Resolver from "./resolver";
import { PipelineResolverGroup } from './appsync-helper';


export default class PipelineResolver<T extends Context> {
  context: T;
  
  private resolverDescriptor: PipelineResolverGroup;
  private verbose: boolean = false;
  private availableDatasources:  Record<string, BaseDataSource> = {};
  private datasources: Map<string, (...args: unknown[]) => any> = new Map();

  constructor(
    availableDatasources: Record<string, any>, 
    context: T,
    resolverDescriptor: PipelineResolverGroup, 
    verbose: boolean = false
  ) {
    this.resolverDescriptor = resolverDescriptor;
    this.verbose = verbose;
    this.availableDatasources = availableDatasources;
    this.context = context;
    this.datasources.set(
      'none', 
      (args: any) => args.payload
    );
  }

  addDefaultContext(context: T) {
    this.context = {
      ...this.context,
      ...context
    }

    return this;
  }

  addMockDataSource(dsName: string, ds: (...args: unknown[]) => any) {
    this.datasources.set(dsName, ds);

    return this;
  }

  async run(): Promise<T> {
    for (const resolverFile of this.resolverDescriptor.fns) {
      const resolver = new Resolver<T>(
        this, 
        this.getDatasource(resolverFile.dsName)!, 
        resolverFile,
        this.verbose
      );
      
      try {
        await resolver.build();
      } catch (error: unknown) {

        // @ts-expect-error error type is unknown
        if (!error.meta) {
          throw error;
        } 
        // @ts-expect-error error type is unknown
        else if (error.meta === '@aws-appsync/runtime-early-return') {
          // we should stop the pipeline execution
          break;
        }
        else {
          // we defined this type of error
          // we should stop the pipeline execution
          break;
        }
      }
    }

    return this.context;
  }

  private getDatasource(dsName: string) {
    if (!(dsName in this.availableDatasources)) {
      const availableDSTypes = Object
        .entries(this.availableDatasources)
        .map(
          ([name, dsType]) => `${name}: ${dsType.ds.type}`
        );

      throw new Error(
        `Cannot find ${dsName} datasource in your CDK, available ds: ${availableDSTypes.join(', ')}`
      );
    }

    return this.datasources.get(dsName)
  }
}