const path = require('path');

module.exports = {
  plugins: {
    'postcss-cssnext': {
      features: {
        customProperties: {
          variables: {
            URL: process.env.ENVIRONMENT === 'PROD' ? '../assets' : '../assets'
          }
        }
      }
    }
  }
};
