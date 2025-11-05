export const removeNullBytes = (str) => {
    // oxlint-disable-next-line no-control-regex
    return str.replace(/\u0000/g, '')
}
