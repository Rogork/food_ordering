// decorators.ts
import { setFieldMetadata } from './meta.utils';

// Type decorators
export function ObjectId(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, { type: 'objectId' });
  };
}

export function DateField(): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, { type: 'date' });
  };
}

// Requirement decorators
export function Required(opts: {
  required: { insert?: true; update?: true } | true
}): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, { required: opts.required });
  };
}

// Default value decorator
export function Default<T extends any>(opts: { onInsert?: { insert?: () => T; update?: () => T } | (() => T) }): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, { default: opts.onInsert });
  };
}

// Generic field (custom getter)
export function Field(opts: {
  getter?: (instance: any) => any;
}): PropertyDecorator {
  return (target, propertyKey) => {
    setFieldMetadata(target, propertyKey as string, {
      getter: opts.getter,
    });
  };
}
