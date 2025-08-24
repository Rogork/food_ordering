// database.service.ts
import { Injectable } from '@nestjs/common';
import Datastore from 'nedb';
import path from 'node:path';
import fs from 'node:fs/promises';
import 'reflect-metadata';
import {
  MODEL_METADATA,
  FIELD_METADATA,
  EOperation,
  ModelCtor,
  applyDefaults,
  FieldMetadata,
} from './meta.utils';
import _ from 'lodash';

export enum EUpdateOperators {
  Set = '$set',
  Unset = '$unset',
  Push = '$push',
  Pop = '$pop',
  Pull = '$pull',
  AddToSet = '$addToSet',
  Each = '$each',
  Slice = '$slice',
}

export type IUpdateOperation<T> = {
  [op in EUpdateOperators]?: Partial<T>|any;
}

type ModelInstance<T> = T & { validate(op: EOperation): true | string[] };

@Injectable()
export class Database {
  private datastores: Record<string, Datastore<any>> = Object.create(null);

  /** Ensure the db directory exists */
  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  /** Resolve the model table (throws if missing) */
  private getTableName(ctor: Function): string {
    const modelMeta = Reflect.getMetadata(MODEL_METADATA, ctor);
    const table = modelMeta?.table as string | undefined;
    if (!table) {
      const name = (ctor as any)?.name ?? '<anonymous>';
      throw new Error(`Missing table name from type: ${name}`);
    }
    return table;
  }

  /** Load (or reuse) the datastore for a given model constructor */
  private async loadByCtor(ctor: Function): Promise<Datastore<any>> {
    const table = this.getTableName(ctor);
    if (this.datastores[table]) return this.datastores[table];

    const dir = path.join(process.cwd(), 'private', 'db');
    await this.ensureDir(dir);

    const filename = path.join(dir, `${table}.coll`);
    const datastore = new Datastore<any>({ filename, autoload: false });

    await new Promise<void>((resolve, reject) => {
      datastore.loadDatabase((err) => (err ? reject(err) : resolve()));
    });

    this.datastores[table] = datastore;
    return datastore;
  }

  /** Read field metadata defined for a model (prototype-level) */
  private getFieldsForCtor(ctor: Function): Record<string, FieldMetadata> {
    return Reflect.getMetadata(FIELD_METADATA, (ctor as any).prototype) || {};
  }

  /** Build a plain object doc from a model instance (includes accessor-backed fields) */
  private toDocument<T>(entity: ModelInstance<T>): Record<string, any> {
    const ctor = (entity as any).constructor as Function;
    const fields = this.getFieldsForCtor(ctor);

    const doc: Record<string, any> = {};

    // populate doc based on fields meta property value
    _.each(fields, (meta, key) => {
      const property = meta.property;
      if (!property || property.length === 0) return true;
      const val = (entity as any)[key];
      if (val !== undefined) doc[property] = val;
    });
    return doc;
  }

  /** Re-hydrate a plain doc into a model instance (so accessors & methods work) */
  private hydrate<T>(ctor: ModelCtor<T>, doc: any): T {
    return new ctor(doc);
  }

  /** Insert a single model instance */
  public async insert<T>(entity: ModelInstance<T>): Promise<T> {
    // set defaults for insert operation
    applyDefaults(entity, EOperation.INSERT);
    // validate instance using your instance method (insert phase)
    const v = entity.validate(EOperation.INSERT);
    if (v !== true) {
      // You can wrap in BadRequestException if you prefer Nest exception filters
      throw new Error(`Validation failed: ${v.join(', ')}`);
    }

    const ctor = (entity as any).constructor as ModelCtor<T>;
    const datastore = await this.loadByCtor(ctor);

    const toInsert = this.toDocument(entity);

    const inserted = await new Promise<any>((resolve, reject) => {
      datastore.insert(toInsert, (err: Error | null, doc: any) =>
        err ? reject(err) : resolve(doc),
      );
    });

    // Re-hydrate into a proper model instance so accessors/validate remain available
    return this.hydrate<T>(ctor, inserted);
    // If you prefer mutating the passed-in instance with returned _id, you could:
    // Object.assign(entity as any, inserted);
    // return entity as T;
  }

  /** Insert multiple model instances (must be same model type) */
  public async insertMany<T>(entities: Array<ModelInstance<T>>): Promise<T[]> {
    if (!entities?.length) return [];

    // Validate all first
    for (const e of entities) {
      const v = e.validate(EOperation.INSERT);
      if (v !== true) {
        throw new Error(`Validation failed: ${JSON.stringify(v)}`);
      }
    }

    const ctor = (entities[0] as any).constructor as ModelCtor<T>;
    const datastore = await this.loadByCtor(ctor);

    const bulk = entities.map((e) => this.toDocument(e));

    const inserted = await new Promise<any[]>((resolve, reject) => {
      datastore.insert(bulk, (err: Error | null, docs: any[]) =>
        err ? reject(err) : resolve(docs),
      );
    });

    return inserted.map((doc) => this.hydrate<T>(ctor, doc));
  }

  /** Convenience: find many (returns hydrated instances) */
  public async find<T>(
    ctor: ModelCtor<T>,
    query: Record<string, any>,
  ): Promise<T[]> {
    const datastore = await this.loadByCtor(ctor);
    const docs = await new Promise<any[]>((resolve, reject) => {
      (datastore as any).find(query, (err: Error | null, res: any[]) =>
        err ? reject(err) : resolve(res),
      );
    });
    return docs.map((doc) => this.hydrate<T>(ctor, doc));
  }

  /** Convenience: count */
  public async count<T>(
    ctor: ModelCtor<T>,
    query: Record<string, any>,
  ): Promise<number> {
    const datastore = await this.loadByCtor(ctor);
    return new Promise<number>((resolve, reject) => {
      datastore.count(query, (err: Error | null, res: number) =>
        err ? reject(err) : resolve(res),
      );
    });
  }

  /** Convenience: find one (returns hydrated instance or null) */
  public async findOne<T>(
    ctor: ModelCtor<T>,
    query: Record<string, any>,
  ): Promise<T | null> {
    const datastore = await this.loadByCtor(ctor);
    const doc = await new Promise<any | null>((resolve, reject) => {
      datastore.findOne(query, (err: Error | null, res: any) =>
        err ? reject(err) : resolve(res ?? null),
      );
    });
    return doc ? this.hydrate<T>(ctor, doc) : null;
  }

  /** Convenience: update (multi = false by default). Returns number updated. */
  public async update<T>(
    ctor: ModelCtor<T>,
    query: Record<string, any>,
    update: IUpdateOperation<T>,
    options: { multi?: boolean; upsert?: boolean } = {},
  ): Promise<number> {
    const datastore = await this.loadByCtor(ctor);
    const num = await new Promise<number>((resolve, reject) => {
      datastore.update(
        query,
        update,
        options,
        (err: Error | null, n: number) => (err ? reject(err) : resolve(n)),
      );
    });
    return num;
  }

  /** Convenience: remove (multi = false by default). Returns number removed. */
  public async remove<T>(
    ctor: ModelCtor<T>,
    query: Record<string, any>,
    options: { multi?: boolean } = {},
  ): Promise<number> {
    const datastore = await this.loadByCtor(ctor);
    const num = await new Promise<number>((resolve, reject) => {
      datastore.remove(query, options, (err: Error | null, n: number) =>
        err ? reject(err) : resolve(n),
      );
    });
    return num;
  }
}
