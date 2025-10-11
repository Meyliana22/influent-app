# Influent App - Components Documentation

## 📁 Project Structure (Refactored)

```
src/
├── components/
│   └── common/           # Reusable UI components
│       ├── Button.js
│       ├── Input.js
│       ├── Card.js
│       ├── Navbar.js
│       ├── Modal.js
│       ├── Alert.js
│       ├── Loading.js
│       ├── StatCard.js
│       └── index.js
├── constants/
│   ├── colors.js         # Color palette and theme
│   └── styles.js         # Common style objects
├── utils/
│   └── helpers.js        # Helper functions (format, validation, etc.)
└── pages/                # Page components
```

## 🎨 Design System

### Colors (`src/constants/colors.js`)

```javascript
import { COLORS } from '../constants/colors';

// Primary Colors
COLORS.primary           // #667eea
COLORS.primaryDark       // #764ba2
COLORS.primaryLight      // #f0f4ff

// Gradients
COLORS.gradientPrimary   // linear-gradient(135deg, #667eea 0%, #764ba2 100%)
COLORS.gradientSecondary // linear-gradient(135deg, #f093fb 0%, #f5576c 100%)

// Text Colors
COLORS.textPrimary       // #2d3748
COLORS.textSecondary     // #6c757d
COLORS.textWhite         // #fff

// Status Colors
COLORS.success, successLight, successDark
COLORS.warning, warningLight, warningDark
COLORS.danger, dangerLight, dangerDark
COLORS.info, infoLight, infoDark
```

## 🧩 Component Library

### 1. Button Component

**Location:** `src/components/common/Button.js`

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `fullWidth`: boolean (default: false)
- `disabled`: boolean (default: false)
- `onClick`: function
- `children`: React.ReactNode
- `style`: object (additional inline styles)

**Usage:**
```javascript
import { Button } from '../../components/common';

<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" fullWidth>
  Full Width Button
</Button>

<Button variant="danger" disabled>
  Disabled Button
</Button>
```

### 2. Input Component

**Location:** `src/components/common/Input.js`

**Props:**
- `type`: string (default: 'text')
- `label`: string
- `placeholder`: string
- `value`: string
- `onChange`: function
- `required`: boolean (default: false)
- `disabled`: boolean (default: false)
- `error`: string (error message)
- `style`: object

**Usage:**
```javascript
import { Input } from '../../components/common';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  error={emailError}
/>
```

### 3. Card Component

**Location:** `src/components/common/Card.js`

**Props:**
- `children`: React.ReactNode
- `padding`: 'small' | 'medium' | 'large' (default: 'medium')
- `hoverable`: boolean (default: false) - adds hover effect
- `onClick`: function
- `style`: object

**Usage:**
```javascript
import { Card } from '../../components/common';

<Card padding="large" hoverable onClick={handleCardClick}>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### 4. Navbar Component

**Location:** `src/components/common/Navbar.js`

**Props:**
- `userType`: 'umkm' | 'student' (default: 'umkm')
- `showAuth`: boolean (default: false) - shows login/register buttons

**Usage:**
```javascript
import { Navbar } from '../../components/common';

// For UMKM users (shows Campaign, Applications links)
<Navbar userType="umkm" />

// For Student users (shows Explore, Dashboard links)
<Navbar userType="student" />

// Landing page (shows auth buttons)
<Navbar showAuth />
```

### 5. Modal Component

**Location:** `src/components/common/Modal.js`

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string
- `children`: React.ReactNode
- `onConfirm`: function
- `confirmText`: string (default: 'Konfirmasi')
- `cancelText`: string (default: 'Batal')
- `variant`: 'default' | 'danger' | 'success' (default: 'default')
- `showActions`: boolean (default: true)

**Usage:**
```javascript
import { Modal } from '../../components/common';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Delete"
  variant="danger"
  onConfirm={handleDelete}
  confirmText="Delete"
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
```

### 6. Alert Component

**Location:** `src/components/common/Alert.js`

**Props:**
- `show`: boolean (required)
- `message`: string (required)
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'success')
- `duration`: number (ms, 0 = no auto-hide) (default: 3000)
- `onClose`: function
- `position`: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'

**Usage:**
```javascript
import { Alert } from '../../components/common';

<Alert
  show={showAlert}
  message="Campaign saved successfully!"
  type="success"
  duration={3000}
  onClose={() => setShowAlert(false)}
/>
```

### 7. Loading Component

**Location:** `src/components/common/Loading.js`

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `text`: string (optional loading text)
- `fullScreen`: boolean (default: false)

**Usage:**
```javascript
import { Loading } from '../../components/common';

// Simple loading spinner
<Loading size="medium" />

// With text
<Loading size="large" text="Loading campaigns..." />

// Full screen overlay
<Loading fullScreen text="Please wait..." />
```

### 8. StatCard Component

**Location:** `src/components/common/StatCard.js`

**Props:**
- `label`: string (required)
- `value`: string | number (required)
- `subtitle`: string
- `variant`: 'primary' | 'white' (default: 'white')
- `valueColor`: string (custom color for value)

**Usage:**
```javascript
import { StatCard } from '../../components/common';

<StatCard
  variant="primary"
  label="Total Revenue"
  value="Rp 10,000,000"
  subtitle="20 transactions"
/>

<StatCard
  label="Pending Orders"
  value={15}
  valueColor={COLORS.warningDark}
  subtitle="Awaiting approval"
/>
```

## 🛠 Utility Functions

### Helper Functions (`src/utils/helpers.js`)

```javascript
import { 
  formatCurrency, 
  formatDate, 
  formatDateShort,
  getTimeAgo,
  truncateText,
  isValidEmail,
  isValidPhone 
} from '../utils/helpers';

// Format currency to IDR
formatCurrency(500000) // "Rp 500.000"

// Format date
formatDate('2024-10-01') // "1 Oktober 2024"
formatDateShort('2024-10-01') // "1 Okt 2024"

// Get time ago
getTimeAgo('2024-10-08') // "3 hari yang lalu"

// Truncate text
truncateText('Long text here...', 50) // "Long text here..."

// Validate email
isValidEmail('test@example.com') // true

// Validate phone (Indonesian)
isValidPhone('081234567890') // true
```

## 📝 Migration Guide

### Before (Inline Styles):
```javascript
<div style={{
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
}}>
  <button style={{
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer'
  }} onClick={handleClick}>
    Click Me
  </button>
</div>
```

### After (With Components):
```javascript
import { Card, Button } from '../../components/common';

<Card>
  <Button variant="primary" onClick={handleClick}>
    Click Me
  </Button>
</Card>
```

## ✅ Benefits of Refactoring

1. **Code Reusability** - Components can be used across multiple pages
2. **Consistency** - Same look and feel throughout the app
3. **Maintainability** - Change once, update everywhere
4. **Readability** - Cleaner and more semantic code
5. **Type Safety** - Props documentation and validation
6. **Performance** - Optimized components with proper memoization
7. **Scalability** - Easy to extend and add new features

## 🎯 Next Steps

- [ ] Refactor remaining pages to use new components
- [ ] Add PropTypes or TypeScript for type checking
- [ ] Add unit tests for components
- [ ] Create Storybook for component documentation
- [ ] Implement theme context for dark mode support
- [ ] Add accessibility (a11y) improvements
- [ ] Optimize bundle size with code splitting

## 📚 References

- React Best Practices: https://react.dev/learn
- Component Design Patterns: https://reactpatterns.com/
- Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
