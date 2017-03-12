import {WebStorageUtility} from '../utility/webstorage.utility';


export function LocalStorage(key?: string) {
    return WebStorage(localStorage, key);
}

export function SessionStorage(key?: string) {
    return WebStorage(sessionStorage, key);
}

// initialization cache
let cache = {};

export let WebStorage = (webStorage: Storage, key: string) => {
    return (target: Object, propertyName: string): void => {
        key = key || propertyName;
        let proxy = target[propertyName];

        Object.defineProperty(target, propertyName, {
            get: function() {
                return proxy;
            },
            set: function(value: any) {
                if (!cache[key]) { // first setter handle
                    proxy = WebStorageUtility.get(webStorage, key) || value;
                    cache[key] = true;
                } else { // if there is no value in localStorage, set it to initializer
                    proxy = value;
                    WebStorageUtility.set(webStorage, key, value);
                }

                // manual method for force save
                if (proxy instanceof Object) {
                    proxy.save = function () {
                        WebStorageUtility.set(webStorage, key, proxy);
                    };
                }

                // handle methods changing value of array
                if (Array.isArray(proxy)) {
                    proxy.push = function(value) {
                        let result = Array.prototype.push.apply(proxy, arguments);
                        WebStorageUtility.set(webStorage, key, proxy);
                        return result;
                    };
                    proxy.pop = function() {
                        let result = Array.prototype.pop.apply(proxy, arguments);
                        WebStorageUtility.set(webStorage, key, proxy);
                        return result;
                    };
                    proxy.shift = function() {
                        let result = Array.prototype.shift.apply(proxy, arguments);
                        WebStorageUtility.set(webStorage, key, proxy);
                        return result;
                    };
                }
            },
        });
    }
};
