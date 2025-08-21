import { DateField, Default, Id } from './decorators.utils';
import { EOperation } from './meta.utils';

export abstract class BaseModel {
  @Id()
  _id: string;

  @DateField()
  @Default(() => new Date())
  createdAt: Date;

  validate(operation?: EOperation): true | string[] {
    throw new Error("BaseModel.validate() not overridden correctly during reflection");
  };
}