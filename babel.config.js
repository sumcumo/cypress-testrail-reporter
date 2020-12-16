module.exports = (api) => {
  api.cache.invalidate(() => process.env.NODE_ENV)

  const plugins = [
    ['@babel/plugin-transform-runtime'],
  ]

  if (api.env('test')) {
    plugins.push(['dynamic-import-node'])
  }

  const presets = [
    ['@babel/preset-env', { loose: true }],
    '@babel/preset-typescript',
  ]

  return {
    plugins,
    presets,
  }
}
