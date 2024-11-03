import { Context, util } from "@aws-appsync/utils";

export function request(ctx: Context) {
  if (ctx.arguments.input.id === 'invalid') {
    util.error('Invalid user id');
  }

  if (ctx.arguments.input.id === 'appendError') {
    util.appendError('Email is required');
  }

  return {}
}

export function response(ctx: Context) {
  return ctx.result.items;
}
