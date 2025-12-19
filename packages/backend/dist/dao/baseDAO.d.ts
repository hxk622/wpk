export interface BaseDAO<T, K> {
    create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
    getById(id: K): Promise<T | null>;
    update(id: K, entity: Partial<T>): Promise<T | null>;
    delete(id: K): Promise<boolean>;
    getAll(): Promise<T[]>;
}
