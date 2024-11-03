import { Context, util, runtime } from "@aws-appsync/utils";

export function request(ctx: Context) {
  if (ctx.arguments.input.id === 'invalid') {
    util.error('Invalid user id');
  }

  if (ctx.arguments.input.id === 'appendError') {
    util.appendError('Some error');
  }

  if (ctx.arguments.input.id === 'earlyReturn') {
    runtime.earlyReturn({ someKey: 'earlyReturn' });
  }

  return {
    payload: ctx.arguments.input.id,
  }
}

export function response(ctx: Context) {
  return {}
}
