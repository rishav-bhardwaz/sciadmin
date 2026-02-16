# SciAdmin API Endpoints - Update Required

Comparison of **sciadmin** API calls vs **monolith-sciastra-be** backend routes. Updates needed for sciadmin to work with the current backend.

## Base URL

**Current sciadmin:** `https://xcience.in/admin/admin`  
**Backend routes:** All under `/admin/*` (e.g., `/admin/auth`, `/admin/users`, `/admin/events`)

**Recommended change:** Use base URL `https://xcience.in/admin` so paths resolve correctly.  
With base `https://xcience.in/admin`, paths like `/auth/login` and `/users` become `/admin/auth/login`, `/admin/users`, etc.

---

## 1. Users API (`usersApi` in `src/lib/api.ts`)

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| getUsers | `/users?...` | `GET /admin/users` | ✅ OK (with base `/admin`) |
| getUserById | `/admin/users/${userId}` | `GET /admin/users/:userId` | ❌ **Fix:** Use `/users/${userId}` (no `/admin` in path) |
| updateUserStatus | `/admin/users/${userId}/status` | `PUT /admin/users/:userId/status` | ❌ **Fix:** Use `/users/${userId}/status` |
| blacklistUser | `/admin/users/${userId}/blacklist` | `PUT /admin/users/:userId/blacklist` | ❌ **Fix:** Use `/users/${userId}/blacklist` |
| unblacklistUser | `/admin/users/${userId}/unblacklist` | `PUT /admin/users/:userId/unblacklist` | ❌ **Fix:** Use `/users/${userId}/unblacklist` |
| deleteUser | `/admin/users/${userId}` | `DELETE /admin/users/:userId` | ❌ **Fix:** Use `/users/${userId}` |
| getUserStats | `/admin/users/stats` | `GET /admin/users/stats` | ❌ **Fix:** Use `/users/stats` |

**Note:** Backend has `PUT :userId/suspend` but sciadmin does not call it. sciadmin uses blacklist/unblacklist. Backend supports both.

---

## 2. Events API (`eventsApi` in `src/lib/api.ts`)

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| getEvents | `/events/all?...` | `GET /admin/events/all` | ✅ OK |
| getEventById | `/events/${eventId}` | `GET /admin/events/:eventId` | ✅ OK |
| createEventStep1 | eventsApiClient `/events/step1` | `POST /admin/events/step1` | ✅ OK |
| updateEventStep2 | eventsApiClient `/events/${eventId}/step2` | `PUT /admin/events/:eventId/step2` | ✅ OK |
| updateEventStep3 | eventsApiClient `/events/${eventId}/step3` | `PUT /admin/events/:eventId/step3` | ✅ OK |
| finalizeEvent | eventsApiClient `/events/${eventId}/finalize` | `PUT /admin/events/:eventId/finalize` | ✅ OK |
| updateEventStatus | `/events/${eventId}/status` | `PUT /admin/events/:eventId/status` | ✅ OK |
| deleteEvent | `/events/${eventId}` | `DELETE /admin/events/:eventId` | ✅ OK |
| getEventRegistrations | `/events/${eventId}/registrations` | `GET /admin/events/:eventId/registrations` | ✅ OK |

---

## 3. Content API (`contentApi` in `src/lib/api.ts`)

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| getPosts | `/content/posts?...` | `GET /admin/content/posts` | ✅ OK |
| getComments | `/content/comments?...` | `GET /admin/content/comments` | ✅ OK |
| getFlaggedContent | `/content/flagged?...` | `GET /admin/content/flagged` | ✅ OK |
| moderatePost | `/content/posts/${postId}/moderate` | `PUT /admin/content/posts/:postId/moderate` | ✅ OK |
| moderateComment | `/content/comments/${commentId}/moderate` | `PUT /admin/content/comments/:commentId/moderate` | ✅ OK |
| deletePost | `/content/posts/${postId}` | `DELETE /admin/content/posts/:postId` | ✅ OK |
| deleteComment | `/content/comments/${commentId}` | `DELETE /admin/content/comments/:commentId` | ✅ OK |
| getReports | `/content/reports?...` | `GET /admin/content/reports` | ✅ OK |
| getReportDetails | `/content/reports/${reportId}` | `GET /admin/content/reports/:reportId` | ✅ OK |
| takeActionOnReport | `/content/reports/${reportId}/action` | `PUT /admin/content/reports/:reportId/action` | ✅ OK |
| getContentStats | `/content/stats` | `GET /admin/content/stats` | ✅ OK |

**Note:** Report action values: backend expects `resolve | dismiss | escalate`. sciadmin also sends `validate` and `review`; backend maps them to `resolve` and `review` (escalate) respectively. ✅ Compatible.

---

## 4. Logging API (`logsApi` in `src/lib/api.ts`)

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| getAdminLogs | `/logs?...` | `GET /admin/logs` | ✅ OK |
| getMyActivity | `/logs/my-activity?...` | `GET /admin/logs/my-activity` | ✅ OK |

**Note:** Backend also has `GET /admin/logs/activity/:adminId` but sciadmin does not use it.

---

## 5. Analytics API (`analyticsApi` in `src/lib/api.ts`)

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| getDashboardStats | `/analytics/dashboard` | `GET /admin/analytics/dashboard` | ✅ OK |
| getUserGrowthAnalytics | `/analytics/users/growth?...` | `GET /admin/analytics/users/growth` | ✅ OK |
| getEventAnalytics | `/analytics/events` | `GET /admin/analytics/events` | ✅ OK |
| getRevenueAnalytics | `/analytics/revenue` | `GET /admin/analytics/revenue` | ✅ OK |
| getEngagementMetrics | `/analytics/engagement` | `GET /admin/analytics/engagement` | ✅ OK |
| getAdminActivityAnalytics | `/analytics/admin-activity?...` | `GET /admin/analytics/admin-activity` | ✅ OK |

---

## 6. Auth & Profile

| sciadmin Call | sciadmin Path | Backend Route | Status |
|---------------|---------------|---------------|--------|
| authApi.login | `/auth/login` | `POST /admin/auth/login` | ✅ OK |
| authApi.logout | `/auth/logout` | ❌ Backend has no logout endpoint | ⚠️ Client-side logout only |
| authApi.getProfile | `/profile` | `GET /admin/profile` | ⚠️ Backend uses `GET /admin/profile` (AdminController) |
| authApi.updateProfile | `/profile` PUT | `PUT /admin/profile` | ✅ OK |

**Note:** Backend AdminController is `@Controller('admin')` with `@Get('profile')` and `@Put('profile')`. So the path is `/admin/profile`. sciadmin uses `/profile`; with base `/admin` that becomes `/admin/profile`. ✅ OK.

---

## Summary of Required Changes

### 1. Base URL
- Change `AUTH_API_BASE_URL` and `EVENTS_API_BASE_URL` from `https://xcience.in/admin/admin` to `https://xcience.in/admin`
- Or use env vars: `NEXT_PUBLIC_AUTH_API_URL` and `NEXT_PUBLIC_EVENTS_API_URL`

### 2. Users API – fix paths in `src/lib/api.ts`
Replace `/admin/users/` with `/users/` in all user API paths:

| Method | Current Path | Correct Path |
|--------|--------------|--------------|
| getUserById | `/admin/users/${userId}` | `/users/${userId}` |
| updateUserStatus | `/admin/users/${userId}/status` | `/users/${userId}/status` |
| blacklistUser | `/admin/users/${userId}/blacklist` | `/users/${userId}/blacklist` |
| unblacklistUser | `/admin/users/${userId}/unblacklist` | `/users/${userId}/unblacklist` |
| deleteUser | `/admin/users/${userId}` | `/users/${userId}` |
| getUserStats | `/admin/users/stats` | `/users/stats` |

### 3. `src/lib/api/events.ts`
This file uses `API_BASE_URL` from env (`http://localhost:3005`) and paths like `/admin/events/step1`. If the monolith runs on port 3005 with no prefix, paths should be `/admin/events/...`. Ensure this file’s base URL and paths match the monolith’s routing (or consider using the shared api.ts client with the correct base URL).

---

## Files to Update

1. **`sciadmin/src/lib/api.ts`**
   - Base URL: `https://xcience.in/admin/admin` → `https://xcience.in/admin`
   - `usersApi`: change all paths from `/admin/users/...` to `/users/...`

2. **`sciadmin/.env` or `.env.local`** (if used)
   - `NEXT_PUBLIC_AUTH_API_URL=https://xcience.in/admin`
   - `NEXT_PUBLIC_EVENTS_API_URL=https://xcience.in/admin`
