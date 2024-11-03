import { Context } from "@aws-appsync/utils";

export function request(ctx: Context) {
  return {
    id: ctx.arguments.input.id,
  }
}

export function response(ctx: Context) {
  return ctx.result.items;
}
