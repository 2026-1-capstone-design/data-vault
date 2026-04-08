// eslint-disable-next-line no-restricted-imports
import { createContext as reactCreateContext, use } from "react";

const EMPTY = Symbol("Context.EMPTY");

export const createContext = <T>(errorMessage?: string) => {
  const context = reactCreateContext<T | typeof EMPTY>(EMPTY);
  const useContext = () => {
    const contextValue = use(context);
    if (contextValue === EMPTY) {
      throw new Error(
        errorMessage ??
          "useContext must be used within a Provider with a value",
      );
    }
    return contextValue as T;
  };
  return [context, useContext] as const;
};
