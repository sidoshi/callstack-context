import { randomstring, charsets } from '@sidoshi/random-string';
import isPromise from 'p-is-promise';

const FN_IDENTIFIER = '____CALLSTACK_CONTEXT_PROVIDER____';

export function createContext<C>() {
  const contextStore: Record<string, C> = {};

  const contextPairId = randomstring({
    length: 9,
    characters: charsets.alphabetic,
  });

  function provide<T extends Function>(
    callstackContextRootFn: T,
    context: C
  ): T {
    const callstackId = randomstring(9);
    const callstackContextRootFnProviderName = `${FN_IDENTIFIER}_${contextPairId}_${callstackId}__end`;

    const hoc: any = (...args: any) => {
      contextStore[callstackId] = context;
      const caller = {
        [callstackContextRootFnProviderName]: callstackContextRootFn,
      };
      const returnValue = caller[callstackContextRootFnProviderName](...args);
      if (isPromise(returnValue)) {
        return returnValue.then(r => {
          delete contextStore[callstackId];
          return r;
        });
      } else {
        delete contextStore[callstackId];
        return returnValue;
      }
    };

    return hoc as T;
  }

  function consume() {
    const defaultStackTraceLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    const trace = new Error().stack || '';
    const contextId = trace.match(
      new RegExp(`${FN_IDENTIFIER}_${contextPairId}_(.*?)__end`)
    );
    Error.stackTraceLimit = defaultStackTraceLimit;
    if (!contextId) {
      throw new Error('Please make sure that context is provided');
    }

    return contextStore[contextId[1]];
  }

  return { provide, consume };
}
