export const removeNullBytes = (str) => {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\u0000/g, '')
}
