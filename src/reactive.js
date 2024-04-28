import store from './reactiveStore.js'

export function makeObservable (original) {

    const callbackRecords = {};

    function disposeCallback (cb) {
        Object.keys(callbackRecords).forEach((key) => {
            const value = callbackRecords[key];
            const index = Array.isArray(value) && value.indexOf(cb);

            if (index > -1) {
                callbackRecords[key].splice(index, 1);
            }
        })
    }

    // Take every property in the original object
    // and listen to it when it is being set/retreived.
    const handler = {
        get: function (target, property, receiver) {
            if (store.isBeingAccessedInsideReaction && store.reactionCb) {
                // Append the cb to an array.
                if (!Array.isArray(callbackRecords[property])) {
                    callbackRecords[property] = [];
                }
                callbackRecords[property].push(store.reactionCb);
            }
            return original[property];
        },
        set: function (target, property, value) {
            original[property] = value;

            Array.isArray(callbackRecords[property]) &&
            callbackRecords[property].forEach((cb, index) => {
                if (store.reactionsToRemove.includes(cb)) {
                    disposeCallback(cb);
                }
                else {
                    cb();
                }
            });

            return true;
        }
    };

    // Return a proxy for the original object
    return new Proxy(original, handler);
}

function _removeReaction (cb) {
    store.reactionsToRemove.push(cb);
}

export function reaction (initiator, cb) {
    // Any getters that are accessed inside the initiator
    // need to be recorded.
    // When any of these get values are set, we fire the
    // callback.

    store.isBeingAccessedInsideReaction = true;
    store.reactionCb = cb;
    initiator();
    store.isBeingAccessedInsideReaction = false;
    store.reactionCb = null;

    return () => { _removeReaction(cb); }

}


