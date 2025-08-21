import { ModelCtor } from 'src/shared/meta.utils';
import { Database } from './database.service';
import { Inject } from '@nestjs/common';

export abstract class BaseService<T> {

  @Inject(Database)
  protected readonly db!: Database; // `!` because DI assigns it post-construction

  protected abstract get Model(): ModelCtor<T>;

  protected async create(init: Partial<T>) {
    const instance = new this.Model(init);
    return this.db.insert(instance);
  }

  protected async insertMany(inits: Partial<T>[]) {
    const instances = inits.map(i => new this.Model(i));
    return this.db.insertMany(instances);
  }

  protected async findOne(query: Partial<T>|any) {
    return this.db.findOne(this.Model, query);
  }

  protected async find(query: Partial<T>|any) {
    return this.db.find(this.Model, query);
  }

  protected async update(query: Partial<T>|any, update: Partial<T>|any, opts: { multi?: boolean; upsert?: boolean } = { upsert: false }) {
    return this.db.update(this.Model, query, update, opts);
  }

  protected async remove(query: Partial<T>|any, opts?: { multi?: boolean }) {
    return this.db.remove(this.Model, query, opts);
  }

  protected async count(query: Partial<T>|any) {
    return this.db.count(this.Model, query);
  }
}
