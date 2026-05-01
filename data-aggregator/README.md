# Data Aggregator

## record

base

```json
{
  "createdBy": "",
  "createdAt": "",
  "updatedBy": "",
  "updatedAt": "",
  "deletedBy": "",
  "deletedAt": ""
}
```

aggregator

```json5
{
  id: 1,
  name: 'unified-document-view-by-vin',
  description: 'Unified Document View By Vehicle Indentity Number(VIN)',
  status: 'active',
  params: ['vin', 'X-API-KEY'],
  sources: [
    {
      method: 'GET',
      url: 'localhost:8001/api/sales-system/search?q={{vin}}&pageSize=5&mimeType=pdf',
      fn: `return value?.data?.map(x=>({
         "url": x.url,
         "mimeType": x.mimeType,
         "source": "Sales System"
      })) ?? [];`,
    },
    {
      method: 'POST',
      url: 'localhost:8002/api/service-system/download-documents',
      header: `{
          "X-API-KEY": "{{X-API-KEY}}",
       }`,
      body: `{
          "VIN": {{vin}}
       }`,
      fn: `return value?.results?.map(x=>({
         "url": x.URL,
         "mimeType": x.mime_type,
         "source": "Service System"
      })) ?? [];`,
    },
  ],
  fn: 'return value.slice(0,10);',
  shouldRemoveDuplicates: false,
}
```

## create

```json
{
  "name": "unified-document-view-by-vin",
  "description": "Unified Document View By Vehicle Indentity Number(VIN)",
  "status": "active",
  "params": ["vin"],
  "sources": [
    {
      "name": "Sales System API",
      "method": "GET",
      "url": "localhost:8001/api/sales-system/search?q={{vin}}&pageSize=5&mimeType=pdf",
      "fn": "return value?.data?.map(x=>({url: x.url, mimeType: x.mimeType, source: 'Sales System'})) ?? [];"
    },
    {
      "name": "Service System API",
      "method": "POST",
      "url": "localhost:8002/api/service-system/download-documents",
      "headers": "{'X-API-KEY': 'admin'}",
      "body": "{VIN: {{vin}}}",
      "fn": "return value?.results?.map(x=>({url: x.URL, mimeType: x.mime_type, source: 'Service System'})) ?? [];"
    }
  ],
  "fn": "return value.slice(0,10);",
  "shouldRemoveDuplicates": false
}
```

## paging

```json
{
  "error": "",
  "pageNumber": 1,
  "pageSize": 10,
  "totalPage": 2,
  "totalItem": 25,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "data": []
}
```

## use

```sh
POST localhost:8000/api/aggregator/unified-document-view-by-vin
```

body

```json
{
  "vin": "101"
}
```

response

```json
{
  "sources": [
    {
      "name": "Sales System",
      "status": "success",
      "error": "",
      "totalItem": 5
    },
    {
      "name": "Service System",
      "status": "success",
      "error": "",
      "totalItem": 6
    }
  ],
  "data": [
    {
      "url": "url_1",
      "mimeType": "pdf",
      "source": "Sales System"
    },
    {
      "url": "url_2",
      "mimeType": "docx",
      "source": "Service System"
    }
  ]
}
```

## Sales System

request

```sh
curl -X 'GET' \
  'http://localhost:8001/api/sales-system/search?q=101&pageSize=5&mimeType=pdf' \
  -H 'accept: application/json'
```

response

```json
{
  "error": "",
  "data": [
    { "id": 1, "vin": "101", "url": "url_1", "mimeType": "pdf" },
    { "id": 2, "vin": "101", "url": "url_2", "mimeType": "pdf" },
    { "id": 3, "vin": "101", "url": "url_3", "mimeType": "pdf" },
    { "id": 4, "vin": "101", "url": "url_4", "mimeType": "pdf" },
    { "id": 5, "vin": "101", "url": "url_5", "mimeType": "pdf" }
  ]
}
```

## Service System

request

```sh
curl -X 'POST' \
  'http://localhost:8002/api/service-system/download-documents' \
  -H 'accept: application/json' \
  -H 'X-API-KEY: admin' \
  -H 'Content-Type: application/json' \
  -d '{
  "VIN": 101
}'
```

response

```json
{
  "status": "200",
  "results": [
    { "id": 1, "VIN": 101, "URL": "URL_1", "mime_type": "docx", "created_at": "", "created_by": "system" },
    { "id": 2, "VIN": 101, "URL": "URL_2", "mime_type": "txt", "created_at": "", "created_by": "system" },
    { "id": 3, "VIN": 101, "URL": "URL_3", "mime_type": "pdf", "created_at": "", "created_by": "system" },
    { "id": 4, "VIN": 101, "URL": "URL_4", "mime_type": "docx", "created_at": "", "created_by": "system" },
    { "id": 5, "VIN": 101, "URL": "URL_5", "mime_type": "docx", "created_at": "", "created_by": "system" },
    { "id": 6, "VIN": 101, "URL": "URL_6", "mime_type": "docx", "created_at": "", "created_by": "system" }
  ]
}
```

## run

```sh
pnpm i
pnpm start
```
