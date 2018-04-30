module.exports = {
  plugins: {
    'postcss-cssnext': {
      features: {
        customProperties: {
          variables: {
            URL: process.env.ENVIRONMENT === 'PROD' ? '[[[CDN_DOMAIN]]]' : '../assets'
          }
        }
      }
    }
  }
};
