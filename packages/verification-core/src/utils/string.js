export const removeNullBytes = (str) => {
    return str.replace(/\u0000/g, '')
}
