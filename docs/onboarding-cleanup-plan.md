# Onboarding Cleanup and Implementation Plan

## Summary
This document captures the current onboarding flow, cleanup actions taken, and the remaining active onboarding files in the repository.

## Current Onboarding Flow

### Frontend
- `frontend/src/components/views/Signup/SignupPage.tsx` is the active signup/onboarding flow.
- It collects borrower/lender personal details, banking details, employment info, and document uploads.
- The form now submits through the frontend API wrapper:
  - `frontend/src/api/onboarding.ts`
- The active backend endpoint is:
  - `POST /api/onboarding/borrower-onboarding`
- The frontend no longer submits to the outdated `/api/auth/borrower-onboarding` path.

### Backend
- Backend onboarding is handled by the `/onboarding` route group.
- Active files:
  - `backend/src/routes/onboarding.routes.ts`
  - `backend/src/controllers/onboarding.controller.ts`
  - `backend/src/controllers/onboarding.validation.controller.ts`
  - `backend/src/validators/onboarding.validator.ts`
  - `backend/src/models/BorrowerOnboarding.model.ts`
- The backend validates incoming onboarding data and uploads required document files.

## Cleanup Actions Completed

### Deleted
- `frontend/src/validators/onboarding.ts`
  - This file was not referenced by any frontend component or API import.
  - It contained duplicate validation helpers that were not used in the active signup flow.

### Updated
- `frontend/src/components/views/Signup/SignupPage.tsx`
  - Replaced direct `fetch` to `/api/auth/borrower-onboarding` with `submitBorrowerOnboarding(payload)`.
  - Added import: `@/api/onboarding`.
- `frontend/src/api/onboarding.ts`
  - Remains as the onboarding API helper for submission and validation.

## Active Onboarding Files

### Frontend
- `frontend/src/components/views/Signup/SignupPage.tsx`
- `frontend/src/api/onboarding.ts`

### Backend
- `backend/src/routes/onboarding.routes.ts`
- `backend/src/controllers/onboarding.controller.ts`
- `backend/src/controllers/onboarding.validation.controller.ts`
- `backend/src/validators/onboarding.validator.ts`
- `backend/src/models/BorrowerOnboarding.model.ts`

## Notes
- There is no active `frontend/src/components/views/Signup/OnboardingFlow.tsx` file in this repo.
- The active frontend signup flow is implemented entirely in `SignupPage.tsx` and submits through `frontend/src/api/onboarding.ts`.
- The backend onboarding module is correctly routed through `/api/onboarding` and does not rely on the `/api/auth` route group.
- The backend route registration is handled in `backend/src/routes/index.ts` via `router.use('/onboarding', onboardingRoutes)`.

## Recommended Next Steps
1. Centralize frontend validation by adding a dedicated `frontend/src/validators/onboarding.ts` module if form logic should be reusable.
2. Refactor `frontend/src/components/views/Signup/SignupPage.tsx` into reusable step subcomponents if the file grows too large.
3. Wire the frontend to use `checkEmailUnique`, `checkIdUnique`, and `checkPhoneUnique` from `frontend/src/api/onboarding.ts` for live uniqueness checks.
4. Add integration tests for backend `/api/onboarding/borrower-onboarding` and the frontend signup submit flow.
5. Optionally update `COMPLIANCE_PLAN.md` and `docs/onboarding-cleanup-plan.md` together when the flow changes again.
