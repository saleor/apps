---
"saleor-app-avatax": minor
---

Improve tax code search functionality in AvaTax matcher

- Enhanced tax code combobox to display full format (`code - description`) for both selected values and initial values loaded from database
- Updated tax code filtering to search both tax code and description fields instead of code only
- Implemented client-side filtering for more flexible and responsive search experience
- Fixed initial value formatting to show complete tax code information when data is available

Users can now search for tax codes by typing either the tax code (e.g., "TX001") or the description (e.g., "Taxable").
