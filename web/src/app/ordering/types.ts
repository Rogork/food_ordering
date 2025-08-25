import { IUser } from "../shared/auth/auth-service";

const TAXRate = 0.1;

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

export function calcIPrice(price: number = 0, taxType = ETaxType.None, discount: number = 0): IPrice {
  if (taxType === ETaxType.Inclusive) {
    return {
      input: price,
      type: taxType,
      base: price / TAXRate,
      tax: price - (price / TAXRate),
      discount: discount,
      total: price - discount,
    }
  } else if (taxType === ETaxType.Exclusive) {
    return {
      input: price * (1 + TAXRate),
      type: taxType,
      base: price,
      tax: price * TAXRate,
      discount: discount,
      total: (price * (1 + TAXRate)) - discount,
    }
  } else {
    return {
      input: price,
      type: taxType,
      base: price,
      tax: 0,
      discount: discount,
      total: price - discount,
    }
  }
}

export interface IMenuItem {
  _id: string;
  name: string;
  price: IPrice;
  addons?: { name: string; price: number }[];
}

export interface IMenuSection {
  _id: string;
  name: string;
  items: IMenuItem[];
}

export interface IRestaurant {
  _id: string;
  name: string;
  thumbnail?: string;
  location?: string;
  menuLink?: string;
  availableOn: {
    talabat: boolean;
    jahez: boolean;
    ahlan: boolean;
    own: boolean;
  };
  menu: IMenuSection[];
}

export interface IOrderItem {
  item: IMenuItem & { note?: string };
  amount: number;
}

export interface IUserOrder {
  user: Partial<IUser>;
  items: IOrderItem[];
  calc?: {
    amount: number;
    total: number;
    payable: number;
  };
}

export enum EOrderStatus {
  Active = 'A',
  Closed = 'C',
  Placed = 'P',
  Complete = 'M',
}

export interface IOrder {
  _id: string;
  status: EOrderStatus;
  createdAt: Date;
  createdBy: Partial<IUser>;
  closing: Date;
  restaurant: Partial<IRestaurant>;
  orders: IOrderItem[];
  delivery: number;
  calc?: IPrice & { amount: number };
  sendMoneyTo?: { name: string, benefit: string, note?: string };
}
