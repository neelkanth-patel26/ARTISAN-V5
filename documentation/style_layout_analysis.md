# Artisan Project Style & Layout Analysis

This document outlines the core styling and layout architecture of the Artisan project.

## 1. Core Styling Approach

The project utilizes a modern, utility-first styling stack optimized for rapid UI development and high customizability.

*   **Frameworks:** **Tailwind CSS** is the primary styling tool. 
*   **Component Library:** It heavily leverages **shadcn/ui** for pre-built, accessible components. You can see a comprehensive set of 50 components (Accordion, Dialog, Sidebar, Table, etc.) located in `components/ui/`.
*   **Utility-First:** Standard styling uses Tailwind utility classes (`bg-black`, `text-white`, `flex`, `grid`, etc.).
*   **Custom CSS:** `app/globals.css` is used for defining CSS variables, custom font-faces, and global structural rules (especially for PWA behaviors).

## 2. Theming & Design System

The application uses a robust design system built on CSS variables, heavily leaning towards a premium, dark aesthetic.

*   **Dark Mode by Default:** The root layout (`app/layout.tsx`) hardcodes `className="dark"`, forcing the application into dark mode.
*   **Color Palette (HSL Variables):** Colors are defined in `app/globals.css` using HSL variables. The dark theme is characterized by:
    *   **Background:** Very deep gray/black (`--background: 0 0% 3.9%`, which is `#0a0a0a`) or pure black (`#050505` set in body rules).
    *   **Foreground/Text:** High contrast white (`--foreground: 0 0% 98%`).
    *   **Accents:** Custom chart colors and specific secondary hues are defined, with subtle borders.
*   **Visual Effects:** Custom utilities like `.neon-ring` and `.grid-divider` indicate a modern, slightly futuristic, or high-end design aesthetic.

## 3. Typography

The typography strategy is a mix of reliable Google Fonts and custom, stylized local fonts, aimed at creating an "artistic" and premium feel.

*   **Google Fonts (`app/layout.tsx`):**
    *   `Playfair_Display`: A classic, elegant serif font used for primary headings and emphasis.
    *   `Lora`: A well-balanced serif used for body copy or secondary text.
*   **Custom Fonts (`app/globals.css`):**
    *   `ForestSmooth`
    *   `Oughter`
    *   `CaviarDreams` (Set as the default `body` font family).

## 4. Layout Architecture

The application structure is built on Next.js App Router and utilizes distinct layout patterns for different areas of the app.

*   **Global Root Layout (`app/layout.tsx`):** Acts as the foundational wrapper. It injects:
    *   Global typography CSS variables.
    *   **Security/Utility overlays:** `<DevToolsBlocker />` (source code protection).
    *   **PWA Integrations:** `<ServiceWorkerRegistration />`, `<PWAFullscreenManager />`, `<NativePermissionsRequester />`.
    *   **Notifications:** `<Toaster />` from the `sonner` library.
*   **Landing Page (`app/page.tsx`):**
    *   Uses a custom **Full-Screen Section Scrolling** mechanism (similar to fullPage.js).
    *   Instead of standard scrolling, desktop users transition between full-viewport sections (`HeroSection`, `CollectionSection`, etc.) using a transform (`translateY`).
    *   It dynamically detects the device (mobile, desktop, PWA) to adjust the scrolling behavior and the specific sections rendered.
*   **Dashboard Layouts (`app/dashboard/*`):**
    *   Divided by user roles: `admin`, `artist`, `collector`.
    *   These areas likely utilize the extensive `Sidebar` component found in `components/ui/sidebar.tsx` for complex, nested navigation, moving away from the full-screen scroll of the landing page.

## 5. PWA & Mobile-First Optimizations

A significant portion of the styling and layout is dedicated to making the app feel like a native mobile application.

*   **Safe Areas:** Uses `env(safe-area-inset-*)` extensively to ensure content doesn't clash with notches or system UI on mobile devices.
*   **Scroll & Bounce Prevention:** The CSS explicitly disables default browser overscroll behavior (`overscroll-behavior: none`) and hides scrollbars (`scrollbar-width: none`) to simulate a native app feel.
*   **Orientation Locking:** `app/page.tsx` contains logic to detect if a tablet is in landscape mode and displays a full-screen overlay forcing the user to rotate to portrait.
*   **Touch Optimizations:** Disables text selection (`user-select: none`) and link preview tooltips, and removes tap highlight colors to make buttons feel native.
