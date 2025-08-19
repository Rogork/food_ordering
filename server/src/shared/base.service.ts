export interface IAttribute<T extends any> {
    name: string;
    required: { onInsert: boolean, onUpdate: boolean } | true;
    get?: () => T;
    set?: (val: any) => T;
}

export interface IBaseService {
    collection: string;
    attributes: IAttribute<any>[];
}

export class BaseService<T extends any> {
}