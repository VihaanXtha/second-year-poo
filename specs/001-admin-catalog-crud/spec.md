# Feature Specification: Admin CRUD for Catalog Content

**Feature Branch**: `001-admin-catalog-crud`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "I have created categories, subcategories, super-subcategories, brands, home slider, and FAQ in admin. Make all of the backend and connect the frontend, backend, and admin. Add demo data for categories, brands, and all features. Use real data. If you need images, copy them from screenshots folder."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin manages categories, subcategories, super-subcategories, brands, sliders, and FAQ (Priority: P1)

Admin logs into the admin panel, navigates to each content section, and can create, read, update, and delete entries. Changes are immediately visible on the frontend and shop.

**Why this priority**: The admin already has UI pages for these sections, but the backend endpoints are missing. Without backend support, the admin pages are non-functional.

**Independent Test**: Log in as admin, create a category, then verify it appears in the frontend category list and shop category list.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they create a new category via the admin panel, **Then** the category is saved to the database and appears in the public API.
2. **Given** a category exists in the database, **When** an admin edits it, **Then** the updated data is reflected in all frontend API responses.
3. **Given** a category exists, **When** an admin deletes it, **Then** it is removed from the database and no longer appears in API responses.

---

### User Story 2 - Public frontend and shop display catalog content (Priority: P1)

Visitors to the frontend and shop can browse categories, see the homepage slider, and view FAQ content. All data is fetched from the backend API.

**Why this priority**: The frontend and shop are already built with sections for these features, but they currently rely on hardcoded data or broken API calls.

**Independent Test**: Visit the frontend homepage and verify that categories, sliders, and FAQ sections load dynamically from the API.

**Acceptance Scenarios**:

1. **Given** categories exist in the database, **When** a user visits the frontend, **Then** the "Shop by Category" section displays real categories from the API.
2. **Given** a homepage slider exists, **When** a user visits the frontend, **Then** the hero slider displays real slides from the API.
3. **Given** FAQ entries exist, **When** a user visits the FAQ page, **Then** the FAQ accordion displays real questions and answers from the API.

---

### User Story 3 - Demo data is seeded for realistic preview (Priority: P2)

The database is pre-populated with realistic demo data for categories, brands, sliders, and FAQ so the site looks complete on first load.

**Why this priority**: Empty databases make the site look broken to new users. Demo data provides an immediate "real product" feel.

**Independent Test**: Run the database seeder and verify that categories, brands, sliders, and FAQ entries exist with realistic content.

**Acceptance Scenarios**:

1. **Given** the database is fresh, **When** the seeder runs, **Then** at least 8 categories, 5 brands, 3 sliders, and 5 FAQ entries are created.
2. **Given** demo categories exist, **When** the frontend loads, **Then** the category grid shows populated content.

---

### Edge Cases

- What happens when an admin creates a category with a duplicate name? System should return a validation error.
- What happens when a category has associated products and the admin tries to delete it? System should prevent deletion or cascade delete based on business rules.
- What happens when the API is called for content that does not exist? System should return an empty list, not an error.
- What happens when image URLs for sliders are invalid? Frontend should display a fallback or empty state gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide backend API endpoints for CRUD operations on categories, subcategories, super-subcategories, brands, homepage sliders, and FAQ entries.
- **FR-002**: System MUST store category hierarchies (category → subcategory → super-subcategory) with proper relationships.
- **FR-003**: System MUST provide public API endpoints to fetch categories, brands, sliders, and FAQ for frontend consumption.
- **FR-004**: System MUST seed demo data for all catalog content entities on database reset.
- **FR-005**: System MUST validate admin requests using Sanctum authentication and role-based middleware.
- **FR-006**: Frontend and shop MUST fetch and display real data from backend API instead of hardcoded content.
- **FR-007**: Admin panel pages for categories, subcategories, super-subcategories, brands, sliders, and FAQ MUST be fully functional with create, read, update, and delete operations.
- **FR-008**: System MUST enforce validation rules: category names are unique, required fields are present, and image URLs are valid formats.
- **FR-009**: System MUST return consistent JSON response formats for all API endpoints.
- **FR-010**: System MUST handle missing content gracefully by returning empty arrays or default values.

### Key Entities

- **Category**: Top-level product classification (e.g., "PC Components", "IoT Gear"). Contains name, slug, description, image, and display order.
- **SubCategory**: Child of a category (e.g., "GPUs" under "PC Components"). Contains name, slug, category_id, description, image.
- **SuperSubCategory**: Child of a subcategory (e.g., "NVIDIA" under "GPUs"). Contains name, slug, subcategory_id, description, image.
- **Brand**: Product manufacturer or vendor brand (e.g., "Arduino", "Raspberry Pi"). Contains name, logo, description, website.
- **HomepageSlider**: Hero carousel slide for the frontend. Contains title, subtitle, image URL, button text, button link, display order, and active status.
- **Faq**: Frequently asked question entry. Contains question, answer, display order, and active status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a new category and see it appear on the frontend within 1 API call cycle.
- **SC-002**: All admin CRUD pages for catalog content are functional with no console errors or failed API calls.
- **SC-003**: Frontend and shop display at least 6 categories, 4 brands, 3 sliders, and 5 FAQ entries from the API after seeding.
- **SC-004**: All public API endpoints for catalog content return data in under 200ms under normal load.
- **SC-005**: Deleting a category that has products returns a 409 conflict with a clear error message.

## Assumptions

- Admin authentication and Sanctum token management are already working.
- Frontend and shop apps are already built with placeholder components for categories, brands, sliders, and FAQ.
- Database migrations for the core entities already exist or can be created with standard Laravel migration patterns.
- Image assets for demo data can be sourced from placeholder image services or existing assets in the project.
- The admin panel already has UI components for the CRUD operations; only backend API integration is missing.
- Category hierarchy depth is fixed at 3 levels (category → subcategory → super-subcategory) for this implementation.
