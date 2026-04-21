# Akash Portfolio - Production Testing Checklist

Complete test verification before deploying to Vercel.

## Public Pages Testing (Desktop & Mobile)

### Home Page (`/`)
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Navigation menu functions (open/close)
- [ ] Language toggle works (ES/EN)
- [ ] All internal links work (Work, About, Contact, Directory)
- [ ] Footer displays all links
- [ ] Footer social media links work (LinkedIn, Twitter, Instagram)
- [ ] Responsive design on mobile (<768px)
- [ ] Page transitions smooth
- [ ] Images load properly
- [ ] Typography renders correctly

### Work Portfolio Page (`/work`)
- [ ] Page loads successfully
- [ ] Hero section displays "Our Work"
- [ ] All 6 projects visible in grid:
  - Kupuri Studios
  - NEXUS CDMX
  - Synthia 3.0
  - Suelta App
  - OpenClaw Gateway
  - La Monarca Newspaper
- [ ] Project cards display descriptions
- [ ] "Learn More" / "View Details" buttons work
- [ ] Hover effects function
- [ ] Links to correct pages:
  - Synthia → `/dashboard`
  - OpenClaw → `/contact`
  - NEXUS → `/work` (same page)
  - Suelta → `/work` (same page)
  - Studios → `https://kupurimedia.com`
  - Monarca → `/newspaper`
- [ ] Responsive grid on mobile
- [ ] Footer navigation works
- [ ] CTA sections appear

### About Page (`/about`)
- [ ] Page loads successfully
- [ ] Company mission statement displays
- [ ] Team section shows 3 members:
  - Ivette Milo (Founder & Creative Director)
  - Design Team
  - Development Team
- [ ] Team member links work
- [ ] Core values section displays 6 values
- [ ] Social impact section visible
- [ ] CTA "Start a Conversation" button links to `/contact`
- [ ] Footer social links work
- [ ] Mobile responsive layout works
- [ ] Language support (ES/EN)

### Directory Page (`/directory`)
- [ ] Page loads successfully
- [ ] Directory hero section displays
- [ ] Three main sections visible:
  - Featured Projects (6 items)
  - Services & Expertise (6 items)
  - Resources & Learning (4 items)
- [ ] All 16 directory cards display correctly
- [ ] Project cards show:
  - Name/Title
  - Description (2-3 lines)
  - "Learn More" / "View Details" button
  - Proper status indicators if applicable
- [ ] All internal links work correctly
- [ ] External links (kupurimedia.com, blog) open in new tab
- [ ] Grid responsive on mobile
- [ ] Hover effects smooth
- [ ] Category titles visible
- [ ] Footer displays

### La Monarca Newspaper (`/newspaper`)
- [ ] Page loads successfully
- [ ] Hero section "La Monarca" displays
- [ ] Subtitle visible
- [ ] "Discover More" CTA button works
- [ ] 6 Feature cards display:
  - Global Stories
  - Creative Culture
  - Digital First
  - Community Voices
  - Connected Ecosystem
  - Interactive Experience
- [ ] "Coming Soon" section visible
- [ ] "Get Notified" button links to `/contact`
- [ ] Footer branded as "LA MONARCA"
- [ ] All footer links work
- [ ] Mobile responsive

### Dashboard / Control Room (`/dashboard` & `/control-room`)
- [ ] `/dashboard` redirects or displays bridge page
- [ ] Control room page loads
- [ ] Agent fleet displays (9 spheres)
- [ ] Agent statuses show (active/standby)
- [ ] Metric cards display key metrics
- [ ] Recent activity feed shows timeline
- [ ] Revenue widget displays data
- [ ] Quick actions buttons visible and functional
- [ ] Markets/regions section displays
- [ ] Ecosystem projects section loads (NEW)
- [ ] Project cards display with status indicators
- [ ] Tools by agent section loads (NEW)
- [ ] Tool assignments visible for each agent
- [ ] HERALD Tool Library component loads
- [ ] Mobile responsive dashboard

### Contact Page (`/contact`)
- [ ] Page loads successfully
- [ ] Contact form displays
- [ ] Form validation works
- [ ] CTA buttons functional
- [ ] Links to social media work
- [ ] Email links functional
- [ ] Footer displays

## Navigation & Routing

### Vercel Rewrites (vercel.json)
- [ ] `/` → `index.html`
- [ ] `/home` → `index.html`
- [ ] `/work` → `work.html`
- [ ] `/about` → `about.html`
- [ ] `/contact` → `contact.html`
- [ ] `/newspaper` → `newspaper.html`
- [ ] `/directory` → `directory.html`
- [ ] `/dashboard` → `dashboard.html`

### Vercel Redirects
- [ ] `/portfolio` → `/work` (301)
- [ ] `/projects` → `/work` (301)
- [ ] `/team` → `/about` (301)
- [ ] `/la-monarca` → `/newspaper` (301)
- [ ] `/synthia` → `/dashboard` (301)

### Internal Navigation
- [ ] Logo links to home (`/`)
- [ ] Navigation menu items work
- [ ] Footer "Main" section links work:
  - Home → `/`
  - Work → `/work`
  - About → `/about`
  - Contact → `/contact`
- [ ] Footer "Projects" section links work:
  - Synthia 3.0 → `/dashboard`
  - La Monarca → `/newspaper`
  - Directory → `/directory`
- [ ] External links open in new tabs (target="_blank")
- [ ] LinkedIn links work
- [ ] Twitter/X links work
- [ ] Instagram links work

## Responsive Design Testing

### Mobile (< 600px)
- [ ] All pages load properly
- [ ] Text is readable (min 16px)
- [ ] Navigation menu works
- [ ] Grid columns stack to 1 column
- [ ] Images scale properly
- [ ] Buttons have adequate touch targets (min 44x44px)
- [ ] Forms are usable
- [ ] Footer is accessible

### Tablet (600px - 1024px)
- [ ] Grids show 2 columns minimum
- [ ] Layout is balanced
- [ ] Navigation functions
- [ ] Images load correctly

### Desktop (> 1024px)
- [ ] Full multi-column layouts
- [ ] Hover effects work
- [ ] Responsive grids use full width
- [ ] Performance is optimal

## Performance Testing

### Load Times
- [ ] Home page loads in < 3 seconds
- [ ] Other pages load in < 2 seconds
- [ ] No 404 errors in console
- [ ] No CORS errors
- [ ] No unhandled promise rejections

### Images
- [ ] All images load
- [ ] Images are optimized (lazy loading)
- [ ] Alt text present
- [ ] No broken image links

### CSS & JavaScript
- [ ] No CSS errors in console
- [ ] No JavaScript errors in console
- [ ] Animations are smooth (60fps)
- [ ] Transitions work smoothly

## Security & Headers

### Security Headers (vercel.json)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### Caching (vercel.json)
- [ ] HTML cache: 3600s client / 86400s CDN
- [ ] Images cache: 31536000s immutable
- [ ] Cache headers present in network tab

## Internationalization (i18n)

### Spanish (ES) - Default
- [ ] Menu shows "Menú" / "Cerrar"
- [ ] Navigation items in Spanish
- [ ] Footer content in Spanish
- [ ] About page content in Spanish
- [ ] All text displays properly

### English (EN)
- [ ] Language toggle switches to EN
- [ ] Navigation items in English
- [ ] Content translations display
- [ ] Toggle back to ES works

## Accessibility

- [ ] Semantic HTML used
- [ ] Headings are properly nested (h1, h2, h3)
- [ ] Links have descriptive text (not "click here")
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Forms properly labeled
- [ ] Error messages clear

## Browser Compatibility

### Chrome/Edge (Latest)
- [ ] All pages load and function
- [ ] Animations smooth
- [ ] Forms work

### Firefox (Latest)
- [ ] All pages load and function
- [ ] Animations smooth
- [ ] No console errors

### Safari (Latest)
- [ ] All pages load and function
- [ ] Responsive design works
- [ ] Forms functional

### Mobile Browsers
- [ ] Chrome Mobile - all functional
- [ ] Safari Mobile (iOS) - all functional
- [ ] Firefox Mobile - all functional

## Link Verification

### Run automated link checker:
```bash
# Install linkinator if needed
npm install -g linkinator

# Check all links
linkinator https://kupuri.local

# Report any 404s or broken links
```

## Content Verification

### All Projects Listed
- [ ] Synthia 3.0 - description correct
- [ ] OpenClaw Gateway - description correct
- [ ] NEXUS CDMX - description correct
- [ ] Suelta App - description correct
- [ ] Kupuri Studios - description correct
- [ ] La Monarca - description correct

### Services Listed (6)
- [ ] Design Services
- [ ] Development
- [ ] AI & Automation
- [ ] Brand Strategy
- [ ] Content Production
- [ ] Consulting

### Team Information
- [ ] Ivette Milo - Founder info correct
- [ ] Design Team - description correct
- [ ] Development Team - description correct

## Control Room Dashboard

### Ecosystem Projects (NEW)
- [ ] All 8 projects display
- [ ] Status badges correct (active, beta, coming soon)
- [ ] Project descriptions visible
- [ ] Links functional
- [ ] Cards responsive

### Agent Tools (NEW)
- [ ] All 9 agents list their tools
- [ ] Tool counts accurate
- [ ] Primary tools highlighted
- [ ] Secondary tools visible
- [ ] Tool names truncated properly on mobile

### Sphere Agents
- [ ] SYNTHIA - Coordinadora General (0.85 Hz)
- [ ] ALEX - Estratega Ejecutivo (0.80 Hz)
- [ ] CAZADORA - Cazadora de Oportunidades (0.95 Hz)
- [ ] FORJADORA - Arquitecta de Sistemas (0.45 Hz)
- [ ] SEDUCTORA - Closera Maestra (0.65 Hz)
- [ ] CONSEJO - Consejero Mayor (0.25 Hz)
- [ ] DR. ECONOMÍA - Analista Financiero (0.75 Hz)
- [ ] DRA. CULTURA - Estratega Cultural (0.55 Hz)
- [ ] ING. TEKNOS - Ingeniero de Sistemas (0.35 Hz)

## Deployment Checklist

- [ ] All public pages tested (home, work, about, contact, directory, newspaper, dashboard)
- [ ] Navigation and routing verified
- [ ] Mobile responsive tested on real devices
- [ ] Performance acceptable (< 3s load time)
- [ ] Security headers in place
- [ ] No console errors or warnings
- [ ] Links verified (internal and external)
- [ ] Images optimized and loading
- [ ] i18n working (ES/EN)
- [ ] Accessibility verified
- [ ] Browser compatibility confirmed
- [ ] Content accuracy verified
- [ ] No broken redirects
- [ ] Vercel rewrites working
- [ ] Cache headers correct
- [ ] API client ready (with fallback)

## Post-Deployment Verification

After deploying to Vercel:

- [ ] Visit https://akashportfolio.vercel.app
- [ ] Verify all pages load
- [ ] Test all navigation
- [ ] Check mobile responsiveness
- [ ] Verify links work
- [ ] Monitor for errors (Vercel Analytics)
- [ ] Check performance metrics
- [ ] Verify caching working
- [ ] Test on real mobile devices
- [ ] Monitor uptime
- [ ] Check DNS propagation (if using custom domain)

## Sign-off

- [ ] All tests passed
- [ ] No blocking issues
- [ ] Production ready
- [ ] Date deployed: _____________
- [ ] Deployed by: _____________
