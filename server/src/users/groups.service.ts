import { Injectable } from '@nestjs/common';
import { BaseModel } from 'src/shared/base.model';
import { BaseService } from 'src/shared/base.service';
import { Default, Property, Required } from 'src/shared/decorators.utils';
import { asModelCtor, Model } from 'src/shared/meta.utils';
import _ from 'lodash';
import { _id, generateCode } from 'src/shared/helpers.func';
import { _UserModel } from 'src/users/users.service';

@Model({ table: 'groups' })
export class _GroupModel extends BaseModel {
    @Property()
    createdBy: Partial<_UserModel>;

    @Property()
    name: string;

    @Property()
    @Default({ insert: generateCode(6) })
    code: string;
}
export const GroupModel = asModelCtor<_GroupModel>(_GroupModel);

@Injectable()
export class GroupService extends BaseService<_GroupModel> {
    protected get Model() { return GroupModel; }

}
