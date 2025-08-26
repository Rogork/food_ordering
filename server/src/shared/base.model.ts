import { DateField, Default, Id, Property } from './decorators.utils';
import { EOperation } from './meta.utils';
import { defineViews, DotPath, projectDocDeep, } from './projections.utils';

export const BASE_VIEWS = defineViews<BaseModel>()({
  public: ['_id', 'createdAt'] as const,
});

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
  }

  views(): Record<string, readonly DotPath<any>[]> { return BASE_VIEWS; }

  view(view: string) {
    const projection = this.views()?.[view];
    if (!projection) throw new Error("Calling toView on undefined projection view: " + view);
    return projectDocDeep(this, projection as readonly DotPath<typeof this>[]);
  }
}
