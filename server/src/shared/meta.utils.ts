// meta.utils.ts
import _ from 'lodash';
import 'reflect-metadata';

/* =========================
 *  Phases / Metadata Keys
 * ========================= */
export enum EOperation {
  NEW = 'new',
  INSERT = 'insert',
  UPDATE = 'update',
}

export const MODEL_METADATA = Symbol('MODEL_METADATA');
export const FIELD_METADATA = Symbol('FIELD_METADATA');
export const MODEL_VALIDATORS = Symbol('MODEL_VALIDATORS');

/* =========================
 *  Field Metadata Types
 * ========================= */

export type DefaultValue<T> = T | (() => T);

export interface FieldDefaults<T> {
  new?: DefaultValue<T>;
  insert?: DefaultValue<T>;
  update?: DefaultValue<T>;
}

/**
 * Field metadata modeled around runtime constructors (e.g. Date, ObjectId).
 * getter/setter here are TRUE accessors bound to `this`, not coercion functions.
 * If you prefer coercion on assignment, omit getter/setter and do coercion in the ctor.
 */
export interface FieldMetadata<
  TCtor extends new (...args: any[]) => any = any,
> {
  /** Runtime constructor (e.g., Date, ObjectId, String, Number) */
  type?: TCtor;

  /** Phase-specific defaults, or a single factory/value */
  default?:
    | FieldDefaults<InstanceType<TCtor>>
    | DefaultValue<InstanceType<TCtor>>;

  /** True accessor reading from instance (e.g. via Symbol-backed store) */
  getter?: (this: any) => any;

  /** True accessor writing to instance (e.g. via Symbol-backed store) */
  setter?: (this: any, v: any) => void;

  /** Optional requirement flags (usable by validators) */
  required?: true | { new?: true; insert?: true; update?: true };
}

/* =========================
 *  Validators
 * ========================= */

export type ValidatorFn<T = any> = (
  entity: T,
  op?: EOperation,
) => true | string;

export function addModelValidator(target: any, validator: ValidatorFn) {
  const existing: ValidatorFn[] =
    Reflect.getMetadata(MODEL_VALIDATORS, target) || [];
  existing.push(validator);
  Reflect.defineMetadata(MODEL_VALIDATORS, existing, target);
}

export function getModelValidators<T extends object>(
  entity: T,
): ValidatorFn<T>[] {
  // stored on the prototype where decorators run
  const proto = Object.getPrototypeOf(entity);
  return (Reflect.getMetadata(MODEL_VALIDATORS, proto) ||
    []) as ValidatorFn<T>[];
}

/* =========================
 *  Field Metadata Helpers
 * ========================= */

/** Set/merge field metadata on a prototype */
export function setFieldMetadata<TCtor extends new (...args: any[]) => any>(
  target: any,
  propertyKey: string,
  data: Partial<FieldMetadata<TCtor>>,
) {
  const fields: Record<string, FieldMetadata<any>> = Reflect.getMetadata(
    FIELD_METADATA,
    target,
  ) || {};

  fields[propertyKey] = { ...(fields[propertyKey] ?? {}), ...data };
  Reflect.defineMetadata(FIELD_METADATA, fields, target);
}

/** Get field metadata defined directly on a prototype */
function getOwnFieldMetadata(proto: any): Record<string, FieldMetadata<any>> {
  return Reflect.getMetadata(FIELD_METADATA, proto) || {};
}

/**
 * Merge field metadata across the prototype chain so derived classes
 * see base fields. Child overrides take precedence.
 */
function getMergedFieldMetadataFromProto(
  proto: any,
): Record<string, FieldMetadata<any>> {
  const chain: any[] = [];
  let p = proto;
  while (p && p !== Object.prototype) {
    chain.push(p);
    p = Object.getPrototypeOf(p);
  }
  // build from base -> derived so child overrides win last
  const merged: Record<string, FieldMetadata<any>> = {};
  for (let i = chain.length - 1; i >= 0; i--) {
    Object.assign(merged, getOwnFieldMetadata(chain[i]));
  }
  return merged;
}

/* =========================
 *  Defaults Application
 * ========================= */

/** Apply defaults to nullish fields for the given phase (NEW by default) */
export function applyDefaults(
  entity: any,
  op: EOperation = EOperation.NEW,
): void {
  const allFields = getMergedFieldMetadataFromProto(
    entity.constructor?.prototype,
  );
  for (const [fieldName, meta] of Object.entries(allFields)) {
    const current = (entity as any)[fieldName];
    if (current !== undefined && current !== null) continue;
    const value = _.isFunction(meta.default)
      ? meta.default()
      : (meta.default?.[op] ?? meta.default);
    if (value !== undefined) entity[fieldName] = value;
  }
}

/* =========================
 *  Model Decorator
 * ========================= */

export interface ModelOptions {
  table?: string;
}

/**
 * ClassDecorator that:
 *  - Installs property accessors (get/set) once per class, inheritance-safe.
 *  - Returns a constructor that accepts `(init?: Record<string, any>)`.
 *  - Applies NEW-phase defaults then assigns `init` values for any known field
 *    (including inherited ones).
 *  - Adds an instance `validate(operation)` method.
 *
 * NOTE: TypeScript does not auto-update the class type via decorators.
 * If you want types for `(init?: Partial<T>)` + `.validate`, use `asModelCtor<T>()` helper below.
 */
export function Model(options: ModelOptions = {}): ClassDecorator {
  return function (target: Function) {
    // Merge field metadata across the chain so derived classes see base fields
    const mergedFields: Record<
      string,
      FieldMetadata<any>
    > = getMergedFieldMetadataFromProto(target.prototype);

    // Install accessors ONCE for this class where requested; never override existing descriptors
    for (const [field, config] of Object.entries(mergedFields)) {
      if (!config.getter && !config.setter) continue;

      const existing = Object.getOwnPropertyDescriptor(target.prototype, field);
      if (existing?.get || existing?.set) continue; // already installed for this class

      const desc: PropertyDescriptor = { enumerable: true, configurable: true };
      if (config.getter)
        desc.get = function () {
          return config.getter!.call(this);
        };
      if (config.setter)
        desc.set = function (v: any) {
          return config.setter!.call(this, v);
        };
      Object.defineProperty(target.prototype, field, desc);
    }

    // Wrapper constructor using proper [[Construct]] semantics
    const NewCtor: any = function (this: any, init?: Record<string, any>) {
      // Construct the original class instance
      const self = Reflect.construct(target as any, [], new.target || NewCtor);

      // Apply NEW-phase defaults first (inherited fields included)
      applyDefaults(self, EOperation.NEW);

      // Assign init values for any known field (inherited included)
      if (init) {
        for (const [key, value] of _.entries(init) as [string, any][]) {
          if (key in mergedFields) (self as any)[key] = value;
        }
      }
      return self;
    };

    // Prototype chain
    NewCtor.prototype = Object.create(target.prototype, {
      constructor: { value: NewCtor, writable: true, configurable: true },
    });

    // Instance validate method
    NewCtor.prototype.validate = function (
      operation: EOperation,
    ): true | string[] {
      const validators = getModelValidators(this);
      const errors: string[] = [];
      for (const validator of validators) {
        const res = validator(this, operation);
        if (res !== true) errors.push(res);
      }
      return errors.length === 0 ? true : errors;
    };

    // Preserve static properties
    Object.setPrototypeOf(NewCtor, target);

    // Define the modelClass property non-statically
    Object.defineProperty(NewCtor.prototype, 'modelClass', {
      get: () => asModelCtor(this),
      set: () => {},
      configurable: true,
    });

    // Define the modelClass property statically
    Object.defineProperty(NewCtor, 'modelClass', {
      get: () => asModelCtor(this),
      enumerable: false,
      configurable: true,
    });

    // Attach model options to the NEW ctor
    Reflect.defineMetadata(MODEL_METADATA, options, NewCtor);

    return NewCtor;
  };
}

/* =========================
 *  Typing Helpers (Optional)
 * ========================= */

/**
 * A constructor that accepts `(init?: Partial<T>)` and produces `T & { validate(...) }`.
 * Use at the usage site to regain types from a decorated class.
 *
 *   @Model()
 *   class User { ... }
 *
 *   export const UserModel = asModelCtor<User>(User);
 *   const u = new UserModel({ username: 'john' });
 *   u.validate(EOperation.INSERT);
 */
export type ModelCtor<T> = new (init?: Partial<T>) => T & {
  validate(operation?: EOperation): true | string[];
};

export function asModelCtor<T>(cls: any): ModelCtor<T> {
  return cls as ModelCtor<T>;
}
