const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cardly BACKSHOT API',
      version: '1.0.0',
      description: 'API documentation for the Cardly BACKSHOT app',
    },
    servers: [
      {
        url: 'http://localhost:3000', // adjust if you're using a different port
      },
    ],
  },
  apis: ['./routes/*.js'], // path to your route files
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
