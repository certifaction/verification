function throttle(func, rate) {
    let lastTime = new Date()
    func = func || function() {}
    rate = rate || 1000
    // the inner method
    return function() {
        const now = new Date()
        if (now - lastTime >= rate) {
            func()
            lastTime = now
        }
    }
}

function inserted(el, binding) {
    const callback = binding.value
    if (binding.modifiers.immediate) {
        callback()
    }
    const throttledScroll = throttle(callback, 300)
    el.addEventListener('scroll', throttledScroll, true)
}

export default {
    inserted
}
