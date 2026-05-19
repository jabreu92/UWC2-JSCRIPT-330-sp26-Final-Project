import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import openApiSpec from './swagger/openapi';

const app = express();
app.use(express.json());

// Swagger UI — registered before the main router so it's always reachable
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(routes);

export default app;
