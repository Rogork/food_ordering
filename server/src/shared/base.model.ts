import { DateField, Default, Id, Property } from './decorators.utils';
import { EOperation } from './meta.utils';

export abstract class BaseModel {
  @Property()
  @Id()
  _id: string;

  @Property()
  @DateField()
  @Default(() => new Date())
  createdAt: Date;

  validate(operation?: EOperation): true | string[] {
    throw new Error("BaseModel.validate() not overridden correctly during reflection");
  };
}