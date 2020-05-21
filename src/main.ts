type Effect = () => void
type ActiveEffect = Effect | null;
type TargetMap = WeakMap<Object, Map<any, Set<Effect>>>

let activeEffect: ActiveEffect = null;

function effect(eff: () => void) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

const targetMap: TargetMap = new WeakMap();

// track to deps functions
function track<T extends Object>(target: T, key: keyof T) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map<keyof T, Set<Effect>>();
      targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
      dep = new Set<Effect>();
      depsMap.set(key, dep);
    }
    dep.add(activeEffect);
  }
}

// re execute the deps function
function trigger<T extends Object>(target: T, key: keyof T) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  if (!dep) {
    return;
  }
  dep.forEach((effect: Effect) => {
    effect();
  });
}

// create reactive object
function reactive<T extends Object>(target: T) {
  const handler: ProxyHandler<T> = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key as keyof T);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key as keyof T];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key as keyof T);
      }
      return result;
    },
  };
  return new Proxy(target, handler);
}

// create reactive object from primitive
function ref(value: string | number | any[]) {
  return reactive({ value });
}
