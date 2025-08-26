export const TAXRate = 0.1;

export enum ETaxType {
  Inclusive = 'I',
  Exclusive = 'E',
  None = 'N',
}

export interface IPrice {
  input: number;
  type: ETaxType;
  base: number;
  tax: number;
  discount?: number;
  total: number;
}
