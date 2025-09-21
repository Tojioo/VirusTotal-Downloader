# VirusTotal Downloader Design Guidelines

## Overview

This document defines the design system, UI/UX standards, and development guidelines for the VirusTotal Browser Extension. These guidelines ensure consistency, accessibility, and maintainability across all components.

## Design Philosophy

### Core Principles

1. **Consistency** - Unified visual language across all sections
2. **Clarity** - Clear information hierarchy and readable typography
3. **Accessibility** - WCAG AA compliance for all users
4. **Efficiency** - Minimal cognitive load and intuitive interactions
5. **Reliability** - Robust cross-browser compatibility (Yes. I know...)

### Visual Design Language

- **Modern Card-Based Layout** - Clean, elevated sections with consistent spacing
- **Material Design Influences** - Subtle shadows, rounded corners, smooth transitions
- **Professional Aesthetic** - Business-appropriate colors and typography
- **Scalable Design** - Works within popup constraints (350px width)

## Color Palette

### Primary Colors

```css
/* Brand Colors */
--vt-primary: #007bff;        /* Primary blue for buttons, links */
--vt-primary-hover: #0056b3;  /* Hover state for primary elements */
--vt-primary-light: #e3f2fd;  /* Light blue backgrounds */

/* Success/Active States */
--vt-success: #28a745;        /* Toggle switches, positive actions */
--vt-success-light: #e8f5e8;  /* Success backgrounds */

/* Secondary Colors */
--vt-secondary: #6c757d;      /* Secondary text, descriptions */
--vt-muted: #adb5bd;          /* Muted text, placeholders */
```

### Semantic Colors

```css
/* Status Colors */
--vt-warning: #ffc107;        /* Warning states, progress bars */
--vt-danger: #dc3545;         /* Error states, critical actions */
--vt-info: #17a2b8;           /* Informational elements */

/* File Type Colors */
--vt-file-image: #2196f3;     /* Blue for images */
--vt-file-video: #9c27b0;     /* Purple for videos */
--vt-file-audio: #4caf50;     /* Green for audio */
--vt-file-document: #ff9800;  /* Orange for documents */
--vt-file-archive: #795548;   /* Brown for archives */
--vt-file-executable: #f44336; /* Red for executables */
--vt-file-web: #3f51b5;       /* Indigo for web files */
--vt-file-spreadsheet: #009688; /* Teal for spreadsheets */
```

### Light Theme Colors

```css
/* Backgrounds */
--vt-bg-primary: #f8f9fa;     /* Main background */
--vt-bg-secondary: #ffffff;   /* Card backgrounds */
--vt-bg-tertiary: #e9ecef;    /* Hover states */

/* Borders */
--vt-border-light: #e9ecef;   /* Primary borders */
--vt-border-medium: #dee2e6;  /* Secondary borders */
--vt-border-dark: #adb5bd;    /* Emphasis borders */

/* Text */
--vt-text-primary: #2c3e50;   /* Primary text */
--vt-text-secondary: #6c757d; /* Secondary text */
--vt-text-muted: #868e96;     /* Muted text */
```

### Dark Theme Colors

```css
/* Backgrounds */
--vt-dark-bg-primary: #1a1a1a;    /* Main background */
--vt-dark-bg-secondary: #2d2d2d;  /* Card backgrounds */
--vt-dark-bg-tertiary: #404040;   /* Hover states */

/* Borders */
--vt-dark-border-light: #444;     /* Primary borders */
--vt-dark-border-medium: #555;    /* Secondary borders */
--vt-dark-border-dark: #666;      /* Emphasis borders */

/* Text */
--vt-dark-text-primary: #f8f9fa;  /* Primary text */
--vt-dark-text-secondary: #e0e0e0; /* Secondary text */
--vt-dark-text-muted: #adb5bd;    /* Muted text */
```

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale

```css
/* Headers */
h1: 18px, font-weight: 400, color: #333
h2: 14px, font-weight: 600, color: #666, text-transform: uppercase

/* Body Text */
.title: 13px, font-weight: 600, color: #2c3e50
.description: 11px, font-weight: 400, color: #6c757d
.body: 12px, font-weight: 400, color: #495057

/* Special Text */
.monospace: 13px, font-family: 'Courier New', monospace (API keys)
.status: 11px, font-weight: 500 (toggle states)
.usage: 11px, font-weight: 600 (quota numbers)
```

### Line Heights

- **Headers**: 1.2
- **Body text**: 1.4
- **Descriptions**: 1.3

## Component Standards

### Card-Based Layouts

All sections use consistent card-based layouts with these specifications:

```css
.card-item {
    padding: 12px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    transition: background-color 0.2s ease;
}

.card-item:hover {
    background: #e9ecef;
}

.card-item:last-child {
    margin-bottom: 0;
}
```

### Information Hierarchy

Each card follows this structure:

1. **Info Section**
   - Title: Primary information (13px, font-weight: 600)
   - Description: Secondary information (11px, font-weight: 400)

2. **Control/Stats Section**
   - Interactive elements or data display
   - Right-aligned for settings, specific layout for other sections

### Toggle Switches

Standardized toggle design across all settings:

```css
.toggle-switch {
    width: 44px;
    height: 22px;
    background-color: #ddd;
    border-radius: 11px;
    border: 1px solid #ccc;
    transition: all 0.3s ease;
}

.toggle-switch.active {
    background-color: #28a745;
    border-color: #28a745;
}

.toggle-slider {
    width: 18px;
    height: 18px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.3s ease;
}
```

### Input Fields

Enhanced input styling for better UX:

```css
.enhanced-input {
    padding: 10px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 13px;
    background: #fff;
    transition: all 0.2s ease;
}

.enhanced-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
}
```

### Progress Bars

Consistent progress bar styling:

```css
.progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #007bff;
    border-radius: 3px;
    transition: width 0.3s ease;
}
```

### Buttons

Button hierarchy and styling:

```css
/* Primary Button */
.btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

/* Small Button */
.btn-small {
    padding: 4px 8px;
    font-size: 11px;
}

/* Icon Button */
.icon-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: all 0.2s ease;
}
```

## File Type Icon System

### Design Principles

1. **Consistent Size**: All icons are 16x16px
2. **Color Coding**: Each file type has a distinct color theme
3. **SVG Format**: Scalable and crisp at all resolutions
4. **Recognizable Shapes**: Clear visual metaphors for each type

### Icon Categories

| Category | Color Theme | Files |
|----------|-------------|--------|
| Images | Blue (#2196f3) | jpg, png, gif, svg, etc. |
| Videos | Purple (#9c27b0) | mp4, avi, mov, mkv, etc. |
| Audio | Green (#4caf50) | mp3, wav, flac, m4a, etc. |
| Documents | Orange (#ff9800) | pdf, doc, docx, txt, etc. |
| Spreadsheets | Teal (#009688) | xls, xlsx, csv, ods, etc. |
| Presentations | Red (#f44336) | ppt, pptx, odp, etc. |
| Archives | Brown (#795548) | zip, rar, 7z, tar, etc. |
| Executables | Red (#f44336) | exe, msi, deb, dmg, etc. |
| Web Files | Indigo (#3f51b5) | html, css, js, json, etc. |
| Default | Gray (#9e9e9e) | Unknown file types |

## Spacing System

### Base Unit: 4px

All spacing uses multiples of 4px for consistency:

```css
/* Spacing Scale */
--spacing-xs: 4px;   /* 1 unit */
--spacing-sm: 8px;   /* 2 units */
--spacing-md: 12px;  /* 3 units */
--spacing-lg: 16px;  /* 4 units */
--spacing-xl: 20px;  /* 5 units */
--spacing-xxl: 24px; /* 6 units */
```

### Application

- **Card padding**: 12px
- **Section margins**: 15px (legacy), moving to 16px
- **Element gaps**: 8px
- **Button padding**: 8px horizontal, 4px vertical (small)
- **Input padding**: 10px vertical, 12px horizontal

## Animation & Transitions

### Standard Transitions

```css
/* Default transition for most elements */
transition: all 0.2s ease;

/* Longer transitions for complex animations */
transition: all 0.3s ease;

/* Specific property transitions */
transition: background-color 0.2s ease;
transition: transform 0.3s ease;
transition: max-height 0.3s ease;
```

### Animation Guidelines

1. **Subtle and Purposeful** - Animations should enhance, not distract
2. **Consistent Duration** - Use standard 0.2s for simple, 0.3s for complex
3. **Easing** - Use 'ease' for natural feeling transitions
4. **Performance** - Prefer transform and opacity changes over layout changes

## Accessibility Standards

### WCAG AA Compliance

#### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear focus indicators

#### Keyboard Navigation

```css
/* Focus indicators */
:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}

/* Custom focus styles for specific elements */
.btn:focus {
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}
```

#### Screen Reader Support

```html
<!-- ARIA labels for interactive elements -->
<button aria-label="Show scan report" title="Show Report">
    <!-- Icon content -->
</button>

<!-- Status updates for dynamic content -->
<div role="status" aria-live="polite">
    <!-- Status messages -->
</div>
```

### Inclusive Design

1. **Sufficient Color Contrast** - All text meets WCAG AA standards
2. **Multiple Information Channels** - Don't rely solely on color
3. **Keyboard Accessibility** - All functions available via keyboard
4. **Screen Reader Compatibility** - Proper semantic HTML and ARIA labels
5. **Clear Focus Indicators** - Visible focus states for all interactive elements

## Dark Mode Implementation

### Automatic Theme Detection

The extension respects user preference but allows manual override:

```css
/* Automatic dark mode detection */
@media (prefers-color-scheme: dark) {
    /* Dark mode styles */
}

/* Manual override */
body.dark-mode {
    /* Dark mode styles */
}
```

### Color Adaptation

Dark mode follows these principles:

1. **Inverted Backgrounds** - Light backgrounds become dark
2. **Maintained Contrast** - Text remains readable
3. **Consistent Brand Colors** - Primary colors remain recognizable
4. **Subtle Adjustments** - Some colors are slightly adjusted for dark backgrounds

## Cross-Browser Compatibility

### Tested Browsers

- **Google Chrome** - Primary development and testing
- **Microsoft Edge** - Special focus on section state management
- **Mozilla Firefox** - Cross-platform compatibility validation

### Edge Browser Considerations

Special attention to timing-related issues:

```javascript
// Enhanced DOM ready checks for Edge
await new Promise(resolve => {
    if (document.readyState === 'complete') {
        resolve();
    } else {
        window.addEventListener('load', resolve);
    }
});

// Longer delays for Edge compatibility
await new Promise(resolve => setTimeout(resolve, 250));
```

## Performance Guidelines

### CSS Performance

1. **Avoid Complex Selectors** - Use classes over complex hierarchies
2. **Minimize Repaints** - Use transform and opacity for animations
3. **Efficient Transitions** - Specify exact properties when possible

### JavaScript Performance

1. **Debounced Updates** - Batch DOM updates when possible
2. **Event Delegation** - Use event delegation for dynamic content
3. **Memory Management** - Clean up observers and timeouts

## Development Workflow

### Code Organization

```
src/
├── popup.html          # Main popup structure and styles
├── popup.js           # Popup functionality and UI logic
├── background.js      # Service worker and API logic
└── report.html        # Custom report page
```

### CSS Structure

1. **Reset and Base Styles** - Consistent foundation
2. **Component Styles** - Reusable component classes
3. **Layout Styles** - Section and container layouts
4. **Theme Styles** - Light and dark mode variations
5. **Responsive Styles** - Popup constraint handling

### Testing Checklist

Before releasing updates:

1. ✅ Cross-browser testing (Chrome, Edge, Firefox)
2. ✅ Dark mode validation
3. ✅ Accessibility compliance check
4. ✅ Responsive design verification
5. ✅ Performance impact assessment
6. ✅ Edge case handling (long filenames, empty states)

## Version History

### v1.0.0 - Initial Design System

- Established card-based layout system
- Implemented unified color palette
- Created comprehensive file type icon system
- Added robust dark mode support
- Enhanced Edge browser compatibility
- Established accessibility standards

## Future Enhancements

### Planned Improvements

1. **Animation Library** - Micro-interactions for better UX
2. **Theme Customization** - User-selectable color themes
3. **Responsive Breakpoints** - Support for different popup sizes
4. **Component Library** - Reusable UI component system
5. **A11y Enhancements** - Advanced accessibility features

### Design Evolution

The design system will evolve based on:

- User feedback and usability testing
- New browser capabilities and standards
- Accessibility guideline updates
- Performance optimization opportunities

---

## Questions or Contributions?

For questions about these guidelines or suggestions for improvements, please refer to the project documentation or create an issue in the project repository.

## Risk Assessment UI Components (v1.1.0)

### Overview

Version 1.1.0 introduces intelligent risk assessment capabilities with visual indicators and user controls. The design system extends existing components to support risk-based download prevention.

### Risk Level Color Scheme

**Risk Assessment Colors:**
- **Clean/Safe**: Green (#28a745) - Files with no detections
- **Low Risk**: Yellow (#ffc107) - Files detected by 3+ engines  
- **Medium Risk**: Orange (#fd7e14) - Files detected by 2+ engines
- **High Risk**: Red (#dc3545) - Files detected by 1+ engine
- **Paranoid Mode**: Purple (#6f42c1) - Files with any suspicious indicators

### Risk Threshold Settings

**New Settings Section Components:**
- Risk threshold selector with radio buttons or dropdown
- Visual preview of selected risk level with color coding
- Description text explaining each threshold level
- Toggle for enabling/disabling risk-based prevention

### Risk Indicators

**Visual Risk Communication:**
- Risk percentage badges in scan history items
- Color-coded borders and backgrounds for risk levels
- Progress bars showing risk scores (0-100%)
- Warning icons for high-risk files

### Warning Dialogs

**Risk Warning Modal Design:**
- Modal overlay with backdrop blur
- Clear risk level indicator with appropriate color
- Detailed explanation of detected threats
- "Download Anyway" and "Cancel" action buttons
- Educational content about risk factors

### Enhanced Scan Reports

**Risk Assessment Integration:**
- Risk score display in report headers
- Contributing factors breakdown
- Engine consensus visualization
- Recommendation actions based on risk level

### Whitelist/Blacklist Management

**Trust Management Interface:**
- Domain whitelist input with validation
- File type filter checkboxes
- Hash-based exception management
- Temporary override controls with time limits

### Accessibility Enhancements

**Risk Assessment Accessibility:**
- Screen reader announcements for risk levels
- High contrast mode support for color-blind users
- Keyboard navigation for all risk controls
- ARIA labels for risk indicators and warnings

**Last Updated**: 2025-09-21  
**Version**: 1.1.0 (Preparation)  
**Maintainers**: Tojioo