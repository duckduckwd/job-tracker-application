# Bundle Optimization Plan

**Current State:** All components loaded upfront, no code splitting  
**Target:** Optimized bundle with lazy loading and route-based splitting  
**Priority:** High (P1)  
**Estimated Effort:** 1-2 days

---

## 🔍 Current Bundle Analysis

### ✅ What's Working

- Bundle analyzer configured (`@next/bundle-analyzer`)
- Performance budgets set (250KB assets, 400KB entrypoints)
- Bundle size checking script in place
- Webpack performance hints enabled

### ❌ Critical Issues

- **No code splitting** - All components loaded on initial page load
- **Large form component** - JobApplicationForm loads all sections upfront
- **Unused imports** - Components imported but not used on every page
- **No lazy loading** - Heavy components loaded immediately
- **Missing route optimization** - No page-level code splitting

---

## 🎯 Phase 1: Route-Based Code Splitting (Day 1)

### Priority 1: Page-Level Lazy Loading

**Current Issue:** All pages loaded in main bundle

**Implementation:**

```typescript
// src/app/job-applications/new/page.tsx
import { lazy, Suspense } from 'react';
import { JobApplicationFormSkeleton } from '~/features/job-applications';

const JobApplicationDetails = lazy(() =>
  import('~/features/job-applications').then(module => ({
    default: module.JobApplicationDetails
  }))
);

export default function NewJobApplication() {
  return (
    <div className="flex min-h-screen items-center justify-center px-8 py-8">
      <Suspense fallback={<JobApplicationFormSkeleton />}>
        <JobApplicationDetails />
      </Suspense>
    </div>
  );
}
```

### Priority 2: Component-Level Code Splitting

**Files to Optimize:**

```
src/features/job-applications/components/
├── JobApplicationDetails.tsx (already has lazy loading)
├── job-application/JobApplicationForm.tsx (enhance)
└── job-application/JobApplicationSections.tsx (split sections)
```

**Implementation:**

```typescript
// src/features/job-applications/components/job-application/JobApplicationSections.tsx
import { lazy, Suspense } from 'react';

const TimelineSection = lazy(() => import('./sections/TimelineSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));

export const JobApplicationSections = memo(() => (
  <>
    <CollapsibleSection sectionTitle={sectionTitles.role} rootProps={{ defaultOpen: true }}>
      <FormSectionWrapper legend="Role Details" fields={jobDetailsFields} />
    </CollapsibleSection>

    <CollapsibleSection sectionTitle={sectionTitles.timeline}>
      <Suspense fallback={<SectionSkeleton />}>
        <TimelineSection />
      </Suspense>
    </CollapsibleSection>

    <CollapsibleSection sectionTitle={sectionTitles.contact}>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
    </CollapsibleSection>
  </>
));
```

---

## 🎯 Phase 2: Dynamic Imports & Tree Shaking (Day 1-2)

### Priority 3: Library Optimization

**Current Issue:** Large libraries loaded upfront

**Files to Create:**

```
src/lib/dynamic/
├── icons.ts
├── charts.ts
└── forms.ts
```

**Implementation:**

```typescript
// src/lib/dynamic/icons.ts
export const loadIcon = (iconName: string) => {
  switch (iconName) {
    case 'chevron-down':
      return import('lucide-react').then(mod => mod.ChevronDown);
    case 'calendar':
      return import('lucide-react').then(mod => mod.Calendar);
    default:
      return import('lucide-react').then(mod => mod.HelpCircle);
  }
};

// src/components/ui/DynamicIcon.tsx
import { lazy, Suspense } from 'react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  const Icon = lazy(() => loadIcon(name));

  return (
    <Suspense fallback={<div className={`${className} animate-pulse bg-gray-200`} />}>
      <Icon className={className} />
    </Suspense>
  );
};
```

### Priority 4: Conditional Loading

**Files to Enhance:**

```
src/components/ui/
├── select.tsx (lazy load options)
├── collapsible.tsx (lazy load content)
└── error-boundary.tsx (lazy load fallback)
```

---

## 🎯 Phase 3: Advanced Optimization (Day 2)

### Priority 5: Bundle Splitting Strategy

**Next.js Config Enhancement:**

```javascript
// next.config.js
const config = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
            forms: {
              test: /[\\/]src[\\/]features[\\/]job-applications[\\/]/,
              name: "job-applications",
              chunks: "all",
            },
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: "ui-components",
              chunks: "all",
            },
          },
        },
      };
    }
    return config;
  },
};
```

### Priority 6: Preloading Strategy

**Files to Create:**

```
src/lib/preload/
├── preload-manager.ts
├── route-preloader.ts
└── component-preloader.ts
```

**Implementation:**

```typescript
// src/lib/preload/preload-manager.ts
export class PreloadManager {
  private preloadedComponents = new Set<string>();

  preloadComponent(componentPath: string) {
    if (this.preloadedComponents.has(componentPath)) return;

    import(componentPath).then(() => {
      this.preloadedComponents.add(componentPath);
    });
  }

  preloadOnHover(element: HTMLElement, componentPath: string) {
    element.addEventListener(
      "mouseenter",
      () => {
        this.preloadComponent(componentPath);
      },
      { once: true },
    );
  }
}
```

---

## 📋 Ongoing Strategy for New Features

### 🎯 Bundle-First Development Approach

#### 1. **Component Creation Checklist**

```typescript
// Before creating any new component, ask:
// 1. Is this component used on every page? → Keep in main bundle
// 2. Is this component large (>50KB)? → Lazy load
// 3. Is this component conditional? → Dynamic import
// 4. Does this component use heavy libraries? → Split library imports

// Example: New dashboard component
// ❌ Bad - loads everything upfront
import { Chart } from "chart.js";
import { DataTable } from "heavy-table-lib";

// ✅ Good - lazy load heavy components
const Chart = lazy(() =>
  import("chart.js").then((m) => ({ default: m.Chart })),
);
const DataTable = lazy(() => import("./DataTable"));
```

#### 2. **Route Planning Strategy**

```typescript
// For each new route, plan bundle strategy:
// 1. Identify critical above-the-fold content
// 2. Lazy load below-the-fold components
// 3. Preload likely next actions
// 4. Split by user journey

// Example: Job listing page
export default function JobListingsPage() {
  return (
    <>
      {/* Critical - load immediately */}
      <JobListingHeader />
      <JobListingFilters />

      {/* Below fold - lazy load */}
      <Suspense fallback={<JobListingSkeleton />}>
        <JobListingTable />
      </Suspense>

      {/* Conditional - dynamic import */}
      {showExportModal && (
        <Suspense fallback={<ModalSkeleton />}>
          <ExportModal />
        </Suspense>
      )}
    </>
  );
}
```

#### 3. **Library Import Strategy**

```typescript
// Always prefer specific imports over barrel imports
// ❌ Bad - imports entire library
import * as Icons from "lucide-react";

// ✅ Good - imports only needed icons
import { ChevronDown, Calendar } from "lucide-react";

// ✅ Better - dynamic imports for conditional use
const loadIcon = (name: string) =>
  import(`lucide-react`).then((mod) => mod[name]);
```

#### 4. **Feature Module Strategy**

```typescript
// Structure features for optimal splitting
src/features/new-feature/
├── index.ts              // Barrel export with lazy loading
├── components/
│   ├── FeatureMain.tsx   // Critical component
│   ├── FeatureModal.tsx  // Lazy loaded
│   └── FeatureChart.tsx  // Dynamic import
├── hooks/
│   └── useFeature.ts     // Always loaded
└── utils/
    └── feature-utils.ts  // Lazy loaded

// index.ts - Smart barrel exports
export { FeatureMain } from './components/FeatureMain';
export const FeatureModal = lazy(() => import('./components/FeatureModal'));
export const FeatureChart = lazy(() => import('./components/FeatureChart'));
```

### 🔄 Continuous Optimization Workflow

#### Daily Development

```bash
# Before committing new features
npm run bundle:check          # Check bundle size limits
npm run analyze              # Analyze bundle composition
npm run unused:check         # Remove unused imports
```

#### Weekly Reviews

```bash
# Bundle health check
npm run bundle:report        # Generate bundle report
npm run perf:audit          # Lighthouse performance audit
npm run deadcode:check      # Remove dead code
```

#### Monthly Optimization

```bash
# Deep bundle analysis
npm run bundle:compare       # Compare with previous month
npm run deps:audit          # Check for lighter alternatives
npm run tree-shake:report   # Identify tree-shaking opportunities
```

### 📊 Bundle Size Targets by Feature

| Feature Type | Initial Load | Lazy Load | Total |
| ------------ | ------------ | --------- | ----- |
| **Forms**    | 50KB         | 150KB     | 200KB |
| **Tables**   | 30KB         | 200KB     | 230KB |
| **Charts**   | 0KB          | 300KB     | 300KB |
| **Modals**   | 10KB         | 100KB     | 110KB |
| **Utils**    | 20KB         | 50KB      | 70KB  |

### 🎯 Performance Budgets by Route

| Route         | Initial Bundle | Total Bundle | LCP Target |
| ------------- | -------------- | ------------ | ---------- |
| **Home**      | 200KB          | 300KB        | <1.5s      |
| **Job Form**  | 250KB          | 400KB        | <2.0s      |
| **Dashboard** | 300KB          | 600KB        | <2.5s      |
| **Reports**   | 200KB          | 800KB        | <3.0s      |

---

## 📋 Implementation Checklist

### Day 1: Core Splitting

- [ ] Implement route-based code splitting for all pages
- [ ] Split JobApplicationSections into lazy-loaded components
- [ ] Add component-level lazy loading for heavy components
- [ ] Create dynamic icon loading system
- [ ] **Target:** 30% reduction in initial bundle size

### Day 2: Advanced Optimization

- [ ] Implement webpack bundle splitting configuration
- [ ] Create preloading system for likely user actions
- [ ] Add conditional loading for modal components
- [ ] Optimize library imports and tree shaking
- [ ] **Target:** 50% reduction in initial bundle size

### Ongoing: Development Strategy

- [ ] Document bundle-first development approach
- [ ] Create component creation checklist
- [ ] Implement automated bundle size monitoring
- [ ] Set up performance budgets for new features
- [ ] **Target:** Maintain optimized bundle as features grow

---

## 🧪 Testing & Validation

### Bundle Size Testing

```bash
# Automated bundle size checks
npm run bundle:check         # Fail CI if limits exceeded
npm run bundle:compare       # Compare with main branch
npm run lighthouse:budget    # Performance budget validation
```

### Performance Testing

```bash
# Real-world performance testing
npm run test:e2e:perf       # E2E performance tests
npm run test:bundle:load    # Bundle loading tests
npm run test:lazy:loading   # Lazy loading functionality
```

### User Experience Testing

```bash
# UX impact validation
npm run test:skeleton       # Loading state tests
npm run test:progressive    # Progressive loading tests
npm run test:offline        # Offline bundle caching
```

---

## 📈 Expected Outcomes

### Immediate Benefits (Week 1)

- **50% faster initial page load** - Reduced bundle size
- **Better perceived performance** - Progressive loading
- **Improved Core Web Vitals** - LCP, FID, CLS optimization

### Medium-term Benefits (Month 1)

- **Scalable architecture** - Bundle size doesn't grow linearly with features
- **Better user experience** - Faster navigation and interactions
- **Reduced bandwidth usage** - Especially important for mobile users

### Long-term Benefits (Quarter 1)

- **Maintainable performance** - Bundle optimization becomes automatic
- **Better SEO scores** - Improved performance metrics
- **Reduced hosting costs** - Smaller bundle sizes and better caching

**Total Estimated Effort:** 1-2 days initial + ongoing strategy  
**ROI:** Critical for user experience and scalability
