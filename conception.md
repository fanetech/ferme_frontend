# 🧠 FARM MANAGEMENT — STEP-BY-STEP CONCEPTION PROMPT GUIDE

> **Purpose**: This document provides a structured series of prompts to guide the complete database and system design of the "Farm Management" platform. Each step builds on the previous one. Use these prompts sequentially with an AI assistant or development team to produce a comprehensive, production-ready conception.

---

## 📋 TABLE OF CONTENTS

1. [Step 1: Project Context & Requirements Analysis](#step-1)
2. [Step 2: Stakeholder & User Role Identification](#step-2)
3. [Step 3: Functional Module Breakdown](#step-3)
4. [Step 4: Database Architecture — Core Modules](#step-4)
5. [Step 5: Database Architecture — Operational Modules](#step-5)
6. [Step 6: Database Architecture — Advanced Modules](#step-6)
7. [Step 7: Database Architecture — Technical Modules](#step-7)
8. [Step 8: Relationships & Entity-Relationship Diagram](#step-8)
9. [Step 9: Test Scenarios Design](#step-9)
10. [Step 10: Validation & Refinement](#step-10)

---

<a name="step-1"></a>
## 🔹 STEP 1: Project Context & Requirements Analysis

### Prompt:

```
I am building a farm management platform for Burkina Faso (West Africa). Here is the context:

- Target users: individual farmers, cooperatives, livestock breeders, farm managers, 
  technicians, workers, public services (Ministry of Agriculture), and product buyers.
- The platform must include a mobile application (offline-capable) and a responsive web 
  application.
- Key challenges: lack of digital tools in agriculture/livestock, manual processes, 
  poor connectivity in rural areas, multilingual needs (French, Mooré, Dioula, Fulfulde).
- The system must handle: crop tracking, livestock management, financial management, 
  HR/personnel, product sales/marketplace, weather/IoT data, AI predictions, 
  and notifications/alerts.

Based on this context, provide:
1. A summary of the core problem being solved
2. The main project objectives (5-7 objectives)
3. Key technical constraints to consider
4. The expected deliverables
```

### Expected Output:
- Clear problem statement
- Measurable objectives
- List of constraints (offline mode, multilingual, security, scalability, role-based access)
- Deliverables list (mobile app, web app, documentation, user guide, analytics reports)

---

<a name="step-2"></a>
## 🔹 STEP 2: Stakeholder & User Role Identification

### Prompt:

```
Based on the Farm Management project for Burkina Faso, define:

1. All user roles in a hierarchical structure:
   - System-level roles (super admin, organization admin)
   - Farm-level roles (farm owner, farm manager, operations manager, technician, worker)
   - External roles (veterinarian, agronomist, customer, public authority)

2. For EACH role, specify:
   - Responsibilities and scope of access
   - What they can CREATE, READ, UPDATE, DELETE
   - Which modules they can access
   - Whether they need mobile access, web access, or both

3. Define the permission inheritance model:
   - How parent roles pass permissions to child roles
   - How a single user can have different roles in different farms

Present this as a Role-Permission matrix.
```

### Expected Output:
- Hierarchical role tree
- CRUD permission matrix per module per role
- Multi-farm access model explanation

---

<a name="step-3"></a>
## 🔹 STEP 3: Functional Module Breakdown

### Prompt:

```
For the Farm Management platform, break down the system into functional modules. 
For each module, provide:

1. Module name and code
2. Brief description (2-3 sentences)
3. Core entities/tables involved
4. Key features and use cases
5. Dependencies on other modules

The modules to cover are:
- Module 1: Organization Management
- Module 2: User & Access Management
- Module 3: Parcel & Crop Management
- Module 4: Livestock Management
- Module 5: Stock & Inventory Management
- Module 6: Financial Management
- Module 7: Human Resources Management
- Module 8: Marketplace & Sales
- Module 9: Weather Data & IoT
- Module 10: AI & Predictions
- Module 11: Notifications & Alerts
- Module 12: Synchronization & Audit

Present as a structured list with inter-module dependency diagram.
```

### Expected Output:
- 12 modules with descriptions
- Entity list per module
- Dependency map showing how modules interact

---

<a name="step-4"></a>
## 🔹 STEP 4: Database Architecture — Core Modules (1-3)

### Prompt:

```
Design the detailed database tables for the CORE modules of the Farm Management system. 
For each table, provide:

- Table name
- Detailed description (purpose, why it exists, what business problem it solves)
- All attributes with: name, data type, and description
- Primary keys, foreign keys, and relationships
- Important constraints and indexes
- ENUM values where applicable

IMPORTANT CONTEXT FOR BURKINA FASO:
- Phone number is the primary login (more accessible than email in rural areas)
- Support local languages: French, Mooré, Dioula, Fulfulde
- GPS coordinates are critical for mapping farms and parcels
- Currency is FCFA (XOF)
- Soil types and water sources are region-specific

--- MODULE 1: ORGANIZATION MANAGEMENT ---
Tables needed:
1. ORGANIZATION — Root entity for cooperatives, groups, NGOs, companies
   (include: code, name, type, registration number, tax ID, contact info, 
    GPS coordinates, member count, status, metadata)

2. FARM — Individual or collective farm unit
   (include: link to organization, code, name, type [CROP/LIVESTOCK/MIXED/AQUACULTURE], 
    owner info, areas in hectares, GPS boundaries as POLYGON, water source, 
    soil type, certification status, metadata)

--- MODULE 2: USER & ACCESS MANAGEMENT ---
Tables needed:
3. USER — All system users with phone-based authentication
   (include: phone as primary ID, PIN code for mobile, language preference, 
    literacy level, offline sync tracking, failed login counter, lock mechanism)

4. ROLE — Hierarchical role definitions with inheritance
   (include: code, name, level, parent role reference, is_system flag)

5. PERMISSION — Granular RBAC permissions
   (include: code format MODULE.RESOURCE.ACTION, module, resource, action)

6. USER_FARM_ACCESS — Multi-farm access with role per farm
   (include: user, farm, role, granted by, validity period, active flag)

--- MODULE 3: PARCEL & CROP MANAGEMENT ---
Tables needed:
7. PARCEL — Land units with GPS polygons and soil data
   (include: GPS boundaries, elevation, slope, soil pH, organic matter, 
    irrigation type, fallow status)

8. CROP_TYPE — Reference catalog with local language names
   (include: names in fr/moore/dioula/fulfulde, scientific name, family, 
    growth cycle, water needs, optimal conditions, expected yields, market price)

9. CULTIVATION — Crop instance on a parcel for a season
   (include: season year/type, variety, seed source/quality, all lifecycle dates 
    from planting to harvest, yield tracking, loss tracking, status)

10. AGRICULTURAL_ACTIVITY — Individual farm interventions
    (include: activity type, date/time, weather conditions during activity, 
     worker count, labor cost, photos)

Generate complete table definitions with all attributes, types, and descriptions.
```

### Expected Output:
- 10 fully defined tables with all columns
- Data types appropriate for PostgreSQL
- Descriptions explaining the business logic behind each field

---

<a name="step-5"></a>
## 🔹 STEP 5: Database Architecture — Operational Modules (4-6)

### Prompt:

```
Continue the database design for OPERATIONAL modules. Same format as before: 
table name, detailed description, all attributes with type and description.

--- MODULE 4: LIVESTOCK MANAGEMENT ---
Tables needed:
11. ANIMAL_TYPE — Species/breed reference catalog
    (include: names in French and local languages, scientific name, category 
     [CATTLE/SHEEP/GOAT/POULTRY/PIG/RABBIT/FISH], lifespan, maturity age, 
     gestation days, weight, feed/water consumption, space requirement, 
     vaccination schedule as JSON, common diseases as JSON)

12. LIVESTOCK — Individual animal registry
    (include: tag number, RFID code, breed, gender, birth info, acquisition info, 
     genealogy [mother_id, father_id], current weight, body condition score, 
     health status, reproductive status, production status, pregnancy tracking, 
     exit tracking [sold/dead/stolen/lost with date, reason, price])

13. VETERINARY_CARE — Complete medical records per animal
    (include: care type, date/time, symptoms, diagnosis, treatment details, 
     medication info [name, dose, frequency, duration], veterinarian contact, 
     cost, follow-up scheduling, outcome [RECOVERED/ONGOING/DIED], documents)

14. ANIMAL_PRODUCTION — Daily production tracking (milk, eggs, wool)
    (include: production type, quantity, unit, quality grade, fat/protein content, 
     collection time, storage info, sold/consumed/lost quantities)

--- MODULE 5: STOCK & INVENTORY MANAGEMENT ---
Tables needed:
15. INVENTORY_ITEM — Catalog of storable items with alert thresholds
    (include: category, code, brand, supplier, unit type, stock levels 
     [current/min/max/reorder], price, storage conditions, perishable flag, 
     expiry alert days)

16. STOCK_MOVEMENT — Complete movement traceability
    (include: movement type, quantity, unit price, batch number, 
     manufacturing/expiry dates, supplier info, reference to related operation, 
     performed by, approved by)

--- MODULE 6: FINANCIAL MANAGEMENT ---
Tables needed:
17. FINANCIAL_ACCOUNT — Multi-account management (cash, bank, mobile money)
    (include: account type [CASH/BANK/MOBILE_MONEY/CREDIT], institution, 
     currency XOF, balances, credit limit, default flag)

18. TRANSACTION — All financial flows with categorization
    (include: transaction number, type [INCOME/EXPENSE], category/subcategory, 
     amount, tax, payment method, recurring transaction support, 
     approval workflow, attachments)

19. BUDGET — Financial planning tool
    (include: period [ANNUAL/SEASONAL/MONTHLY], planned income/expense totals, 
     approval workflow)

20. BUDGET_LINE — Line-by-line budget detail with variance tracking
    (include: category, planned amount, actual amount, variance, variance percent)

Generate complete table definitions.
```

### Expected Output:
- 10 additional fully defined tables (tables 11-20)
- Livestock genealogy model
- Financial multi-account model with mobile money support

---

<a name="step-6"></a>
## 🔹 STEP 6: Database Architecture — Advanced Modules (7-9)

### Prompt:

```
Continue the database design for ADVANCED modules. Same format.

--- MODULE 7: HUMAN RESOURCES MANAGEMENT ---
Tables needed:
21. EMPLOYEE — Personnel registry (permanent, temporary, seasonal, daily)
    (include: employee code, personal info, emergency contact, position, 
     department, contract type [PERMANENT/TEMPORARY/SEASONAL/DAILY], 
     salary with frequency [MONTHLY/WEEKLY/DAILY/HOURLY], bank account, 
     social security, skills/certifications as JSON, termination tracking)

22. ATTENDANCE — Daily presence tracking with geolocation support
    (include: check-in/out times, scheduled vs actual hours, overtime, 
     status [PRESENT/ABSENT/LATE/HALF_DAY/HOLIDAY/SICK], absence reason)

23. TASK — Task assignment and tracking system
    (include: title, description, category, priority [LOW/MEDIUM/HIGH/URGENT], 
     assignment, due date, estimated vs actual hours, linked parcel/cultivation/livestock, 
     status [TODO/IN_PROGRESS/COMPLETED/CANCELLED])

--- MODULE 8: MARKETPLACE & SALES ---
Tables needed:
24. PRODUCT — Catalog of products for sale
    (include: product type [CROP/LIVESTOCK/PROCESSED/BY_PRODUCT], source reference, 
     quality grade [PREMIUM/STANDARD/ECONOMY], pricing, availability, 
     harvest/expiry dates, certifications, photos)

25. CUSTOMER — Buyer database with loyalty tracking
    (include: customer type [INDIVIDUAL/COMPANY/COOPERATIVE/RESTAURANT], 
     contact info, GPS for delivery, credit limit, payment terms, 
     preferred products as JSON)

26. SALE_ORDER — Complete sales cycle management
    (include: order number, customer, delivery scheduling, amounts 
     [total/tax/discount/net], payment status [PENDING/PARTIAL/PAID], 
     delivery status, approval workflow)

27. SALE_ORDER_LINE — Order line items with partial delivery support
    (include: product, quantity, unit price, discount, tax rate, 
     line total, delivered quantity)

--- MODULE 9: WEATHER DATA & IoT ---
Tables needed:
28. WEATHER_STATION — Physical or virtual weather stations
    (include: code, GPS location, elevation, manufacturer/model, 
     active status, last reading)

29. WEATHER_DATA — Detailed hourly weather recordings
    (include: temperature, humidity, pressure, rainfall, wind speed/direction, 
     solar radiation, UV index, soil temperature at 5cm and 10cm, 
     soil moisture, battery voltage)

30. IOT_SENSOR — Registry of deployed IoT sensors
    (include: sensor type [SOIL_MOISTURE/TEMPERATURE/WATER_LEVEL/etc.], 
     GPS location, linked parcel, calibration date, battery/signal levels, 
     alert thresholds as JSON)

31. IOT_READING — Sensor data streams
    (include: timestamp, value, unit, quality [GOOD/SUSPECT/ERROR], 
     battery/signal at reading time)

Generate complete table definitions.
```

### Expected Output:
- 11 additional tables (tables 21-31)
- HR model supporting rural contract types
- Marketplace with B2B capabilities
- IoT data ingestion model

---

<a name="step-7"></a>
## 🔹 STEP 7: Database Architecture — Technical Modules (10-12)

### Prompt:

```
Complete the database design with TECHNICAL modules. Same format.

--- MODULE 10: AI & PREDICTIONS ---
Tables needed:
32. AI_MODEL — Catalog of AI models with versioning
    (include: model name, type [YIELD_PREDICTION/DISEASE_DETECTION/PRICE_FORECAST], 
     version, accuracy score, training date, active flag, hyperparameters as JSON)

33. AI_PREDICTION — Stored predictions with post-hoc accuracy tracking
    (include: farm, model reference, prediction/target dates, predicted value, 
     confidence score, actual value (filled later), accuracy calculation, 
     input data as JSON)

34. DISEASE_DETECTION — AI image analysis results for disease detection
    (include: detection type [CROP/LIVESTOCK], image URL, detected disease, 
     confidence score, severity [LOW/MEDIUM/HIGH/CRITICAL], 
     recommendations as JSON, expert confirmation workflow)

--- MODULE 11: NOTIFICATIONS & ALERTS ---
Tables needed:
35. NOTIFICATION_TEMPLATE — Multilingual message templates
    (include: code, trigger event, messages in French/Mooré/Dioula, 
     priority, channels [SMS/PUSH/EMAIL] as JSON)

36. NOTIFICATION — Notification delivery log with retry support
    (include: template, recipient, title, message, priority, 
     channel [SMS/PUSH/EMAIL/IN_APP], scheduling, delivery tracking 
     [sent_at/read_at], status [PENDING/SENT/DELIVERED/READ/FAILED], 
     error message)

37. ALERT_RULE — Configurable automatic alert rules
    (include: farm-specific or global, condition type/config as JSON, 
     action type/config as JSON, active flag)

--- MODULE 12: SYNCHRONIZATION & AUDIT ---
Tables needed:
38. SYNC_LOG — Offline/online synchronization journal
    (include: user, device ID, sync type [FULL/PARTIAL/DELTA], 
     direction [UPLOAD/DOWNLOAD/BIDIRECTIONAL], duration, 
     records sent/received, conflicts count, data size, status)

39. CONFLICT_RESOLUTION — Offline conflict management
    (include: sync reference, table/record in conflict, conflict type, 
     local vs server data as JSON, resolution method, merged data, 
     manual resolution tracking)

40. AUDIT_LOG — Immutable action trace for compliance
    (include: user, timestamp, action type [CREATE/UPDATE/DELETE/VIEW], 
     table/record, old/new values as JSON, IP address, user agent, 
     device ID, geolocation, session ID)

41. SYSTEM_LOG — Technical monitoring and debugging logs
    (include: log level [DEBUG/INFO/WARNING/ERROR/CRITICAL], 
     component, message, stack trace, impacted user/farm)

Generate complete table definitions.
```

### Expected Output:
- 10 final tables (tables 32-41)
- AI feedback loop model
- Offline sync with conflict resolution
- Complete audit trail

---

<a name="step-8"></a>
## 🔹 STEP 8: Relationships & Entity-Relationship Diagram

### Prompt:

```
Based on the 41 tables designed for the Farm Management system, now provide:

1. A COMPLETE LIST of all foreign key relationships between tables.
   Format: TABLE_A.column → TABLE_B.column (relationship type: 1:1, 1:N, N:N)

2. Group relationships by module interaction:
   - Intra-module relationships (within the same module)
   - Inter-module relationships (between different modules)

3. Identify the KEY JUNCTION/PIVOT tables that connect modules:
   - USER_FARM_ACCESS connects Users to Farms
   - CULTIVATION connects Parcels to Crop Types
   - STOCK_MOVEMENT connects Inventory to Operations
   - TRANSACTION connects Finance to all operational modules
   - NOTIFICATION connects Alerts to Users

4. Generate a Mermaid.js Entity-Relationship Diagram showing:
   - All 41 tables grouped by module
   - Primary relationships (foreign keys)
   - Cardinality notation

5. List any potential circular dependencies and how to handle them.
```

### Expected Output:
- Complete FK relationship list
- Inter-module dependency map
- Mermaid ER diagram code
- Circular dependency analysis

---

<a name="step-9"></a>
## 🔹 STEP 9: Test Scenarios Design

### Prompt:

```
Create 10 detailed, realistic test scenarios for the Farm Management system. 
Each scenario must:

1. Be based on a realistic situation in Burkina Faso agriculture
2. Involve multiple modules working together
3. Include specific test data (names, numbers, dates, amounts in FCFA)
4. Define clear expected results with measurable outcomes

Design these scenarios:

SCENARIO 1: New Farm Registration
- A farmer in Koudougou registers with phone, creates farm, adds parcels and livestock
- Modules: Organization, Users, Parcels, Livestock

SCENARIO 2: Complete Crop Cycle (Maize)
- Full lifecycle from planning to harvest to sale, rainy season 2025
- Modules: Parcels, Crops, Activities, Products, Sales, Finance

SCENARIO 3: Animal Health Crisis
- Foot-and-mouth disease detected, quarantine, treatment, notification chain
- Modules: Livestock, Veterinary Care, Notifications, Finance

SCENARIO 4: Harvest Season HR Management
- 20 seasonal workers, team organization, daily tracking, payroll
- Modules: HR, Attendance, Tasks, Finance

SCENARIO 5: B2B Cooperative Group Sale
- 10 farms sell onions together through marketplace
- Modules: Organization, Products, Marketplace, Sales, Finance

SCENARIO 6: AI Yield Prediction
- Rice yield prediction based on 3 years of data + current weather
- Modules: AI, Weather, Cultivation, IoT

SCENARIO 7: Offline Mode & Sync
- Technician works 5 days without network, syncs with conflict resolution
- Modules: Sync, Conflict Resolution, All operational modules

SCENARIO 8: Budget vs. Actual Analysis
- Full campaign budget comparison with variance analysis
- Modules: Budget, Transactions, Finance

SCENARIO 9: IoT Smart Irrigation
- 10 soil moisture sensors driving automatic irrigation decisions
- Modules: IoT Sensors, IoT Readings, Alerts, Parcels

SCENARIO 10: Multi-Farm Organization Dashboard
- Cooperative with 50 farms, centralized monitoring and shared services
- Modules: Organization, All modules aggregated

For each scenario, provide:
- Context (who, where, what situation)
- Step-by-step test data with actual values
- Expected results with specific numbers
```

### Expected Output:
- 10 complete test scenarios
- Realistic West African agricultural data
- Cross-module integration validation
- Measurable success criteria

---

<a name="step-10"></a>
## 🔹 STEP 10: Validation & Refinement

### Prompt:

```
Review the complete Farm Management database design (41 tables, 12 modules, 
10 test scenarios) and perform the following validation:

1. COMPLETENESS CHECK:
   - Are all features from the original specifications covered?
   - Are there any missing tables or attributes?
   - Are all ENUM values fully defined?

2. NORMALIZATION REVIEW:
   - Is the database in 3rd Normal Form (3NF)?
   - Are there any redundant data storage issues?
   - Should any tables be split or merged?

3. PERFORMANCE CONSIDERATIONS:
   - Which tables will have the highest volume? (IoT_Reading, Weather_Data, Audit_Log)
   - What indexes should be created?
   - Should any tables use partitioning? (time-based for logs and readings)
   - What archival strategy is needed for high-volume tables?

4. SECURITY REVIEW:
   - Are all sensitive fields properly handled? (password_hash, PIN, national_id)
   - Is the RBAC model complete and secure?
   - Are audit logs truly immutable?

5. OFFLINE-FIRST REVIEW:
   - Can all critical tables work offline?
   - Is the conflict resolution model complete?
   - What is the sync priority order?

6. LOCALIZATION REVIEW:
   - Are all user-facing text fields multilingual-ready?
   - Are local measurement units supported?
   - Are local calendar considerations handled? (agricultural seasons)

7. SCALABILITY REVIEW:
   - Can the system handle 50+ farms per organization?
   - Can it handle millions of IoT readings?
   - Is the multi-tenant architecture solid?

Provide a summary report with:
- Issues found (categorized by severity: Critical, Major, Minor)
- Recommended fixes for each issue
- Final architecture score (out of 100)
```

### Expected Output:
- Comprehensive review report
- Prioritized issue list
- Recommended improvements
- Architecture maturity assessment

---

## 🚀 BONUS PROMPTS

### Generate SQL Schema

```
Based on the complete Farm Management database design (41 tables), 
generate the full PostgreSQL DDL (CREATE TABLE statements) including:
- All tables with proper data types
- Primary keys and auto-generated UUIDs
- Foreign keys with ON DELETE/UPDATE actions
- CHECK constraints for ENUMs
- Indexes for frequently queried columns
- Comments on tables and columns
- Partitioning for high-volume tables (IoT_Reading, Weather_Data, Audit_Log)

Use these conventions:
- Snake_case for all names
- UUID primary keys with gen_random_uuid()
- TIMESTAMP WITH TIME ZONE for all timestamps
- created_at defaults to NOW()
- Soft delete with status column (no hard deletes)
```

### Generate API Endpoints

```
Based on the Farm Management database, generate a RESTful API specification:
- Group endpoints by module
- Use standard REST conventions (GET, POST, PUT, PATCH, DELETE)
- Include pagination, filtering, and sorting
- Define request/response schemas
- Include authentication requirements per endpoint
- Define rate limiting rules
- Document offline-sync endpoints separately

Format: OpenAPI 3.0 YAML
```

### Generate Mobile Data Model

```
Based on the Farm Management database, design the mobile-side data model:
- Which tables need full offline copies?
- Which tables only need partial/filtered data?
- What is the sync priority order?
- Define the local SQLite schema
- Design the sync queue mechanism
- Handle conflict detection and resolution rules
- Define data expiry/cleanup policies
```

---

## 📝 USAGE INSTRUCTIONS

1. **Start from Step 1** and work through each step sequentially
2. **Feed the output** of each step as context for the next prompt
3. **Adapt the prompts** to your specific needs (add/remove modules, change constraints)
4. **Use the Bonus Prompts** once the core design is complete
5. **Iterate**: Run Step 10 (Validation) after any major changes

### Recommended AI Settings:
- Use a high-capability model (Claude Opus, GPT-4, etc.)
- Set temperature low (0.1-0.3) for consistent technical output
- Provide the previous step's output as context for each new step
- For large outputs, request one module at a time if needed

---

*Document generated for the AvePLUS Farm Management Project — Burkina Faso*
*Version 1.0 — February 2026*