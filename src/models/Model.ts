import { AxiosPromise, AxiosResponse } from 'axios';

interface ModelAttributes<T> {
    get<K extends keyof T>(key: K): T[K];
    set(value: T): void;
    getAll(): T;
}

interface Sync<T> {
    fetch(id: number): AxiosPromise;
    save(data: T): AxiosPromise;
}

interface Events {
    // callback's type here is the same as Callback type alias
    // just not to export/import from different files the type
    // is hardcoded instead of reused
    on(eventName: string, callback: () => void): void;
    trigger(eventName: string): void;
}

interface HasId {
    id?: number;
}

export class Model<T extends HasId> {
    constructor(
        private attributes: ModelAttributes<T>,
        private events: Events,
        private sync: Sync<T>
    ) { }

    // could be changed to on = this.events.on;
    get on() {
        return this.events.on;
    }

    // could be changed to trigger = this.events.trigger;
    get trigger() {
        return this.events.trigger;
    }

    // could be changed to get = this.attributes.get;
    get get() {
        return this.attributes.get;
    }

    set(update: T): void {
        this.attributes.set(update);
        this.events.trigger('change');
    }

    fetch(): void {
        const id = this.get('id');

        if (typeof id !== 'number') {
            throw new Error('Cannot fetch without id');
        }

        this.sync.fetch(id).then((response: AxiosResponse): void => {
            this.set(response.data)
        })
    }

    save(): void {
        this.sync.save(this.attributes.getAll())
            .then((response: AxiosResponse) => {
                this.trigger('save');
            })
            .catch(() => {
                this.trigger('error');
            })
    }
}