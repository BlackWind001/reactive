import { makeObservable, reaction } from "./reactive.js";

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