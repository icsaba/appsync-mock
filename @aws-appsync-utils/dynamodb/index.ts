console.log('@aws-appsync/utils/dynamodb is mocked');

export function scan() {
  console.log('mocked db scan');
  return {};
}

export function query() {
  console.log('mocked db query');
  return {};
}

export function get() {
  console.log('mocked db get');
  return {};
}

export function put(payload) {
  console.log('mocked db put')
  return { operation: put.name, payload };
}
