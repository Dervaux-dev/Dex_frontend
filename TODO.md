# ESLint Fix Plan

## Steps

- [x] 1. Analyze files and create plan
- [x] 2. Create `src/hooks/useAuth.jsx` — extract `useAuth` hook from AuthContext
- [x] 3. Create `src/hooks/useToast.jsx` — extract `useToast` hook from ToastContext
- [x] 4. Edit `AuthContext.jsx` — remove `useAuth` export, remove unused `err`, inline `loadUser` in `useEffect`
- [x] 5. Edit `ToastContext.jsx` — remove `useToast` export
- [x] 6. Update `Navbar.jsx` — change import path for `useAuth`
- [x] 7. Update `home.jsx` — change import path for `useAuth`
- [x] 8. Run `npm run lint` to verify all errors resolved

