module.exports = {
    webpack: (config) => {
        config.resolve.modules.push(__dirname)
        return config
    },
    output: 'export',
}