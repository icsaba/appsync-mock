import { Context } from "@aws-appsync/utils";
import type PipelineResolver from "./pipeline-resolver";
import { AppSyncFn, UnitResolverFile } from './appsync-helper';


export default class Resolver<T extends Context> {
  private readonly verbose: boolean = false;
  private readonly pipeline: PipelineResolver<T>;
  private readonly datasource: (...args: unknown[]) => any
  private readonly resolverFile: UnitResolverFile | AppSyncFn;

  constructor(
    pipeline: PipelineResolver<T>, 
    datasource: (...args: unknown[]) => any,
    resolverFile: UnitResolverFile | AppSyncFn, 
    verbose: boolean = false
  ) {
    this.verbose = verbose;
    this.pipeline = pipeline;
    this.datasource = datasource;
    this.resolverFile = resolverFile;
  }

  public async build() {
    if (this.verbose) {
      console.info(`building resolver ${this.resolverFile.key} using ds ${this.resolverFile.dsName}`);
    }

    let request = (_ctx: T) => {};
    let response = (_ctx: T) => {};

    try {
      const callbacks = await import(this.resolverFile.key);
      request = callbacks.request;
      response = callbacks.response;

    } catch (e) {
      // todo handle earlyReturn
      console.error(`cannot import file ${this.resolverFile.key}: ${e}`);
      throw e;
    }

    try {
      const requestResult = request(this.pipeline.context);
      const result = await this.datasource(requestResult);
      this.appendResult(result);

    } catch (error: unknown) {
      // todo handle earlyReturn
      this.appendError(error);
    }

    try {
      const result = response(this.pipeline.context);
      this.appendResult(result);
    } catch (error: unknown) {
      // todo handle earlyReturn
      this.appendError(error);
    }
  }


  private appendResult(result: unknown) {
    this.pipeline.context = {
      ...this.pipeline.context,
      result
    }
  }

  private appendError(error: unknown) {
    if (this.verbose) {
      console.log(error);
    }

    // @ts-expect-error error type is unknown
    if (error.meta === '@aws-appsync/runtime-early-return') {
      this.pipeline.context = {
        ...this.pipeline.context,
        // @ts-expect-error error type is unknown
        result: error.result
      }

      throw error;
    }

    this.pipeline.context = {
      ...this.pipeline.context,
      error: {
        // @ts-expect-error error type is unknown
        message: error.message,
        type: typeof error
      }
    }

    // @ts-expect-error error type is unknown
    if (error.meta === '@aws-appsync/utils-error') {
      throw error;
    }

    // @ts-expect-error error type is unknown
    if (error.meta === '@aws-appsync/utils-append-error') {
      return;
    }
  }
}