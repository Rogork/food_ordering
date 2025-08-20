import { ObjectId } from 'bson';
import { DateField, Default, Id } from './decorators.utils';
import { EOperation } from './meta.utils';

export abstract class BaseModel {
  @Id()
  _id: string;

  @DateField()
  @Default(() => new Date())
  createdAt: Date;

  validate(operation?: EOperation): true | string[] {
    return true;
  };
}