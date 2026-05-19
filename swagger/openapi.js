const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Private Jet Business API',
    version: '1.0.0',
    description:
      'RESTful backend API for buying and selling private jets. Manages jet inventory, manufacturers, customer orders, and user accounts.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Jets', description: 'Jet inventory operations' },
  ],
  paths: {
    '/jet': {
      get: {
        tags: ['Jets'],
        summary: 'Retrieve jet listings',
        description:
          'Access level: Regular user (valid JWT required). ' +
          'Returns the jet catalog for the authenticated user. ' +
          'Admin users receive all jets (including unavailable ones), sorted by most recently added. ' +
          'Regular users receive only available jets, sorted by price ascending. ' +
          'No request body is needed — pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Jet catalog returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: {
                      type: 'integer',
                      description: 'Total number of jets returned.',
                      example: 2,
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Jet' },
                    },
                  },
                },
                examples: {
                  regularUser: {
                    summary: 'Regular user — available jets sorted by price',
                    value: {
                      count: 2,
                      data: [
                        {
                          _id: '664a1f2e8b3c2a001f4e1001',
                          sku: 'CS-LR-C300-24',
                          name: 'Cessna Citation CJ3+',
                          year: 2024,
                          price: 8500000,
                          isAvailable: true,
                          manufacturer: {
                            _id: '664a1f2e8b3c2a001f4e0001',
                            name: 'Cessna',
                          },
                          createdAt: '2026-01-10T14:22:00.000Z',
                          updatedAt: '2026-01-10T14:22:00.000Z',
                        },
                        {
                          _id: '664a1f2e8b3c2a001f4e1002',
                          sku: 'GS-LR-G700-26',
                          name: 'Gulfstream G700',
                          year: 2026,
                          price: 75000000,
                          isAvailable: true,
                          manufacturer: {
                            _id: '664a1f2e8b3c2a001f4e0002',
                            name: 'Gulfstream',
                          },
                          createdAt: '2026-02-15T09:00:00.000Z',
                          updatedAt: '2026-02-15T09:00:00.000Z',
                        },
                      ],
                    },
                  },
                  adminUser: {
                    summary: 'Admin — all jets (including unavailable) sorted by createdAt desc',
                    value: {
                      count: 3,
                      data: [
                        {
                          _id: '664a1f2e8b3c2a001f4e1003',
                          sku: 'BD-LR-7500-25',
                          name: 'Bombardier Global 7500',
                          year: 2025,
                          price: 72000000,
                          isAvailable: false,
                          manufacturer: {
                            _id: '664a1f2e8b3c2a001f4e0003',
                            name: 'Bombardier',
                          },
                          createdAt: '2026-05-01T08:00:00.000Z',
                          updatedAt: '2026-05-01T08:00:00.000Z',
                        },
                        {
                          _id: '664a1f2e8b3c2a001f4e1002',
                          sku: 'GS-LR-G700-26',
                          name: 'Gulfstream G700',
                          year: 2026,
                          price: 75000000,
                          isAvailable: true,
                          manufacturer: {
                            _id: '664a1f2e8b3c2a001f4e0002',
                            name: 'Gulfstream',
                          },
                          createdAt: '2026-02-15T09:00:00.000Z',
                          updatedAt: '2026-02-15T09:00:00.000Z',
                        },
                        {
                          _id: '664a1f2e8b3c2a001f4e1001',
                          sku: 'CS-LR-C300-24',
                          name: 'Cessna Citation CJ3+',
                          year: 2024,
                          price: 8500000,
                          isAvailable: true,
                          manufacturer: {
                            _id: '664a1f2e8b3c2a001f4e0001',
                            name: 'Cessna',
                          },
                          createdAt: '2026-01-10T14:22:00.000Z',
                          updatedAt: '2026-01-10T14:22:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid JWT.',
            content: {
              'application/json': {
                example: { message: 'Not authorized, token failed' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: {
                  message: 'Error retrieving catalog',
                  error: 'Unexpected database error',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Jet: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId.',
            example: '664a1f2e8b3c2a001f4e1002',
          },
          sku: {
            type: 'string',
            description: 'Unique uppercase tail number / SKU.',
            example: 'GS-LR-G700-26',
          },
          name: {
            type: 'string',
            description: 'Human-readable jet model name.',
            example: 'Gulfstream G700',
          },
          year: {
            type: 'integer',
            description: 'Manufacturing year.',
            example: 2026,
          },
          price: {
            type: 'number',
            description: 'Listing price in USD.',
            example: 75000000,
          },
          isAvailable: {
            type: 'boolean',
            description: 'Whether the jet is available for purchase.',
            example: true,
          },
          manufacturer: {
            type: 'object',
            description: 'Populated manufacturer reference (name only).',
            properties: {
              _id: { type: 'string', example: '664a1f2e8b3c2a001f4e0002' },
              name: { type: 'string', example: 'Gulfstream' },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-02-15T09:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-02-15T09:00:00.000Z',
          },
        },
      },
    },
  },
};

export default openApiSpec;
