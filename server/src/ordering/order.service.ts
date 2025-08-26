import { Injectable } from '@nestjs/common';
import { BaseModel } from 'src/shared/base.model';
import { BaseService } from 'src/shared/base.service';
import { Default, Property, Required } from 'src/shared/decorators.utils';
import { asModelCtor, Model } from 'src/shared/meta.utils';
import _ from 'lodash';
import { _id } from 'src/shared/helpers.func';
import { _RestaurantModel, IMenuItem } from './restaurant.service';
import { _UserModel } from 'src/users/users.service';
import { _GroupModel } from 'src/users/groups.service';
import { IPrice } from 'src/shared/types';

export enum EOrderStatus {
  Active = 'A',
  Closed = 'C',
  Placed = 'P',
  Complete = 'M',
}

export interface IOrderItem {
  item: IMenuItem & { note?: string };
  amount: number;
}

export interface IUserOrder {
  user: Partial<_UserModel>;
  items: IOrderItem[];
  calc?: {
    amount: number;
    total: number;
    payable: number;
  };
}

@Model({ table: 'orders' })
export class _OrderModel extends BaseModel {
  @Property()
  status: EOrderStatus;

  @Property()
  createdBy: Partial<_UserModel>;

  @Property()
  closing: Date;

  @Property()
  restaurant: Partial<_RestaurantModel>;

  @Property()
  group: Partial<_GroupModel>;

  orders: IOrderItem[];
  delivery: number;
  calc?: IPrice & { amount: number };
  sendMoneyTo?: { name: string, benefit: string, note?: string };
}
export const OrderModel = asModelCtor<_OrderModel>(_OrderModel);
@Injectable()
export class OrderService extends BaseService<_OrderModel> {
  protected get Model() { return OrderModel; }

  async addUserOrder(_id: string, userOrder: IUserOrder) {
    const order = await this.findOne({ _id });
    if (order?.status !== EOrderStatus.Active) throw "Order not found or is not active";
    const update = await this.update({ _id }, { $push: { orders: userOrder } });
    if (update === 0) throw "Order update was not successful";

  }
}
