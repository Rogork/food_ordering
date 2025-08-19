import 'reflect-metadata';

export enum EOperation {
  INSERT,
  UPDATE,
}

// field defs
export const MODEL_METADATA = Symbol('MODEL_METADATA');
export const FIELD_METADATA = Symbol('FIELD_METADATA');
export const MODEL_VALIDATORS = Symbol('MODEL_VALIDATORS');

export interface FieldMetadata<T extends any> {
  type: T;
  required?: { insert?: true; update?: true } | true;
  default?: { insert?: () => T; update?: () => T } | (() => T);
  getter?: (instance: any) => T;
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

export function applyDefaults(
  entity: any,
  operation: EOperation = EOperation.INSERT,
): void {
  const fields = getFieldMetadata(entity);
  for (const [key, meta] of Object.entries(fields)) {
    if (entity[key] == null && meta.default) {
      if (meta.default instanceof Function) {
        entity[key] = meta.default();
      } else {
        if (operation === EOperation.INSERT && meta.default.insert)
          entity[key] = meta.default.insert();
        else if (operation === EOperation.UPDATE && meta.default.update)
          entity[key] = meta.default.update();
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

// model defs
export interface ModelOptions {
  table?: string;
}

export function Model(options: ModelOptions = {}): ClassDecorator {
  return function (target: Function) {
    const newConstructor: any = function (
      this: any,
      init?: Record<string, any>,
    ) {
      // Call original constructor
      target.apply(this);

      const fields: Record<string, FieldMetadata<any>> = Reflect.getMetadata(
        FIELD_METADATA,
        target.prototype,
      ) || {};

      // Apply defaults first
      applyDefaults(this);

      if (init) {
        for (const [key, value] of Object.entries(init)) {
          if (fields[key]) {
            // If the field had a setter, use it (works because we defined property descriptors in Field())
            this[key] = value;
          } else {
            // fallback: assign directly
            this[key] = value;
          }
        }
      }
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

    // Preserve prototype chain
    newConstructor.prototype = Object.create(target.prototype);
    newConstructor.prototype.constructor = newConstructor;
    newConstructor.prototype.validate = validate;

    Reflect.defineMetadata(MODEL_METADATA, options, newConstructor);

    return newConstructor;
  };
}
