import _ from 'lodash';
import 'reflect-metadata';

export enum EOperation {
  NEW,
  INSERT,
  UPDATE,
}

export const MODEL_METADATA = Symbol('MODEL_METADATA');
export const FIELD_METADATA = Symbol('FIELD_METADATA');
export const MODEL_VALIDATORS = Symbol('MODEL_VALIDATORS');

export interface FieldMetadata<T extends any> {
  type: T;
  required?: { insert?: true; update?: true } | true;
  default?: { new?: () => T; insert?: () => T; update?: () => T } | (() => T);
  getter?: () => T;
  setter?: (val: any) => void;
}

export type ModelValidator = (
  entity: any,
  operation: EOperation,
) => true | string;

export function getFieldMetadata(
  target: any,
): Record<string, FieldMetadata<any>> {
  return Reflect.getMetadata(FIELD_METADATA, target) || {};
}

export function getModelValidators(target: any): ModelValidator[] {
  return Reflect.getMetadata(MODEL_VALIDATORS, target) || [];
}

export function appendModelValidator(target: any, validator: ModelValidator) {
  let validators: ModelValidator[] = Reflect.getMetadata(
    MODEL_VALIDATORS,
    target,
  );
  if (validators === undefined) {
    validators = [];
    Reflect.defineMetadata(MODEL_VALIDATORS, validators, target);
  }
  validators.push(validator);
}

export function applyDefaults(
  entity: any,
  operation: EOperation = EOperation.NEW,
): void {
  const fields = getFieldMetadata(entity);
  for (const [key, meta] of Object.entries(fields)) {
    if ((entity[key] === null || entity[key] === undefined) && meta.default) {
      if (meta.default instanceof Function) {
        entity[key] = meta.default();
      } else {
        if (operation === EOperation.INSERT && meta.default.insert)
          entity[key] = meta.default.insert();
        else if (operation === EOperation.UPDATE && meta.default.update)
          entity[key] = meta.default.update();
        else if (operation === EOperation.NEW && meta.default.new)
          entity[key] = meta.default.new();
      }
    }
  }
}

export function setFieldMetadata<T extends any>(
  target: any,
  propertyKey: string,
  data: Partial<FieldMetadata<T>>,
) {
  const fields: Record<string, FieldMetadata<T>> = Reflect.getMetadata(
    FIELD_METADATA,
    target,
  ) || {};
  fields[propertyKey] = { ...(fields[propertyKey] || {}), ...data };
  Reflect.defineMetadata(FIELD_METADATA, fields, target);
}

export interface ModelOptions {
  table?: string;
}

export function Model(options: ModelOptions = {}): ClassDecorator {
  return function (target: Function) {
    const NewCtor: any = function (this: any, init?: Record<string, any>) {
      // create the instance of Target with proper [[Construct]]
      const self = Reflect.construct(target as any, [], new.target || NewCtor);

      const fields: Record<string, FieldMetadata<any>> = Reflect.getMetadata(
        FIELD_METADATA,
        target.prototype,
      ) || {};

      _.each(fields, (config, field) => {
        Object.defineProperty(target.prototype, field, {
          ...(config.getter && { get: config.getter }),
          ...(config.setter && { set: config.setter }),
          enumerable: true,
          configurable: true,
        });
      });

      applyDefaults(self);

      for (const [key, value] of _.entries(init)) {
        if (fields[key]) self[key] = value;
      }
      return self;
    };

    const validate = (entity: any, operation: EOperation): true | string[] => {
      const validators = getModelValidators(entity);
      const errors: string[] = [];
      for (const validator of validators) {
        const isValid = validator(entity, operation);
        if (!isValid) errors.push(isValid);
      }
      return errors.length === 0 ? true : errors;
    };

    NewCtor.prototype = Object.create(target.prototype);
    NewCtor.prototype.constructor = NewCtor;
    NewCtor.prototype.validate = validate;

    Reflect.defineMetadata(MODEL_METADATA, options, NewCtor);

    return NewCtor;
  };
}
