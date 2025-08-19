import { ObjectId } from 'bson';
import { asModelCtor, Model } from './meta.utils';
import { DateField, Default, Id } from './decorators.utils';

@Model()
class _BaseModel {
  @Id()
  _id: ObjectId;

  @DateField()
  @Default(() => new Date())
  createdAt: Date;
}

export const BaseModel = asModelCtor<_BaseModel>(_BaseModel);
