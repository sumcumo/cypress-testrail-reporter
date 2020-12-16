export default (msg: string, ...args: any): void => {
  // eslint-disable-next-line no-console
  console.warn(msg, args)
}
