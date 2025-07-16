import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: string | Record<string, any>): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toBeEnabled(): R;
      toBeDisabled(): R;
      toHaveLength(length: number): R;
      toContain(item: any): R;
      toBeGreaterThan(number: number): R;
      toBeLessThan(number: number): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toBe(value: any): R;
      toEqual(value: any): R;
      toMatchObject(object: Record<string, any>): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(times: number): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toThrow(error?: string | RegExp | Error): R;
    }
  }

  namespace jest {
    interface Expect {
      objectContaining(object: Record<string, any>): any;
      any(constructor: any): any;
      arrayContaining(array: any[]): any;
      stringContaining(string: string): any;
      stringMatching(string: string | RegExp): any;
    }
  }
}
