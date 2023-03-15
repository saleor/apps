---
"saleor-app-invoices": patch
---

When TEMP_PDF_STORAGE_DIR env is not set, app will automatically create and write to _temp directory relative to file that resolves a path.
In development this will be a file inside .next folder. In production it's recommended to set TEMP_PDF_STORAGE_DIR, especially using Vercel
