import { describe, it, beforeAll, vi, expect } from 'vitest';
import { Context } from '@aws-appsync/utils';
import AppSyncMock from '../src/appsync-mock';
import createStack from '../sample/stack/stack.factory';

describe('Resolver', () => {
  let appsync: AppSyncMock<Context>;

  const usersDynamoTable = vi.fn().mockImplementation(() => {
    return {
      items: [{ id: 1, name: 'test', email: 'foo@bar.com', address: '1234 Main St'}]
    };
  });

  beforeAll(async () => {
    const stack = createStack();
    appsync = new AppSyncMock(stack, 'MyBackendApi', true);
  });

  describe('Simple cases', () => {
    it('should return with data from datasource', async () => {
      const resolver = appsync.getResolver('Query.users');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'valid' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);
  
      const resultContext = await resolver.run();
  
      expect(resultContext.result).toEqual(
        [{ id: 1, name: 'test', email: 'foo@bar.com', address: '1234 Main St'}]
      );
    });  
  });

  describe('Error handling', () => {
    it.skip('should handle util.appendError', async () => {
      const resolver = appsync.getResolver('Query.users');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'appendError' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);
  
      const resultContext = await resolver.run();
  
      expect(resultContext.result).toEqual(
        [{ id: 1, name: 'test', email: 'foo@bar.com', address: '1234 Main St'}]
      );
      expect(resultContext.error?.message).toEqual('Invalid user id');
    });

    it('should handle util.error', async () => {
      const resolver = appsync.getResolver('Query.users');
      resolver
        .addDefaultContext({ arguments: { input: { id: 'invalid' } } } as Context)
        .addMockDataSource('users', usersDynamoTable);
  
      const resultContext = await resolver.run();
  
      expect(resultContext.result).toBeUndefined();
      expect(resultContext.error?.message).toEqual('Invalid user id');
    });
  });
});