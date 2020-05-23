"use strict";
let activeEffect = null;
function effect(eff) {
    activeEffect = eff;
    activeEffect();
    activeEffect = null;
}
const targetMap = new WeakMap();
// track to deps functions
function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }
        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Set();
            depsMap.set(key, dep);
        }
        dep.add(activeEffect);
    }
}
// re execute the deps function
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    const dep = depsMap.get(key);
    if (!dep) {
        return;
    }
    dep.forEach((effect) => {
        effect();
    });
}
// create reactive object
function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue !== value) {
                trigger(target, key);
            }
            return result;
        },
    };
    return new Proxy(target, handler);
}
// create reactive object from primitive
function ref(raw) {
    const r = {
        get value() {
            track(r, 'value');
            return raw;
        },
        set value(newVal) {
            raw = newVal;
            trigger(r, 'value');
        }
    };
    return r;
}
