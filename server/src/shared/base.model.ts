import { ObjectId } from 'bson';
import { Model } from './meta.utils';
import { DateField, Default, Id } from './decorators.utils';

@Model()
export class BaseModel {
  @Id()
  _id: ObjectId;

  @DateField()
  @Default(() => new Date())
  createdAt: Date;
}
