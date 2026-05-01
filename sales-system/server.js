const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const PORT = 8001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sales System API",
      version: "1.0.0",
      description: "Search API for sales documents and files",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        SearchResult: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            vin: { type: "string", example: "101" },
            url: {
              type: "string",
              example: "https://s3-han02.fptcloud.com/...",
            },
            mimeType: { type: "string", example: "pdf" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 10 },
            totalItems: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 10 },
          },
        },
        SearchResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/SearchResult" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },
      },
    },
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mock data - replace with database queries in production
const mockData = [
  {
    id: 1,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 2,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pptx",
  },
  {
    id: 3,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "docx",
  },
  {
    id: 4,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 5,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 6,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 7,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 8,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 9,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "docx",
  },
  {
    id: 10,
    vin: "101",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pdf",
  },
  {
    id: 11,
    vin: "102",
    url: "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    mimeType: "pptx",
  },
];

/**
 * @swagger
 * /api/sales-system/search:
 *   get:
 *     summary: Search sales documents
 *     description: Search for sales documents by VIN, ID, or MIME type with pagination support
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (searches in VIN or ID fields)
 *         example: "101"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: mimeType
 *         schema:
 *           type: string
 *           enum: [pdf, pptx, docx, txt, xlsx]
 *         description: Filter by file MIME type
 *         example: "pdf"
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   type: array
 */
// Search endpoint
app.get("/api/sales-system/search", (req, res) => {
  try {
    const { q, pageSize = 10, pageNumber = 1, mimeType } = req.query;

    // Validate pagination parameters
    const page = Math.max(1, parseInt(pageNumber) || 1);
    const size = Math.max(1, Math.min(100, parseInt(pageSize) || 10));

    // Filter data based on query parameters
    let filteredData = mockData;

    // Filter by search query (searches in vin field)
    if (q) {
      filteredData = filteredData.filter(
        (item) => item.vin.includes(q) || item.id.toString().includes(q),
      );
    }

    // Filter by mime type
    if (mimeType) {
      filteredData = filteredData.filter((item) => item.mimeType === mimeType);
    }

    // Pagination
    const totalCount = filteredData.length;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Response
    res.json({
      error: "",
      data: paginatedData,
      pagination: {
        currentPage: page,
        pageSize: size,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / size),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      data: [],
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Sales System API running on http://localhost:${PORT}`);
  console.log(`\nExample requests:`);
  console.log(
    `- Search by VIN: http://localhost:${PORT}/api/sales-system/search?q=101`,
  );
  console.log(
    `- Search with pagination: http://localhost:${PORT}/api/sales-system/search?pageSize=2&pageNumber=1`,
  );
  console.log(
    `- Search by mime type: http://localhost:${PORT}/api/sales-system/search?mimeType=pdf`,
  );
  console.log(
    `- Combined search: http://localhost:${PORT}/api/sales-system/search?q=101&pageSize=10&pageNumber=1&mimeType=pdf`,
  );
});

module.exports = app;
