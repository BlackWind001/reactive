let isBeingAccessedInsideReaction = false;
let reactionCb = null;
let reactionsToRemove = [];

function makeObservable (original) {

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
            if (isBeingAccessedInsideReaction && reactionCb) {
                // Append the cb to an array.
                if (!Array.isArray(callbackRecords[property])) {
                    callbackRecords[property] = [];
                }
                callbackRecords[property].push(reactionCb);
            }
            return original[property];
        },
        set: function (target, property, value) {
            original[property] = value;

            Array.isArray(callbackRecords[property]) &&
            callbackRecords[property].forEach((cb, index) => {
                if (reactionsToRemove.includes(cb)) {
                    disposeCallback(cb);
                }
                else {
                    cb();
                }
            })
        }
    };

    // Return a proxy for the original object
    return new Proxy(original, handler);
}

function _removeReaction (cb) {
    reactionsToRemove.push(cb);
}

function reaction (initiator, cb) {
    // Any getters that are accessed inside the initiator
    // need to be recorded.
    // When any of these get values are set, we fire the
    // callback.

    isBeingAccessedInsideReaction = true;
    reactionCb = cb;
    initiator();
    isBeingAccessedInsideReaction = false;
    reactionCb = null;

    return () => { _removeReaction(cb); }

}

class Test {
    testProp = null;

    constructor () {
        return makeObservable(this);
    }
}

const test = new Test;
console.log(test.testProp);
test.testProp = 'hello';

let reactionDisposer = reaction(() => {
    return test.testProp
}, () => {
    console.log('testProp was changed to', test.testProp);
});

console.log('test.testProp has value', test.testProp);
test.testProp = 'world';
console.log('test.testProp has value', test.testProp);
reactionDisposer();
test.testProp = 'xoxo';
