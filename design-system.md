## Design System: Eventfy

### Pattern
- **Name:** Event/Conference Landing
- **Conversion Focus:** Early bird pricing with deadline. Social proof (past attendees). Speaker credibility. Multi-ticket discounts.
- **CTA Placement:** Register CTA sticky + After speakers + Bottom
- **Color Strategy:** Urgency colors (countdown). Event branding. Speaker cards professional. Sponsor logos neutral.
- **Sections:** 1. Hero (date/location/countdown), 2. Speakers grid, 3. Agenda/schedule, 4. Sponsors, 5. Register CTA

### Style
- **Name:** Vibrant & Block-based
- **Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic
- **Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer
- **Performance:** ⚡ Good | **Accessibility:** ◐ Ensure WCAG

### Colors
| Role | Hex |
|------|-----|
| Primary | #7C3AED |
| Secondary | #A78BFA |
| CTA | #F97316 |
| Background | #FAF5FF |
| Text | #4C1D95 |

*Notes: Event theme colors + Excitement accents*

### Typography
- **Heading:** Bebas Neue
- **Body:** Source Sans 3
- **Mood:** bold, impactful, strong, dramatic, modern, headlines
- **Best For:** Marketing sites, portfolios, agencies, event pages, sports
- **Google Fonts:** https://fonts.google.com/share?selection.family=Bebas+Neue|Source+Sans+3:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### Avoid (Anti-patterns)
- Confusing registration
- No countdown

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

