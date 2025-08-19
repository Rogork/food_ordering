import { BaseModel } from './base.model';

export class BaseService<T extends typeof BaseModel> {
  constructor() {}

  public findOne() {}
}
