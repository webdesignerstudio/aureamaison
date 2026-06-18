# React Query Caching Audit — Fase 6

## Caching Strategy

### Snelle data (30s staleTime)
- Orders: `staleTime: 30000`
- Leggers: `staleTime: 30000`
- Klanten: `staleTime: 30000`

### Medium data (60s staleTime)
- Abonnementen: `staleTime: 60000`
- Aanbiedingen: `staleTime: 60000`
- Taken: `staleTime: 60000`

### Admin data (10s staleTime — realtime)
- Audit logs: `staleTime: 10000`
- Live feed: `staleTime: 10000`
- KPI's: `staleTime: 10000`

## Implementatie Status

### ✅ Fase 1 (Tiers)
- `useQuery` voor abonnementen: **IMPLEMENTED**
- Caching: 60s staleTime

### ✅ Fase 2 (Marketplace)
- `useQuery` voor aanbiedingen: **IMPLEMENTED**
- Caching: 60s staleTime

### ✅ Fase 3 (Admin)
- `useQuery` voor orders, abonnementen, leggers: **IMPLEMENTED**
- Caching: 10s staleTime (admin)

### ✅ Fase 4 (Goedkeuringen)
- `useQuery` voor goedkeuringen: **IMPLEMENTED**
- Caching: 30s staleTime

### ✅ Fase 5 (TRM)
- `useQuery` voor taken: **IMPLEMENTED**
- Caching: 60s staleTime
- CommandSearch: debounce 300ms

## Conclusie
**React Query caching is optimaal geconfigureerd.** Geen N+1 queries, proper invalidation.
