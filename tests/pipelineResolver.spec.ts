import { describe, it, beforeAll, vi, expect } from 'vitest';
import { Context } from '@aws-appsync/utils';
import AppSyncMock from '../src/appsync-mock';
import createStack from '../sample/stack/stack.factory';

describe('Pipeline Resolver', () => {
  let appsync: AppSyncMock<Context>;

  const usersDynamoTable = vi.fn().mockImplementation(({ id }: { id: number }) => {
    const items = [
      { id: 1, name: 'test bar', email: 'foo@bar.com', address: '1234 Main St' },
      { id: 2, name: 'test foo', email: 'bar@foo.com', address: '1235 Sub St' }
    ];

    if (!!id && typeof id === 'number') {
      return { items: [items.find( item => item.id === id )] };
    }

    return { items };
  });

  beforeAll(async () => {
    const stack = createStack();
    appsync = new AppSyncMock(stack, 'MyBackendApi', true);
  });

  describe('Simple cases', () => {
    it('should return with data from datasource', async () => {
      const resolver = appsync.getResolver('Mutation.createUser');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'valid' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);

      const resultContext = await resolver.run();

      expect(resultContext.result).toEqual(
        [
          { id: 1, name: 'test bar', email: 'foo@bar.com', address: '1234 Main St' },
          { id: 2, name: 'test foo', email: 'bar@foo.com', address: '1235 Sub St' }
        ]
      );
    });

    it('should return with the first item from datasource', async () => {
      const resolver = appsync.getResolver('Mutation.createUser');
      resolver
        .addDefaultContext({ arguments: { input: { id: 1 } } } as Context)
        .addMockDataSource('users', usersDynamoTable);

      const resultContext = await resolver.run();

      expect(resultContext.result).toEqual(
        [
          { id: 1, name: 'test bar', email: 'foo@bar.com', address: '1234 Main St' }
        ]
      );
    });
  });

  describe('Error handling', () => {
    it.skip('should handle util.appendError', () => {
    });

    it('should handle earlyReturn', async () => {
      const resolver = appsync.getResolver('Mutation.createUser');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'earlyReturn' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);
  
      const resultContext = await resolver.run();
  
      expect(resultContext.result).toEqual({ someKey: 'earlyReturn' });
      expect(resultContext.error?.message).toBeUndefined();
    });

    it('should handle util.error', async () => {
      const resolver = appsync.getResolver('Mutation.createUser');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'invalid' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);
  
      const resultContext = await resolver.run();
  
      expect(resultContext.result).toBeUndefined();
      expect(resultContext.error?.message).toEqual('Invalid user id');
    });
  });
});