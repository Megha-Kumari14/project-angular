# project-angular


Configure Cultures
User Story:
As an admin, I want to manage Country ISO Code so that I can use ISO Codes on Location selection.

Technical Considerations:

API Endpoint: POST /api/currencies
Database Schema (Cultures Table):
CultureID (PK), Name, Alpha2, Alpha3, UpdatedAt
Validation:
Fetch ISO Country codes from CultureInfo
 

Replenishment Management
User Story:
As an admin, I want to configure stock replenishment rules based on thresholds so that products are restocked efficiently.

Technical Considerations:

API Endpoint: POST /api/stock/replenishment
Database Schema (Replenishment Rules Table):
RuleID (PK), ProductID (FK), MinThreshold, MaxThreshold, ReorderQuantity, SupplierID (FK), CreatedAt
Business Rules:
Generate automatic reorder requests when stock falls below the MinThreshold
Send notifications for out-of-stock items











Minor correction in the requirement statement:

Present:

API Endpoint: POST /api/currencies

 

New:

API Endpoint: POST /api/cultures
