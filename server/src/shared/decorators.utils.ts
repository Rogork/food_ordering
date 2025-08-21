import { ObjectId } from 'bson';
import {
  addModelValidator,
  EOperation,
  ValidatorFn,
  setFieldMetadata,
  FieldMetadata,
} from './meta.utils';
import _ from 'lodash';
import { _id, PasswordHashSync } from './helpers.func';

////////////////////////////////////////
//                                    //
//           Type Decorators          //
//                                    //
////////////////////////////////////////
export function Id(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      type: String,
      setter: (val: string | ObjectId) => val instanceof ObjectId ? val.toHexString() : val,
      default: { insert: () => _id() },
    });
  };
}

export function NumberField(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      type: Number,
      setter: (val: string | number) => _.toNumber(val),
    });
  };
}

export function DateField(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      type: Date,
      setter: (val: string | number | Date) => new Date(val),
    });
  };
}

export function Bool(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      type: Boolean,
      setter: (val: string | number | boolean) => {
        if (_.isNumber(val)) return val === 1;
        else if (_.isString(val)) return val === 'true' || val === '1';
        else return !!val;
      },
    });
  };
}

export function Password(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      type: String,
      setter: (val: string) => PasswordHashSync.hash(val),
    });
  };
}

////////////////////////////////////////
//                                    //
//        Validator Decorators        //
//                                    //
////////////////////////////////////////
export function Required(
  opts: { insert?: true; update?: true } | true = true,
): PropertyDecorator {
  return (target, propertyKey) => {
    let validator: ValidatorFn;
    if (opts === true) {
      validator = (entity, operation) => {
        if (entity[propertyKey] === null || entity[propertyKey] === undefined)
          return `Missing required property: ${propertyKey as string}`;
        return true;
      };
    } else {
      const requiredOnInsert = opts.insert;
      const requiredOnUpdate = opts.update;
      validator = (entity, operation) => {
        if (
          operation === EOperation.INSERT &&
          requiredOnInsert === true &&
          (entity[propertyKey] === null || entity[propertyKey] === undefined)
        )
          return `Missing required property on insert: ${propertyKey as string}`;
        else if (
          operation === EOperation.UPDATE &&
          requiredOnUpdate === true &&
          (entity[propertyKey] === null || entity[propertyKey] === undefined)
        )
          return `Missing required property on update: ${propertyKey as string}`;
        return true;
      };
    }
    addModelValidator(target, validator);
  };
}


////////////////////////////////////////
//                                    //
//     Model Functional Decorators    //
//                                    //
////////////////////////////////////////
export function Default<T extends any>(
  params: { insert?: () => T; update?: () => T } | (() => T) | T,
): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, { default: params });
  };
}

export function Property(opts: { meta?: Partial<FieldMetadata> } = {}): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, opts.meta || {});
  };
}
