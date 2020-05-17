const targetMap = new WeakMap()

function track(target, key) {
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(effect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if(!depsMap) { return }

  const dep = depsMap.get(key)
  if(!dep) { return }
  dep.forEach(effect => {
    // 関数を再実行
    effect()
  });
}

const product = { price: 5, quantity: 2 }
let total = 0

const effect = () => { total = product.price * product.quantity }

track(product, 'price')
effect()
console.log(total) // 10

product.price = 10
trigger(product, 'price')
console.log(total) // 20