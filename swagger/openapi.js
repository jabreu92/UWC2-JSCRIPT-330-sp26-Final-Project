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
    { name: 'Manufacturers', description: 'Manufacturer record operations' },
    { name: 'Orders', description: 'Purchase order operations' },
    { name: 'Users', description: 'User account operations' },
    { name: 'Auth', description: 'Authentication operations' },
  ],
  paths: {
    '/jet/search': {
      get: {
        tags: ['Jets'],
        summary: 'Search jets by keyword',
        description:
          'Access level: Public (no authentication required). ' +
          'Performs a text search across jet fields using the required `q` query parameter. ' +
          'Returns matching jets regardless of availability. ' +
          'No Authorization header is needed.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search keyword to match against jet name, SKU, or other text fields.',
            schema: { type: 'string', example: 'Gulfstream' },
          },
        ],
        responses: {
          200: {
            description: 'Search results returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Jet' },
                    },
                  },
                },
                example: {
                  data: [
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
            },
          },
          400: {
            description: 'Bad request — missing `q` query parameter.',
            content: {
              'application/json': {
                example: { message: 'Search query required' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
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
      post: {
        tags: ['Jets'],
        summary: 'Create a new jet listing',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Creates a new jet in the catalog. ' +
          'The `sku` and `manufacturerCode` fields are required; `manufacturerCode` must match an existing manufacturer `code`. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sku', 'manufacturerCode'],
                properties: {
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
                  range: {
                    type: 'number',
                    description: 'Range in nautical miles.',
                    example: 7500,
                  },
                  capacity: {
                    type: 'integer',
                    description: 'Maximum passenger capacity.',
                    example: 19,
                  },
                  manufacturerCode: {
                    type: 'string',
                    description: 'Unique uppercase code of an existing manufacturer.',
                    example: 'GUL',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Jet created successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'Jet created successfully',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e1002',
                    sku: 'GS-LR-G700-26',
                    name: 'Gulfstream G700',
                    year: 2026,
                    price: 75000000,
                    isAvailable: true,
                    manufacturer: '664a1f2e8b3c2a001f4e0002',
                    createdAt: '2026-02-15T09:00:00.000Z',
                    updatedAt: '2026-02-15T09:00:00.000Z',
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request — missing required fields.',
            content: {
              'application/json': {
                example: { message: 'SKU and Manufacturer Code are required.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Manufacturer not found.',
            content: {
              'application/json': {
                example: { message: "Manufacturer with code 'GUL' not found." },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/jet/{sku}': {
      get: {
        tags: ['Jets'],
        summary: 'Get a jet by SKU',
        description:
          'Access level: Public (no authentication required). ' +
          'Returns a single jet record identified by its unique uppercase `sku` path parameter. ' +
          'No Authorization header is needed.',
        parameters: [
          {
            name: 'sku',
            in: 'path',
            required: true,
            description: 'Unique uppercase tail number / SKU of the jet (e.g., GS-LR-G700-26).',
            schema: { type: 'string', example: 'GS-LR-G700-26' },
          },
        ],
        responses: {
          200: {
            description: 'Jet returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Jet' },
                  },
                },
                example: {
                  data: {
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
                },
              },
            },
          },
          400: {
            description: 'Bad request — SKU parameter missing.',
            content: {
              'application/json': {
                example: { message: 'SKU is required.' },
              },
            },
          },
          404: {
            description: 'Jet not found.',
            content: {
              'application/json': {
                example: { message: 'Jet GS-LR-G700-26 not found.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Error retrieving jet', error: 'Unexpected database error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Jets'],
        summary: 'Update a jet by SKU',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Partially updates a jet record identified by its `sku` path parameter. ' +
          'Any subset of jet fields may be provided in the request body; `price` must be a positive number if included. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sku',
            in: 'path',
            required: true,
            description: 'Unique uppercase tail number / SKU of the jet to update.',
            schema: { type: 'string', example: 'GS-LR-G700-26' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Gulfstream G700 Updated' },
                  year: { type: 'integer', example: 2026 },
                  price: { type: 'number', example: 78000000 },
                  range: { type: 'number', example: 7700 },
                  capacity: { type: 'integer', example: 19 },
                  isAvailable: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Jet updated successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'Jet updated successfully',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e1002',
                    sku: 'GS-LR-G700-26',
                    name: 'Gulfstream G700 Updated',
                    year: 2026,
                    price: 78000000,
                    isAvailable: true,
                    manufacturer: '664a1f2e8b3c2a001f4e0002',
                    createdAt: '2026-02-15T09:00:00.000Z',
                    updatedAt: '2026-05-27T12:00:00.000Z',
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request — invalid field value (e.g., non-positive price).',
            content: {
              'application/json': {
                example: { message: 'Price must be a positive number.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Jet not found.',
            content: {
              'application/json': {
                example: { message: 'Jet GS-LR-G700-26 not found.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Update failed', error: 'Unexpected database error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Jets'],
        summary: 'Delete a jet by SKU',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Permanently removes a jet record identified by its `sku` path parameter from the catalog. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sku',
            in: 'path',
            required: true,
            description: 'Unique uppercase tail number / SKU of the jet to delete.',
            schema: { type: 'string', example: 'GS-LR-G700-26' },
          },
        ],
        responses: {
          200: {
            description: 'Jet deleted successfully.',
            content: {
              'application/json': {
                example: { message: 'Jet GS-LR-G700-26 deleted successfully.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Jet not found.',
            content: {
              'application/json': {
                example: { message: 'Jet GS-LR-G700-26 not found.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Delete failed', error: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/manufacturer': {
      get: {
        tags: ['Manufacturers'],
        summary: 'List all manufacturers',
        description:
          'Access level: Public (no authentication required). ' +
          'Returns a list of all manufacturer records in the catalog. ' +
          'No request body or Authorization header is needed.',

        responses: {
          200: {
            description: 'Manufacturers returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: {
                      type: 'integer',
                      description: 'Total number of manufacturers returned.',
                      example: 3,
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Manufacturer' },
                    },
                  },
                },
                example: {
                  count: 3,
                  data: [
                    {
                      _id: '664a1f2e8b3c2a001f4e0001',
                      code: 'GUL',
                      name: 'Gulfstream',
                      country: 'USA',
                      foundedYear: 1958,
                    },
                    {
                      _id: '664a1f2e8b3c2a001f4e0002',
                      code: 'BOM',
                      name: 'Bombardier',
                      country: 'Canada',
                      foundedYear: 1942,
                    },
                    {
                      _id: '664a1f2e8b3c2a001f4e0003',
                      code: 'EMB',
                      name: 'Embraer',
                      country: 'Brazil',
                      foundedYear: 1969,
                    },
                  ],
                },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: {
                  message: 'Error retrieving manufacturers',
                  error: 'Unexpected database error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Manufacturers'],
        summary: 'Create a new manufacturer',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Creates a new manufacturer record. ' +
          'The `code` and `name` fields are required; `code` must be unique across all manufacturers. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: {
                    type: 'string',
                    description: 'Unique uppercase short code identifying the manufacturer.',
                    example: 'GUL',
                  },
                  name: {
                    type: 'string',
                    description: 'Full manufacturer name.',
                    example: 'Gulfstream',
                  },
                  country: {
                    type: 'string',
                    description: 'Country where the manufacturer is headquartered.',
                    example: 'USA',
                  },
                  foundedYear: {
                    type: 'integer',
                    description: 'Year the manufacturer was founded.',
                    example: 1958,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Manufacturer created successfully.',
            content: {
              'application/json': {
                example: {
                  _id: '664a1f2e8b3c2a001f4e0001',
                  code: 'GUL',
                  name: 'Gulfstream',
                  country: 'USA',
                  foundedYear: 1958,
                },
              },
            },
          },
          400: {
            description: 'Bad request — missing required fields.',
            content: {
              'application/json': {
                example: { message: 'Code and Name are required.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          409: {
            description: 'Conflict — a manufacturer with that code already exists.',
            content: {
              'application/json': {
                example: { message: 'Manufacturer with code GUL already exists.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Internal Server Error', error: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/manufacturer/{code}': {
      get: {        tags: ['Manufacturers'],
        summary: 'Get a manufacturer by code',
        description:
          'Access level: Public (no authentication required). ' +
          'Returns a single manufacturer record identified by its unique uppercase `code` path parameter (e.g., `BOM`). ' +
          'No Authorization header is needed.',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Unique uppercase short code of the manufacturer (e.g., GUL, BOM, EMB).',
            schema: { type: 'string', example: 'GUL' },
          },
        ],
        responses: {
          200: {
            description: 'Manufacturer returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Manufacturer' },
                  },
                },
                example: {
                  data: {
                    _id: '664a1f2e8b3c2a001f4e0001',
                    code: 'GUL',
                    name: 'Gulfstream',
                    country: 'USA',
                    foundedYear: 1958,
                  },
                },
              },
            },
          },
          404: {
            description: 'Manufacturer not found.',
            content: {
              'application/json': {
                example: { message: 'Manufacturer not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Manufacturers'],
        summary: 'Replace a manufacturer by code',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Fully replaces a manufacturer record identified by its `code` path parameter. ' +
          'Provide all fields you want to persist in the request body. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Unique uppercase short code of the manufacturer to update.',
            schema: { type: 'string', example: 'GUL' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Gulfstream Aerospace' },
                  country: { type: 'string', example: 'USA' },
                  foundedYear: { type: 'integer', example: 1958 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Manufacturer updated successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'Updated successfully',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e0001',
                    code: 'GUL',
                    name: 'Gulfstream Aerospace',
                    country: 'USA',
                    foundedYear: 1958,
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Manufacturer not found.',
            content: {
              'application/json': {
                example: { message: 'Manufacturer not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Manufacturers'],
        summary: 'Delete a manufacturer by code',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Permanently removes a manufacturer record identified by its `code` path parameter. ' +
          'Deletion is blocked if any jets are currently linked to this manufacturer — the response will include the count of linked jets. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Unique uppercase short code of the manufacturer to delete.',
            schema: { type: 'string', example: 'GUL' },
          },
        ],
        responses: {
          200: {
            description: 'Manufacturer deleted successfully.',
            content: {
              'application/json': {
                example: { message: 'Manufacturer GUL deleted.' },
              },
            },
          },
          400: {
            description: 'Deletion blocked — jets are linked to this manufacturer.',
            content: {
              'application/json': {
                example: { message: 'Cannot delete. There are 3 jets linked to this code.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Manufacturer not found.',
            content: {
              'application/json': {
                example: { message: 'Manufacturer not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/order': {
      post: {
        tags: ['Orders'],
        summary: 'Create a new purchase order',
        description:
          'Access level: Regular user (valid JWT required). ' +
          'Creates a purchase order for the jet identified by the `sku` field in the request body. ' +
          'The jet is marked unavailable upon order creation. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sku'],
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Unique uppercase SKU of the jet to purchase.',
                    example: 'GS-LR-G700-26',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Purchase order created successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'Purchase order created successfully',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e2001',
                    orderNumber: 'ORD-1778282206062-B750',
                    user: '664a1f2e8b3c2a001f4e3001',
                    jet: '664a1f2e8b3c2a001f4e1002',
                    finalSalePrice: 75000000,
                    status: 'pending',
                    createdAt: '2026-05-27T10:00:00.000Z',
                    updatedAt: '2026-05-27T10:00:00.000Z',
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request — missing SKU or jet unavailable.',
            content: {
              'application/json': {
                example: { message: 'SKU is required to make a purchase.' },
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
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        description:
          'Access level: Regular user (valid JWT required). ' +
          'Returns order history for the authenticated user. ' +
          'Admin users receive all orders across all users; regular users receive only their own orders. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Orders returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: {
                      type: 'integer',
                      description: 'Total number of orders returned.',
                      example: 2,
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                },
                examples: {
                  regularUser: {
                    summary: 'Regular user — own orders only',
                    value: {
                      count: 1,
                      data: [
                        {
                          _id: '664a1f2e8b3c2a001f4e2001',
                          orderNumber: 'ORD-1778282206062-B750',
                          user: { _id: '664a1f2e8b3c2a001f4e3001', email: 'buyer@example.com' },
                          jet: { _id: '664a1f2e8b3c2a001f4e1002', sku: 'GS-LR-G700-26', name: 'Gulfstream G700' },
                          finalSalePrice: 75000000,
                          status: 'pending',
                          createdAt: '2026-05-27T10:00:00.000Z',
                          updatedAt: '2026-05-27T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                  adminUser: {
                    summary: 'Admin — all orders',
                    value: {
                      count: 2,
                      data: [
                        {
                          _id: '664a1f2e8b3c2a001f4e2001',
                          orderNumber: 'ORD-1778282206062-B750',
                          user: { _id: '664a1f2e8b3c2a001f4e3001', email: 'buyer@example.com' },
                          jet: { _id: '664a1f2e8b3c2a001f4e1002', sku: 'GS-LR-G700-26', name: 'Gulfstream G700' },
                          finalSalePrice: 75000000,
                          status: 'pending',
                          createdAt: '2026-05-27T10:00:00.000Z',
                          updatedAt: '2026-05-27T10:00:00.000Z',
                        },
                        {
                          _id: '664a1f2e8b3c2a001f4e2002',
                          orderNumber: 'ORD-1778282206063-C100',
                          user: { _id: '664a1f2e8b3c2a001f4e3002', email: 'other@example.com' },
                          jet: { _id: '664a1f2e8b3c2a001f4e1001', sku: 'CS-LR-C300-24', name: 'Cessna Citation CJ3+' },
                          finalSalePrice: 8500000,
                          status: 'completed',
                          createdAt: '2026-05-20T08:00:00.000Z',
                          updatedAt: '2026-05-21T09:00:00.000Z',
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
                example: { message: 'Error fetching order history', error: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/order/{orderNumber}': {
      get: {
        tags: ['Orders'],
        summary: 'Get an order by order number',
        description:
          'Access level: Regular user (valid JWT required). ' +
          'Returns a single order identified by its `orderNumber` path parameter. ' +
          'Regular users may only retrieve their own orders — a 403 is returned if the order belongs to another user. ' +
          'Admin users may retrieve any order. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderNumber',
            in: 'path',
            required: true,
            description: 'Unique order identifier (e.g., ORD-1778282206062-B750).',
            schema: { type: 'string', example: 'ORD-1778282206062-B750' },
          },
        ],
        responses: {
          200: {
            description: 'Order returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
                example: {
                  data: {
                    _id: '664a1f2e8b3c2a001f4e2001',
                    orderNumber: 'ORD-1778282206062-B750',
                    user: { _id: '664a1f2e8b3c2a001f4e3001', email: 'buyer@example.com' },
                    jet: { _id: '664a1f2e8b3c2a001f4e1002', sku: 'GS-LR-G700-26', name: 'Gulfstream G700' },
                    finalSalePrice: 75000000,
                    status: 'pending',
                    createdAt: '2026-05-27T10:00:00.000Z',
                    updatedAt: '2026-05-27T10:00:00.000Z',
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
          403: {
            description: 'Forbidden — regular user attempting to view another user\'s order.',
            content: {
              'application/json': {
                example: { message: 'Access denied. You can only view your own orders.' },
              },
            },
          },
          404: {
            description: 'Order not found.',
            content: {
              'application/json': {
                example: { message: 'Order not found.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Updates the `status` field of an order identified by its `orderNumber` path parameter. ' +
          'Accepted status values are `pending`, `completed`, and `cancelled`. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderNumber',
            in: 'path',
            required: true,
            description: 'Unique order identifier.',
            schema: { type: 'string', example: 'ORD-1778282206062-B750' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'completed', 'cancelled'],
                    description: 'New status for the order.',
                    example: 'completed',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order status updated successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'Order updated',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e2001',
                    orderNumber: 'ORD-1778282206062-B750',
                    user: '664a1f2e8b3c2a001f4e3001',
                    jet: '664a1f2e8b3c2a001f4e1002',
                    finalSalePrice: 75000000,
                    status: 'completed',
                    createdAt: '2026-05-27T10:00:00.000Z',
                    updatedAt: '2026-05-27T11:00:00.000Z',
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Order not found.',
            content: {
              'application/json': {
                example: { message: 'Order not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete an order and re-list the jet',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Permanently removes an order record identified by its `orderNumber` path parameter. ' +
          'The associated jet is automatically re-listed as available upon deletion. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderNumber',
            in: 'path',
            required: true,
            description: 'Unique order identifier.',
            schema: { type: 'string', example: 'ORD-1778282206062-B750' },
          },
        ],
        responses: {
          200: {
            description: 'Order deleted and jet re-listed successfully.',
            content: {
              'application/json': {
                example: { message: 'Order ORD-1778282206062-B750 deleted and jet re-listed.' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'Order not found.',
            content: {
              'application/json': {
                example: { message: 'Order not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/user': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        description:
          'Access level: Public (no authentication required). ' +
          'Creates a new user account. ' +
          'The `email` and `password` fields are required. ' +
          'An optional `role` field accepts `admin` or `regular`; defaults to `regular` if omitted. ' +
          'Returns the new user\'s `_id`, `email`, and `role` — the password is never returned.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Unique email address for the new account.',
                    example: 'buyer@example.com',
                  },
                  password: {
                    type: 'string',
                    description: 'Plain-text password (hashed before storage).',
                    example: 'securePassword123',
                  },
                  role: {
                    type: 'string',
                    enum: ['admin', 'regular'],
                    description: 'User role. Defaults to `regular` if omitted.',
                    example: 'regular',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully.',
            content: {
              'application/json': {
                example: {
                  _id: '664a1f2e8b3c2a001f4e3001',
                  email: 'buyer@example.com',
                  role: 'regular',
                },
              },
            },
          },
          400: {
            description: 'Bad request — user already exists or creation failed.',
            content: {
              'application/json': {
                example: { message: 'User already exists' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Returns all user accounts in the system. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: {
                      type: 'integer',
                      description: 'Total number of users returned.',
                      example: 2,
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
                example: {
                  count: 2,
                  data: [
                    {
                      _id: '664a1f2e8b3c2a001f4e3001',
                      email: 'buyer@example.com',
                      role: 'regular',
                      createdAt: '2026-01-10T08:00:00.000Z',
                      updatedAt: '2026-01-10T08:00:00.000Z',
                    },
                    {
                      _id: '664a1f2e8b3c2a001f4e3002',
                      email: 'admin@example.com',
                      role: 'admin',
                      createdAt: '2026-01-01T00:00:00.000Z',
                      updatedAt: '2026-01-01T00:00:00.000Z',
                    },
                  ],
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/user/change-password': {
      patch: {
        tags: ['Users'],
        summary: 'Change own password',
        description:
          'Access level: Regular user (valid JWT required). ' +
          'Allows the authenticated user to update their own password. ' +
          'Both `oldPassword` and `newPassword` are required in the request body. ' +
          'Returns 401 if the current password does not match. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                  oldPassword: {
                    type: 'string',
                    description: 'The user\'s current password.',
                    example: 'oldSecurePassword123',
                  },
                  newPassword: {
                    type: 'string',
                    description: 'The new password to set.',
                    example: 'newSecurePassword456',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password updated successfully.',
            content: {
              'application/json': {
                example: { message: 'Password updated successfully' },
              },
            },
          },
          400: {
            description: 'Bad request — password update failed.',
            content: {
              'application/json': {
                example: { message: 'Password update failed' },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing/invalid JWT or incorrect current password.',
            content: {
              'application/json': {
                examples: {
                  invalidToken: {
                    summary: 'Missing or invalid JWT',
                    value: { message: 'Not authorized, token failed' },
                  },
                  wrongPassword: {
                    summary: 'Current password incorrect',
                    value: { message: 'Current password incorrect' },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found.',
            content: {
              'application/json': {
                example: { message: 'User not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/user/{email}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by email',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Returns a single user record identified by the `email` path parameter. ' +
          'The password field is excluded from the response. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'email',
            in: 'path',
            required: true,
            description: 'Email address of the user to retrieve.',
            schema: { type: 'string', format: 'email', example: 'buyer@example.com' },
          },
        ],
        responses: {
          200: {
            description: 'User returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
                example: {
                  data: {
                    _id: '664a1f2e8b3c2a001f4e3001',
                    email: 'buyer@example.com',
                    role: 'regular',
                    createdAt: '2026-01-10T08:00:00.000Z',
                    updatedAt: '2026-01-10T08:00:00.000Z',
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'User not found.',
            content: {
              'application/json': {
                example: { message: 'User not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user by email',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Fully replaces a user record identified by the `email` path parameter. ' +
          'If a `password` field is included in the request body it will be hashed before storage. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'email',
            in: 'path',
            required: true,
            description: 'Email address of the user to update.',
            schema: { type: 'string', format: 'email', example: 'buyer@example.com' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'New email address.',
                    example: 'updated@example.com',
                  },
                  password: {
                    type: 'string',
                    description: 'New plain-text password (hashed before storage).',
                    example: 'newSecurePassword456',
                  },
                  role: {
                    type: 'string',
                    enum: ['admin', 'regular'],
                    description: 'New role for the user.',
                    example: 'admin',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully.',
            content: {
              'application/json': {
                example: {
                  message: 'User updated',
                  data: {
                    _id: '664a1f2e8b3c2a001f4e3001',
                    email: 'updated@example.com',
                    role: 'regular',
                    createdAt: '2026-01-10T08:00:00.000Z',
                    updatedAt: '2026-05-27T12:00:00.000Z',
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'User not found.',
            content: {
              'application/json': {
                example: { message: 'User not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user by email',
        description:
          'Access level: Admin only (valid JWT with admin role required). ' +
          'Permanently removes a user account identified by the `email` path parameter. ' +
          'Pass a Bearer token in the Authorization header.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'email',
            in: 'path',
            required: true,
            description: 'Email address of the user to delete.',
            schema: { type: 'string', format: 'email', example: 'buyer@example.com' },
          },
        ],
        responses: {
          200: {
            description: 'User deleted successfully.',
            content: {
              'application/json': {
                example: { message: 'User deleted successfully' },
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
          403: {
            description: 'Forbidden — admin role required.',
            content: {
              'application/json': {
                example: { message: 'Access denied. Admins only.' },
              },
            },
          },
          404: {
            description: 'User not found.',
            content: {
              'application/json': {
                example: { message: 'User not found' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected database error' },
              },
            },
          },
        },
      },
    },
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and obtain a JWT token',
        description:
          'Access level: Public (no authentication required). ' +
          'Authenticates a user with their `email` and `password`. ' +
          'A successful response returns a signed JWT token (1-day expiry) along with the user\'s `id`, `email`, and `role`. ' +
          'The returned token must be passed as a `Bearer` token in the `Authorization` header for all protected endpoints.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Registered email address.',
                    example: 'buyer@example.com',
                  },
                  password: {
                    type: 'string',
                    description: 'Account password.',
                    example: 'securePassword123',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful — JWT token returned.',
            content: {
              'application/json': {
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NGExZjJlOGIzYzJhMDAxZjRlMzAwMSIsInJvbGUiOiJyZWd1bGFyIiwiaWF0IjoxNzE2ODE2MDAwLCJleHAiOjE3MTY5MDI0MDB9.example',
                  user: {
                    id: '664a1f2e8b3c2a001f4e3001',
                    email: 'buyer@example.com',
                    role: 'regular',
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized — invalid email or password.',
            content: {
              'application/json': {
                example: { message: 'Invalid email or password' },
              },
            },
          },
          500: {
            description: 'Internal server error.',
            content: {
              'application/json': {
                example: { message: 'Unexpected server error' },
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
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId.',
            example: '664a1f2e8b3c2a001f4e2001',
          },
          orderNumber: {
            type: 'string',
            description: 'Unique uppercase order identifier.',
            example: 'ORD-1778282206062-B750',
          },
          user: {
            type: 'object',
            description: 'Populated user reference.',
            properties: {
              _id: { type: 'string', example: '664a1f2e8b3c2a001f4e3001' },
              email: { type: 'string', example: 'buyer@example.com' },
            },
          },
          jet: {
            type: 'object',
            description: 'Populated jet reference.',
            properties: {
              _id: { type: 'string', example: '664a1f2e8b3c2a001f4e1002' },
              sku: { type: 'string', example: 'GS-LR-G700-26' },
              name: { type: 'string', example: 'Gulfstream G700' },
            },
          },
          finalSalePrice: {
            type: 'number',
            description: 'Final sale price in USD at time of purchase.',
            example: 75000000,
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'cancelled'],
            description: 'Current order status.',
            example: 'pending',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-27T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-27T10:00:00.000Z',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId.',
            example: '664a1f2e8b3c2a001f4e3001',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Unique email address for the account.',
            example: 'buyer@example.com',
          },
          role: {
            type: 'string',
            enum: ['admin', 'regular'],
            description: 'User role.',
            example: 'regular',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-10T08:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-10T08:00:00.000Z',
          },
        },
      },
      Manufacturer: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId.',
            example: '664a1f2e8b3c2a001f4e0001',
          },
          code: {
            type: 'string',
            description: 'Unique uppercase short code identifying the manufacturer.',
            example: 'GUL',
          },
          name: {
            type: 'string',
            description: 'Full manufacturer name.',
            example: 'Gulfstream',
          },
          country: {
            type: 'string',
            description: 'Country where the manufacturer is headquartered.',
            example: 'USA',
          },
          foundedYear: {
            type: 'integer',
            description: 'Year the manufacturer was founded.',
            example: 1958,
          },
        },
      },
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
