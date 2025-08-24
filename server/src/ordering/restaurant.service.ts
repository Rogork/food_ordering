import { Injectable } from '@nestjs/common';
import { BaseModel } from 'src/shared/base.model';
import { BaseService } from 'src/shared/base.service';
import { Default, Property, Required } from 'src/shared/decorators.utils';
import { asModelCtor, Model } from 'src/shared/meta.utils';
import _ from 'lodash';
import { _id } from 'src/shared/helpers.func';

export interface IMenuItem {
  _id: string;
  name: string;
  price: number;
  addons?: { name: string; price: number }[];
}

export interface IMenuSection {
  _id: string;
  name: string;
  items: IMenuItem[];
}

@Model({ table: 'restaurants' })
export class _RestaurantModel extends BaseModel {
  @Required()
  @Property()
  name: string;

  @Property()
  @Default('')
  thumbnail?: string;

  @Property()
  @Default('')
  location?: string;

  @Property()
  @Default('')
  menuLink?: string;

  @Property()
  @Default({
    availableOn: {
      talabat: false,
      jahez: false,
      ahlan: false,
      own: false,
    },
  })
  availableOn: {
    talabat: boolean;
    jahez: boolean;
    ahlan: boolean;
    own: boolean;
  };

  @Property()
  @Default([])
  menu: IMenuSection[];
}
export const RestaurantModel = asModelCtor<_RestaurantModel>(_RestaurantModel);
@Injectable()
export class RestaurantService extends BaseService<_RestaurantModel> {
  protected get Model() { return RestaurantModel; }

  async addMenuSection(restaurantId: string, section: IMenuSection) {
    const restaurant = await this.findOne({ _id: restaurantId });
    if (!restaurant) throw new Error('Restaurant not found');
    section._id = _id();
    restaurant.menu.push(section);
    const result = await this.update({ _id: restaurantId }, { $set: restaurant });
    return result === 1;
  }

  async addMenuItem(restaurantId: string, sectionId: string, item: IMenuItem) {
    const restaurant = await this.findOne({ _id: restaurantId });
    if (!restaurant) throw new Error('Restaurant not found');
    const section = _.find(
      restaurant.menu,
      (section) => section._id === sectionId,
    );
    if (!section) throw new Error('Restaurant menu section not found');
    item._id = _id();
    section.items.push(item);
    const result = await this.update({ _id: restaurantId }, { $set: restaurant });
    return result === 1;
  }

  async editMenuItem(restaurantId: string, sectionId: string, item: IMenuItem) {
    const restaurant = await this.findOne({ _id: restaurantId });
    if (!restaurant) throw new Error('Restaurant not found');
    const section = _.find(
      restaurant.menu,
      (section) => section._id === sectionId,
    );
    if (!section) throw new Error('Menu section not found');
    const itemIndex = _.findIndex(
      section.items,
      (other) => other._id === item._id,
    );
    if (itemIndex === -1) throw new Error('Menu item not found');
    section.items[itemIndex] = item;
    const result = await this.update({ _id: restaurantId }, { $set: restaurant });
    return result === 1;
  }

  async removeMenuItem(
    restaurantId: string,
    sectionId: string,
    itemId: string,
  ) {
    const restaurant = await this.findOne({ _id: restaurantId });
    if (!restaurant) throw new Error('Restaurant not found');
    const section = _.find(
      restaurant.menu,
      (section) => section._id === sectionId,
    );
    if (!section) throw new Error('Menu section not found');
    const itemIndex = _.findIndex(
      section.items,
      (other) => other._id === itemId,
    );
    if (itemIndex === -1) throw new Error('Menu item not found');
    section.items.splice(itemIndex, 1);
    const result = await this.update({ _id: restaurantId }, { $set: restaurant });
    return result === 1;
  }
}
