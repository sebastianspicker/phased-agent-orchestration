# Next.js App Router checklist

## Rendering
- [ ] route rendering strategy explicit (static/dynamic/revalidate)
- [ ] data fetching uses correct caching options
- [ ] no accidental dynamic dependencies

## UX boundaries
- [ ] `loading.tsx` for slow routes
- [ ] `error.tsx` for recoverable errors
- [ ] client boundaries limited to required components

## SEO
- [ ] metadata defined for route (title/description)
- [ ] canonical and robots policy considered when relevant

## Security
- [ ] server actions check authn + authz
- [ ] input validation for server actions/route handlers
