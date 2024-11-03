console.log('@aws-appsync/utils is mocked');

// Error handlers

class UtilError extends Error {
  readonly meta = '@aws-appsync/utils-error'
}

class UtilAppendError extends Error {
  readonly meta = '@aws-appsync/utils-append-error'
}

class UtilEarlyReturn extends Error {
  readonly result: unknown;

  constructor(result: unknown) {
    super('@aws-appsync/runtime-early-return');

    this.result = result;
  }

  readonly meta = '@aws-appsync/runtime-early-return'
}

export const time = {
  nowEpochSeconds: () => Date.now()
}

export const util = {
  error: (msg: string) => { throw new UtilError(msg); },
  appendError: (msg: string) => { throw new UtilAppendError(msg) },
  autoId: () => 1,
  time,
}

export const runtime = {
  earlyReturn: (obj: unknown): never => { throw new UtilEarlyReturn(obj) },
}

// Types

export type Context = object;

export type DynamoDBPutItemRequest = object;

export type Key = object;

export type AppSyncIdentityCognito = object;
