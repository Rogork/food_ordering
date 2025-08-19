import { Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import _, { rest } from 'lodash';
import { BaseModel } from 'src/shared/base.model';
import { Property, Required } from 'src/shared/decorators.utils';
import { asModelCtor, Model } from 'src/shared/meta.utils';

export interface IMenuItem {
  _id: ObjectId;
  name: string;
  price: number;
  addons?: { name: string; price: number }[];
}

export interface IRestaurant {
  _id: ObjectId;
  createdAt: Date;
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
  menu: { _id: ObjectId; section: string; items: IMenuItem[] }[];
}

@Model({ table: 'restaurants' })
class _RestaurantModel extends BaseModel {
  @Required()
  @Property()
  name: string;

  qty: number;
}

export const RestaurantModel = asModelCtor<_RestaurantModel>(_RestaurantModel);

export type INewRestaurant = Omit<IRestaurant, '_id' | 'createdAt'>;
export type IUpdateRestaurant = Omit<IRestaurant, 'menu' | 'createdAt'>;

@Injectable()
export class RestaurantService {
  private restaurants: IRestaurant[] = [
    {
      _id: new ObjectId(),
      createdAt: new Date(),
      name: 'Adam Subs',
      availableOn: {
        talabat: true,
        jahez: true,
        ahlan: true,
        own: true,
      },
      menu: [
        {
          _id: new ObjectId(),
          section: 'Sandwiches',
          items: [
            { _id: new ObjectId(), name: 'Philly Cheese Steak', price: 1.21 },
          ],
        },
      ],
    },
  ];

  async findOne(_id: string | ObjectId): Promise<IRestaurant | undefined> {
    if (_.isString(_id)) _id = new ObjectId(_id);
    return new Promise((resolve) => {
      resolve(
        this.restaurants.find((restaurant) => restaurant._id.equals(_id)),
      );
    });
  }

  async insert(restaurant: INewRestaurant) {
    const newRestaurant = _.assign(restaurant, {
      _id: new ObjectId(),
      createdAt: new Date(),
    });
    this.restaurants.push(newRestaurant);
    return newRestaurant;
  }

  async update(_id: string | ObjectId, update: Partial<IRestaurant>) {
    if (_.isString(_id)) _id = new ObjectId(_id);
    return new Promise((resolve, reject) => {
      const idx = this.restaurants.findIndex((restaurant) =>
        restaurant._id.equals(_id),
      );
      if (!idx) reject('Not found');
      for (const key in update) this.restaurants[idx][key] = update[key];
      resolve(true);
    });
  }

  async updateRestaruant(_id: string | ObjectId, update: IUpdateRestaurant) {
    return this.update(_id, update);
  }

  async addMenuSection(_id: string | ObjectId, name: string) {
    if (_.isString(_id)) _id = new ObjectId(_id);
    return new Promise((resolve, reject) => {
      const idx = this.restaurants.findIndex((restaurant) =>
        restaurant._id.equals(_id),
      );
      if (!idx) reject('Not found');
      if (!this.restaurants[idx].menu) this.restaurants[idx].menu = [];
      const section = { _id: new ObjectId(), section: name, items: [] };
      this.restaurants[idx].menu.push(section);
      resolve(section);
    });
  }

  async addMenuItem(
    _id: string | ObjectId,
    sectionId: string | ObjectId,
    item: Omit<IMenuItem, '_id'>,
  ) {
    if (_.isString(_id)) _id = new ObjectId(_id);
    if (_.isString(sectionId)) sectionId = new ObjectId(sectionId);
    return new Promise((resolve, reject) => {
      const idx = this.restaurants.findIndex((restaurant) =>
        restaurant._id.equals(_id),
      );
      if (!idx) reject('Not found');
      for (const restaurant of this.restaurants) {
        if (!restaurant._id.equals(_id)) continue;
        for (const section of restaurant.menu) {
          if (!section._id.equals(sectionId)) continue;
        }
      }
      resolve(false);
    });
  }
}
