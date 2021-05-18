export function hello(): string {
  return 'Hello World';
}

export function createUser(args: object): object {
  console.log('args:', args);

  return {
    email: 'This is the email',
    name: 'This is the name'
  };
}
