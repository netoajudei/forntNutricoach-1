# NutriCoach AI - Design Guidelines

## Design Approach
**Reference-Based Approach** - Modern HealthTech/SaaS aesthetic combining Notion's clean layouts + Linear's typography precision + Stripe's glassmorphism treatments. The design emphasizes wellness-tech fusion with dynamic, conversion-optimized elements.

## Core Design Elements

### Typography
- **Primary Font**: Inter or Plus Jakarta Sans (geometric, modern sans-serif)
- **Hierarchy**:
  - H1 (Hero): Bold, 3.5rem desktop / 2.5rem mobile
  - H2 (Section titles): Semibold, 2.5rem desktop / 1.875rem mobile
  - H3 (Card titles): Semibold, 1.5rem
  - Body: Regular, 1rem with 1.6 line-height
  - CTA buttons: Semibold, 1.125rem

### Layout System
- **Spacing primitives**: Tailwind units of 4, 6, 8, 12, 16, 20 (p-4, gap-8, py-12, etc.)
- **Container**: max-w-7xl with responsive padding (px-4 mobile, px-8 desktop)
- **Bento Grid**: Asymmetric card layouts with varying heights/widths using CSS Grid
- **Section padding**: py-16 mobile, py-24 desktop

### Visual Style
- **Glassmorphism**: Backdrop blur (backdrop-blur-xl) with semi-transparent backgrounds (bg-white/10)
- **Gradients**: Very subtle off-white to light mint gradients for backgrounds
- **Rounded corners**: rounded-2xl for cards, rounded-xl for buttons
- **Shadows**: Soft, layered shadows for depth (shadow-lg, shadow-2xl)

### Color Palette (Descriptive References Only)
- **Primary**: Verde Menta Energético (health, freshness)
- **Secondary**: Azul Petróleo Profundo (technology, trust)
- **Accent**: Laranja "Sunrise" (CTAs, highlights, dynamism)
- **Neutrals**: Off-white backgrounds, dark text for contrast

### Component Library

**Buttons**:
- Primary CTA: Accent color, prominent size, subtle glow/shimmer animation
- Secondary: Outline style with primary color border
- Hover states: Scale transform (scale-105), brightness increase
- For buttons on images: Backdrop blur background (backdrop-blur-md)

**Cards**:
- Glassmorphic style with subtle borders
- Padding: p-6 to p-8
- Varying sizes in bento grid layouts
- Hover: Subtle lift effect (translate-y)

**Mockups/Images**:
- iPhone mockup floating in hero showing WhatsApp conversation
- Lifestyle photos: People training, eating healthy (placeholders)
- WhatsApp conversation screenshots showing AI interaction

### Animations
- **Framer Motion** for scroll-triggered animations
- Fade-in on section entry (opacity 0 to 1)
- Slide-up effects (translateY 20px to 0)
- Stagger children animations for card grids
- Subtle pulse on CTA buttons
- Duration: 0.6-0.8s with ease-out timing

## Page Structure (7 Sections)

### 1. Hero Section (100vh)
- Headline: "O Fim da Dieta Abandonada. Seu Coach de IA no WhatsApp."
- Subheadline below
- Primary CTA: "Quero ser um Beta Tester" (glowing orange button)
- iPhone mockup (right side desktop, below mobile) showing WhatsApp conversation
- Background: Subtle gradient with glassmorphic elements

### 2. O Problema
- Title: "Por que 73% das pessoas desistem?"
- 3-column grid (1 column mobile): Cards showing pain points
- Icons for each problem (apps complexos, falta de tempo, planos estáticos)

### 3. A Solução
- Bento grid layout: 2x2 asymmetric grid
- Feature cards highlighting: WhatsApp ease, AI technology, professional connectivity
- Mix of text-heavy and visual-heavy cards

### 4. Para Quem É (Dual Target)
- Split layout: 2 large cards side-by-side (stack mobile)
- Card 1: "Para o Aluno" with relevant imagery
- Card 2: "Para o Profissional" with dashboard preview

### 5. Como Funciona
- Horizontal step flow (vertical mobile)
- 3 numbered steps with icons/illustrations
- Visual connectors between steps

### 6. Prova Social
- Title: "Junte-se à revolução do Fitness"
- Counter displays (animated numbers)
- Testimonial cards in masonry/bento grid
- Avatar + name + role + quote format

### 7. Footer / CTA Final
- Full-width section with gradient background
- Bold headline: "Estamos selecionando os primeiros usuários..."
- Primary CTA: "Solicitar Acesso Antecipado"
- Legal links (Privacidade, Termos)
- Minimal footer navigation

## Images
- **Hero**: iPhone mockup with WhatsApp conversation (pizza message + AI calorie adjustment)
- **Lifestyle photos**: 3-4 images of people exercising, eating healthy meals
- **WhatsApp screenshots**: Multiple conversation mockups showing AI interaction
- **Professional dashboard**: Preview of nutricionista monitoring panel
- **Icons**: Use Heroicons for problem cards and feature highlights

## Responsive Strategy
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hero: Stack vertically on mobile
- Grids: 1 column mobile → 2-3 columns desktop
- Typography scales down proportionally
- Maintain generous spacing on all devices