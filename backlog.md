# Backlog

## Features to Implement

### High Priority
- [x] User authentication system
- [x] Task management functionality (with Prisma ORM)
- [ ] Dashboard with analytics
- [ ] Implement server-side session handling with Middleware
- [ ] Mobile responsive design

### Medium Priority
- [ ] Task categories and tags
- [ ] Search and filtering
- [ ] Export/import functionality
- [ ] Notifications system

### Low Priority
- [ ] Dark mode theme
- [ ] Advanced reporting
- [ ] API integrations
- [ ] Multi-language support

## Bugs to Fix

### Critical
- [x] Fixed a critical error in `AuthContext.tsx` where `updateProfile` was calling a non-existent function, which was blocking the authentication flow.
- [x] Fixed task persistence - tasks weren't saving to database and disappeared on page refresh

### High
- [x] Slow navigation between pages - optimized with token caching and reduced API calls

### Medium
- [ ] 

## Technical Debt

- [x] Code refactoring (migrated to Prisma ORM)
- [x] Refactor AppContext to remove mock data and initialize with an empty state
- [ ] Refactor Dashboard to remove mock data and use real data
- [x] Performance optimization (token caching, reduced API calls, font optimization)
- [ ] Test coverage improvement
- [x] Refactored `profileService.ts` and `AuthContext.tsx` to use a dedicated `UserProfile` type, improving type safety.
- [x] Unify AppContext and AuthContext to a single source of truth for authentication
- [ ] Documentation updates

## Recent Changes (2025-01-23)

### Performance Optimizations
- ✅ Implemented JWT token caching in AuthService (5-minute cache)
- ✅ Added client-side auth data caching in AuthContext (10-minute cache)
- ✅ Batched user preferences with auth verification API call
- ✅ Optimized font loading with preload and fallback fonts
- ✅ Consolidated AuthContext and AppContext into single provider
- ✅ Improved loading states to prevent blocking navigation

### Task Persistence Fix
- ✅ Fixed addTask to call `/api/tasks` POST endpoint for database persistence
- ✅ Updated handleDragEnd to call `/api/tasks/[id]` PUT when moving tasks between columns
- ✅ Added loadTasks function to fetch existing tasks from database on app start
- ✅ Updated all task API endpoints to use Authorization token instead of middleware headers
- ✅ Tasks now persist correctly after page refresh and app restart

## Notes

*Last updated: 2025-01-23*
*Priority levels: Critical, High, Medium, Low*

## Migration Notes

- ✅ Migrated from Supabase to MongoDB Atlas
- ✅ Implemented JWT-based authentication
- ✅ Updated Prisma schema for MongoDB
- ✅ Created custom auth middleware
- ✅ Updated all API routes for new auth system
