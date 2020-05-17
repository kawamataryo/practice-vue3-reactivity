"use strict";

let activeEffect = null;

function effect(eff) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

const targetMap = new WeakMap();

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
    // 関数を再実行
    effect();
  });
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(...arguments);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      Reflect.set(...arguments);
      if (oldValue === value) {
        return;
      }
      trigger(target, key);
    },
  };
  return new Proxy(target, handler);
}

function ref(value) {
  return reactive({ value });
}
