import { createContext } from '../src';

test('it consumes context from parent properly', () => {
  const { provide, consume } = createContext<{ username: string }>();

  const a = () => consume();
  const b = () => a();
  const c = () => b();
  const d = () => c();

  expect(provide(d, { username: 'test' })()).toEqual({ username: 'test' });
});

test('it throws when context not provided', () => {
  const { consume } = createContext<{ username: string }>();

  const a = () => consume();
  const b = () => a();
  const c = () => b();
  const d = () => c();

  expect(d).toThrow('Please make sure that context is provided');
});

test('it only consumes values from matching consumers', () => {
  const { provide: provide1, consume: consume1 } = createContext<{
    username: string;
  }>();
  const { provide: provide2, consume: consume2 } = createContext<{
    email: string;
  }>();

  const a = () => expect(consume1()).toEqual({ username: 'test-username' });
  const b = () => a();
  const c = () => {
    expect(consume2()).toEqual({ email: 'test-email' });
    b();
  };
  const d = () => c();
  const e = provide1(d, { username: 'test-username' });

  provide2(e, { email: 'test-email' })();

  expect.assertions(2);
});

test('it works with promises', async () => {
  const { consume, provide } = createContext<number>();
  const a = () => Promise.resolve(consume());
  const b = () => a();
  const c = () => b();
  const d = () => c();

  const valFromContext = provide(d, 6)();
  expect(valFromContext).toBeInstanceOf(Promise);
  expect(valFromContext).resolves.toEqual(6);
});
