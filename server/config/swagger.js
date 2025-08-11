// server/config/swagger.js

import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Teacher Recruitment API',
      version: '1.0.0',
      description: 'Multi-role recruitment platform for schools & candidates'
    },
    servers: [{
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local Dev'
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        CandidateRegister: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['candidate'] },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            fullName: { type: 'string' },
            contact: { type: 'string' },
            type: { type: 'string', enum: ['teaching','nonTeaching'] },
            position: { type: 'string' }
            // ... more per your model
          },
          required: ['role','email','password','fullName','contact','type','position']
        },
        // Add schemas for School, Requirement, Interview, etc as needed (NO notification fields anymore)
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
    './docs/*.yaml'
  ],
};

export default swaggerJSDoc(options);
