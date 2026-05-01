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
      "url": "localhost:8001/api/sales-system/search?q={{vin}}&pageSize=5&mimeType=pdf&waitMs=500",
      "fn": "return value?.data?.map(x=>({url: x.url, mimeType: x.mimeType, source: 'Sales System'})) ?? [];"
    },
    {
      "name": "Service System API",
      "method": "POST",
      "url": "localhost:8002/api/service-system/download-documents",
      "headers": "{'X-API-KEY': 'admin'}",
      "body": "{VIN: {{vin}}, wait_ms: 800}",
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
  'http://localhost:8001/api/sales-system/search?q=101&pageSize=5&mimeType=pdf&waitMs=500' \
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
  "VIN": 101,
  "wait_ms": 800
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

## auth

token to use api delete aggregator

```sh
eyJhbGciOiJSUzI1NiIsImtpZCI6IjZCMjAxQ0Y3QTQ2NTAwNkMwMDg4MkJFQzU1QkY4MUNDRTAwNDA5RUMiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJheUFjOTZSbEFHd0FpQ3ZzVmItQnpPQUVDZXcifQ.eyJuYmYiOjE3NzMzNzI1NzUsImV4cCI6MTc3MzQ0Mjc5OSwiaXNzIjoiaHR0cHM6Ly91YXQtaWRlbnRpdHkuZnJ0LnZuIiwiYXVkIjpbImh0dHBzOi8vdWF0LWlkZW50aXR5LmZydC52bi9yZXNvdXJjZXMiLCJvbmVodWItaWRlbnRpdHktYXBpIl0sImNsaWVudF9pZCI6IndlYi1laG8iLCJzdWIiOiJjYzEzNTI0Yy1kNTU0LTQwYjMtYWNhNS03MDJhMGFjMzVlNTQiLCJhdXRoX3RpbWUiOjE3NzMzNzI1NzQsImlkcCI6ImxvY2FsIiwidGVuYW50aWQiOiJkMWI4NWY2OS01NTY1LTQzMDEtODYwMi0wZmFhODhkYjZmMzkiLCJuYW1lIjoiNDE1MTMiLCJlbWFpbCI6Ik5oaUxOWUBGUFQuQ09NIiwiaW5zaWRlX2lkIjoiMTQ3MjAiLCJlbXBsb3llZV9jb2RlIjoiNDE1MTMiLCJ0aXRsZSI6IlRyxrDhu59uZyBOaMOzbSBQaOG6p24gTeG7gW0gSW5zaWRlIiwiZnVsbF9uYW1lIjoiQWRtaW4gaW5zaWRlIDIiLCJwaG9uZV9udW1iZXIiOiIwOTA1OTUxMTIxIiwiYWNjb3VudF9uYW1lIjoibmhpbG55IiwiZ3JvdXBzIjpbImppcmEtc29mdHdhcmUtdXNlcnMiLCJjb25mbHVlbmNlLXVzZXJzIiwiZnJ0LXVzZXJzIl0sImluc2lkZV9yb2xlIjoiMTgwNCIsInBpY3R1cmUiOiJodHRwczovL2luc2lkZXBoYXJtYWN5YmV0YS5mcHRzaG9wLmNvbS52bi9UZW1wbGF0ZS9JbWFnZXMvYXZhdGFyL2dpcmwucG5nIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIm9uZWh1Yi1pZGVudGl0eS1hcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.OKJBs-FqkQFbC6hxmwPeksv0esQfbZ4IS9WqwxE41jFoqOGCo8Z5T9S6XZ1x0DUF__RKNZsxOocmuwx5oI79XoxSxcVPfNMK2KAPKipmdle-mNIaD8CL887vyDMV3-Nr-L0tAR7FCSTTAfVJIt4r34q_Blw47aYLdtwru4r1oqHC3AVBqvv0ZcausaYBFJVPjuM_Qfo6QW8AfJEKLpdRReXkllukfPvQ7xjmaCruN_l9RllBv5JUOcaa0XDEB5b4q5UKXIMeAYA3e3S1Dzj6e5u9KERoI_-qgkAc23Dwr-eRlNoyed7jCbxSoXJDnVp53vphWYwqtHrQ3YPSVg-M2g
```

## run

```sh
pnpm i
pnpm start
```
