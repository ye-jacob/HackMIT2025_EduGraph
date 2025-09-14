# EduGraph Project Structure Documentation

This document explains the purpose and contribution of each file in the EduGraph project - an interactive educational video analysis platform.

## Root Directory Files

### Configuration Files

#### `package.json`
- **Purpose**: Defines project metadata, dependencies, and build scripts
- **Key Dependencies**: 
  - React 18 for the UI framework
  - D3.js for graph visualization
  - Radix UI for accessible components
  - Tailwind CSS for styling
  - Vite for build tooling
- **Scripts**: Development server, production build, linting, and preview commands

#### `package-lock.json`
- **Purpose**: Locks exact dependency versions for reproducible builds
- **Contribution**: Ensures all developers and deployments use identical dependency versions

#### `vite.config.ts`
- **Purpose**: Vite build tool configuration
- **Features**: 
  - React plugin for JSX/TSX support
  - Path aliases (`@/` maps to `src/`)
  - Development server settings (port 8080, host binding)
  - Lovable tagger for development mode

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Settings**: 
  - ES2020 target with modern features
  - Strict type checking enabled
  - Path mapping for `@/*` imports
  - React JSX support

#### `tsconfig.node.json`
- **Purpose**: TypeScript configuration for Node.js build tools
- **Contribution**: Ensures build scripts and config files are properly typed

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS configuration with custom design system
- **Features**:
  - Custom color tokens using CSS variables
  - Dark mode support
  - Custom animations (pulse-node for graph interactions)
  - Responsive breakpoints and container settings

#### `postcss.config.js`
- **Purpose**: PostCSS configuration for CSS processing
- **Plugins**: Tailwind CSS and Autoprefixer for vendor prefixes

#### `components.json`
- **Purpose**: shadcn/ui component library configuration
- **Settings**: Defines component paths, styling approach, and aliases

### HTML Entry Point

#### `index.html`
- **Purpose**: Main HTML template for the React application
- **Features**:
  - SEO meta tags for "EduGraph - Interactive Video Learning"
  - Viewport configuration for responsive design
  - Root div where React app mounts
  - Module script loading for Vite

### Documentation & Legal

#### `README.md`
- **Purpose**: Comprehensive project documentation
- **Content**: Setup instructions, feature descriptions, tech stack, troubleshooting

#### `LICENSE`
- **Purpose**: MIT license for open source distribution

#### `.gitignore`
- **Purpose**: Specifies files to exclude from version control
- **Typical exclusions**: node_modules, build outputs, environment files

## Source Code Structure (`src/`)

### Entry Points

#### `main.tsx`
- **Purpose**: React application entry point
- **Function**: 
  - Creates React root and renders App component
  - Imports global CSS styles
  - Enables React StrictMode for development warnings

#### `App.tsx`
- **Purpose**: Root React component
- **Function**: 
  - Provides main app layout with background styling
  - Renders the EduGraph component (main application)

#### `index.css`
- **Purpose**: Global styles and CSS custom properties
- **Content**: 
  - Tailwind CSS imports
  - CSS variables for design system colors
  - Base styles for consistent theming
  - Video player optimizations for smooth rendering

### Utility Functions

#### `lib/utils.ts`
- **Purpose**: Shared utility functions
- **Typical functions**: 
  - CSS class name merging (clsx/tailwind-merge)
  - Common helper functions used across components

### Main Components (`src/components/`)

#### `EduGraph.tsx`
- **Purpose**: Main application component orchestrating the entire experience
- **Function**: 
  - Manages overall application state
  - Coordinates between video player, knowledge graph, and timeline
  - Handles video upload and concept extraction workflow
  - Optimized concept updates to prevent excessive re-renders

#### `VideoUpload.tsx`
- **Purpose**: File upload interface for educational videos
- **Features**:
  - Drag-and-drop file upload
  - File validation and format checking
  - Progress indicators during upload
  - Integration with video processing pipeline

#### `VideoPlayer.tsx`
- **Purpose**: Custom video player with enhanced controls
- **Features**:
  - Standard video controls (play, pause, seek, volume)
  - Integration with concept timeline
  - Synchronized playback with knowledge graph
  - Responsive design for different screen sizes
  - Optimized for smooth playback with throttled updates and hardware acceleration

#### `KnowledgeGraph.tsx`
- **Purpose**: Interactive D3.js-powered concept visualization
- **Features**:
  - Node-based graph showing concept relationships
  - Interactive node clicking to navigate video
  - Different node types (definitions, examples, applications, prerequisites)
  - Zoom and pan functionality
  - Visual feedback for active concepts

#### `ConceptTimeline.tsx`
- **Purpose**: Timeline navigation integrated with video progress
- **Features**:
  - Concept markers embedded in video progress bar
  - Click-to-navigate functionality
  - Visual indicators for concept timestamps
  - Synchronized with video playback

#### `ConceptPanel.tsx`
- **Purpose**: Detailed information display for selected concepts
- **Features**:
  - Concept definitions and descriptions
  - Related concepts and relationships
  - Timestamp information
  - Navigation controls

#### `Header.tsx`
- **Purpose**: Application header with branding and navigation
- **Features**:
  - App title and logo
  - User interface controls
  - Responsive navigation elements

### UI Component Library (`src/components/ui/`)

These are reusable UI components built with Radix UI primitives and styled with Tailwind CSS:

#### `button.tsx`
- **Purpose**: Customizable button component with variants
- **Features**: Different sizes, colors, and states

#### `input.tsx`
- **Purpose**: Styled input field component
- **Features**: Consistent styling and focus states

#### `card.tsx`
- **Purpose**: Container component for content sections
- **Features**: Header, content, and footer sections

#### `progress.tsx`
- **Purpose**: Progress bar component
- **Usage**: Video loading, upload progress, concept completion

#### `badge.tsx`
- **Purpose**: Small status or category indicators
- **Usage**: Concept types, video status, tags

#### `separator.tsx`
- **Purpose**: Visual divider between content sections

#### `sheet.tsx`
- **Purpose**: Slide-out panel component
- **Usage**: Sidebar panels, concept details, settings

#### `sidebar.tsx`
- **Purpose**: Collapsible sidebar container
- **Usage**: Main navigation, knowledge graph panel

#### `tooltip.tsx`
- **Purpose**: Hover information display
- **Usage**: Concept explanations, button descriptions

#### `skeleton.tsx`
- **Purpose**: Loading state placeholders
- **Usage**: Content loading animations

## Build Output

### `node_modules/`
- **Purpose**: Installed npm dependencies
- **Note**: Excluded from version control, recreated via `npm install`

### `dist/` (generated)
- **Purpose**: Production build output
- **Content**: Optimized, bundled JavaScript, CSS, and assets
- **Generated by**: `npm run build`

## Development Workflow

1. **Development**: `npm run dev` starts Vite dev server with hot reloading
2. **Building**: `npm run build` creates production-ready files
3. **Linting**: `npm run lint` checks code quality with ESLint
4. **Preview**: `npm run preview` serves production build locally

## Key Architectural Patterns

- **Component Composition**: Modular React components with clear responsibilities
- **State Management**: React hooks for local state, props for data flow
- **Styling**: Tailwind CSS with custom design system tokens
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Performance**: Vite for fast builds, D3.js for efficient graph rendering
- **Video Optimization**: Hardware acceleration, throttled updates, and smooth rendering

## Performance Optimizations

### Video Playback
- **Throttled Updates**: Time updates limited to 100ms intervals to prevent excessive re-renders
- **Hardware Acceleration**: CSS transforms and GPU rendering for smooth video playback
- **Smart State Updates**: Only update concept states when significant changes occur
- **Optimized Rendering**: CSS containment and will-change properties for better performance

### Component Rendering
- **Memoization**: useCallback and useMemo for expensive operations
- **Conditional Updates**: Skip unnecessary re-renders when state hasn't meaningfully changed
- **Event Optimization**: Proper event listener cleanup and throttling

This structure supports a scalable, maintainable educational technology application focused on interactive video learning and concept visualization with optimized performance for smooth user experience.