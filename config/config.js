const env = process.env.NODE_ENV || 'dev';

if (env === 'dev' || env === 'test') {
    const config = require(`./${env}`);

    Object.keys(config).forEach((key) => {
        process.env[key] = config[key];
    })
};
