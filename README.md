# Appsync Mock

It's a library for testing Appsync locally using CDK and [AppsyncHelper](https://github.com/aws-samples/aws-appsync-resolver-samples/blob/main/examples/cdk/constructs/appsync-helper/lib/index.ts). 
The mock tries to create the Appsync environment, so we can run and test functions, resolvers and pipeline resolvers locally on our machine with mocked datasources. 

## Usage

I am using `vitest` but `jest ` should be very similar. 

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { 
    alias: { 
      // https://github.com/vitest-dev/vitest/issues/4605
      graphql: "graphql/index.js",

      // replace import.meta.dirname with the cloned repo path
      "@aws-appsync/utils": `${import.meta.dirname}/@aws-appsync-utils`
    } 
  },
});
```

### *.spec.ts

For further references, you can check the tests files in the repo.

```typescript

let appsync;

beforeAll(async () => {
  const stack = createStack(); // should return yout cdk stack
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
```

## Contributing

Feel free to create a PR and extend the `@aws-appsync/utils` mock any time or just create an issue.