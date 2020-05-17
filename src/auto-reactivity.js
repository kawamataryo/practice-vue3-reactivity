// グローバルにリアクティブなオブジェクトを保存している
const targetMap = new WeakMap();

let activeEffect = null;

function effect(eff) {
  activeEffect = eff; // Set this as the activeEffect
  activeEffect(); // Run it
  activeEffect = null; // Unset it
}

// オブジェクトのキーごとの依存関数を記録
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

// オブジェクトのキーごとの依存関数を再実行
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

// reactive
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
      if (oldValue === value) { return }
      trigger(target, key);
    },
  };
  return new Proxy(target, handler);
}

const product = reactive({ price: 5, quantity: 2 });
let total = 0;

effect(() => {
  total = product.price * product.quantity;
});

console.log(total); // 10

product.price = 10;
console.log(total); // 20
