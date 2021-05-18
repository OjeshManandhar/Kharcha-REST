type User = {
  name: string;
  email: string;
};

export function hello(): string {
  return 'Hello World';
}

export function createUser(args: unknown): User {
  console.log('args:', args);

  return {
    email: 'This is the email',
    name: 'This is the name'
  };
}
