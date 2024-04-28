class ReactiveStore {
    isBeingAccessedInsideFunction = false;
    reactionCb = null;
    reactionsToRemove = [];
}

export default new ReactiveStore();
