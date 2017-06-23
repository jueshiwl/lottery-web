{
    let obj = {
        time: '2017-03-11',
        name: 'net',
        _r: 123
    }

    let monitor = new Proxy(obj, {
        // 拦截对象属性的读取
        get (target, key) {
            return target[key].replace('2017', '2018')
        },
        // 拦截对象设置属性
        set (target, key, value) {
            if (key === 'name') {
                return target[key] = value
            } else {
                return target[key]
            }
        },
        // 拦截 key in object 操作
        has (target, key) {
            if (key === 'name') {
                return target[key]
            } else {
                return false
            }
        },
        // 拦截delete
        deleteProperty (target, key) {
            if (key.indexOf('_') > -1) {
                delete target[key];
                return true
            } else {
                return target[key]
            }
        },
        // 拦截Object.keys, Object.getOwnPropertySymbols, Object.getOwnPropertyNames
        ownKeys (target) {
            return Object.keys(target).filter(item => item != 'time')
        }
    })

    console.log('get', monitor.time)

    monitor.time = '2018'
    monitor.name = 'hehe'
    console.log('set', monitor)

    console.log('has', 'name' in monitor)
    console.log('has', 'time' in monitor)

    delete monitor.time
    console.log('delete', monitor)

    delete monitor._r
    console.log('delete', monitor)
}

{
    // 最好改变原来的操作习惯，使用Reflect
    let obj = {
        time: '2017-03-11',
        name: 'net',
        _r: 123
    }

    console.log(Reflect.get(obj, 'time'))

    Reflect.set(obj, 'time', '2018')
    console.log(obj)

    console.log(Reflect.has(obj, 'name'))

}

{
    // 使用场景
    function validator (target, validator) {
        return new Proxy(target, {
            _validator: validator,
            set (target, key, value, proxy) {
                if (target.hasOwnProperty(key)) {
                    let va = this._validator[key]
                    if (!!va(value)) {
                        return Reflect.set(target, key, value, proxy)
                    } else {
                        throw Error(`不能设置${key}到${value}`)
                    }
                } else {
                    throw Error(`${key} 不存在`)
                }
            }
        })
    }

    const personValidators = {
        name (val) {
            return typeof val === 'string'
        },
        age (val) {
            return typeof val === 'number' && val>18
        }
    }

    class Person {
        constructor (name, age) {
            this.name = name
            this.age = age
            return validator(this, personValidators)
        }
    }

    const person = new Person('lilei', 30)

    console.info(person)

    person.name = 48
}