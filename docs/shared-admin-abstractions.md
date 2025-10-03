# Shared Admin Abstractions

## Overview

This update introduces a reusable foundation for CRUD-oriented admin screens. The goal is to eliminate repeated patterns across feature pages (apartments, facilities, owners, etc.) and provide consistent UX primitives.

### Components

- **`AdminPageLayout`** wraps page headers, actions, and content with consistent spacing.
- **`ResourceToolbar`** renders search inputs and filter selects using a declarative configuration.
- **`DataTable`** accepts a lightweight column schema and handles loading, empty states, and cell rendering.
- **`DynamicModal`** now supports an `isSubmitting` prop to show a spinner and disable the submit button while requests are in flight.

### Hooks

- **`useCrudResource`** centralises `react-query` integration for list fetch + create/update/delete mutations with toast feedback and automatic cache invalidation.
- **`useArrayQuery`** wraps array-valued catalog endpoints with consistent error handling and data extraction.

### Utilities

- **`extractArray`** and **`ensureArray`** (in `utils/dataHelpers`) provide defensive helpers for inconsistent API payloads.

## Usage Pattern

```
const resource = useCrudResource({
  queryKey: 'apartments',
  fetcher: apartmentsAPI.getAll,
  select: (data) => data?.apartments ?? [],
  resourceLabel: { singular: 'apartamento', plural: 'apartamentos' },
  createFn: apartmentsAPI.create,
  updateFn: ({ id, data }) => apartmentsAPI.update(id, data),
  deleteFn: apartmentsAPI.delete,
});

const columns = [
  { key: 'name', header: 'Nombre', render: (item) => item.name },
  { key: 'actions', header: 'Acciones', render: renderActions },
];

return (
  <AdminPageLayout
    title="Gestión de Apartamentos"
    description="Administre los apartamentos del conjunto residencial"
    actions={<PrimaryButton onClick={openModal} />}
  >
    <ResourceToolbar search={searchConfig} filters={filterConfig} />
    <DataTable
      columns={columns}
      data={filteredItems}
      isLoading={resource.isLoading}
      rowKey={(item) => item.id}
    />
  </AdminPageLayout>
);
```

## Migration Notes

1. **Determine selectors** – Use the `select` option in `useCrudResource` to project backend payloads to flat arrays.
2. **Lift shared state** – Replace component-level filter/search cards with `ResourceToolbar` while keeping feature-specific logic in the page.
3. **Reuse `DataTable`** – Encapsulate column render logic via `render` functions to avoid repeated `<table>` markup.
4. **Close modals on success** – Pass callbacks to `onCreateSuccess`/`onUpdateSuccess` or leverage local state to reset the modal.
5. **Toggle submission indicators** – Provide `isSubmitting` to `DynamicModal` whenever mutations are running.

## Next Steps

- Gradually migrate remaining admin feature pages (owners, guards, PQRS, etc.) to the shared abstractions.
- Replace legacy DOM scripts under `src/scripts` with React equivalents powered by the new hooks/components.
- Add unit tests for hooks and snapshots for critical pages once adoption stabilises.
