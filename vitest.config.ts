import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { 
    alias: { 
      // https://github.com/vitest-dev/vitest/issues/4605
      graphql: "graphql/index.js",
      "@aws-appsync/utils": `${import.meta.dirname}/@aws-appsync-utils`
    } 
  },
});
