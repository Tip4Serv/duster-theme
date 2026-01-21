# Theme Color Reference Guide

Quick reference for all theme colors. Use for design decisions and theming consistency.

## Duster (Default)
```
Background:  #0a0a0f  - Deep dark
Foreground:  #f5f5f7  - Off-white
Primary:     #d4ff00  - Lime green
Secondary:   #00e5ff  - Cyan
Accent:      #9945ff  - Purple
Card:        #13131a  - Dark card
Border:      #1f1f2e  - Dark border
Muted:       #808080  - Gray text
```

## Neon Nights
```
Background:  #0d0221  - Deep purple-black
Foreground:  #faf9f9  - Pure white
Primary:     #ff006e  - Hot pink
Secondary:   #00f5ff  - Electric cyan
Accent:      #3a86ff  - Electric blue
Card:        #180828  - Purple-tinted dark
Border:      #2a1a3a  - Purple border
Muted:       #7a7a8a  - Light gray
```

## Twilight
```
Background:  #0f0419  - Purple-dark
Foreground:  #ede7e1  - Warm beige
Primary:     #ffa500  - Golden orange
Secondary:   #c77dff  - Light purple
Accent:      #7209b7  - Deep purple
Card:        #1a0f2e  - Deep purple
Border:      #2d1b4e  - Purple border
Muted:       #8a7fa8  - Muted purple
```

## Obsidian
```
Background:  #0a0e27  - Deep blue-black
Foreground:  #f0f4f8  - Light blue-gray
Primary:     #10b981  - Emerald green
Secondary:   #e0e7ff  - Light lavender
Accent:      #06b6d4  - Cyan
Card:        #111827  - Dark blue
Border:      #1f2937  - Blue-gray border
Muted:       #6b7280  - Gray
```

## Crystal Dawn
```
Background:  #f8f9fa  - Off-white
Foreground:  #1a1a1a  - Near black
Primary:     #0066ff  - Royal blue
Secondary:   #00d4ff  - Crystal cyan
Accent:      #9d4edd  - Vivid purple
Card:        #ffffff  - Pure white
Border:      #e5e7eb  - Light gray
Muted:       #6b7280  - Gray
```

## Sunset Paradise
```
Background:  #1a0a0a  - Very dark brown
Foreground:  #fef3f0  - Cream
Primary:     #ff6b35  - Warm orange
Secondary:   #f7931e  - Golden
Accent:      #c41e3a  - Deep red
Card:        #2a1515  - Dark red-brown
Border:      #3a2525  - Red-brown border
Muted:       #a0907f  - Muted tan
```

## Forest Depth
```
Background:  #0a1f12  - Deep forest
Foreground:  #e8f5e9  - Light mint
Primary:     #2e7d32  - Forest green
Secondary:   #81c784  - Light green
Accent:      #558b2f  - Olive
Card:        #1b3a26  - Dark green
Border:      #2d5a3d  - Green border
Muted:       #7da97c  - Muted green
```

## Color Contrast Reference

For text on backgrounds:

### Dark Themes (Background < #2a2a2a)
- Use Foreground or Primary for main text
- Use Secondary or Accent for highlights
- Use Muted for small/secondary text

### Light Themes (Background > #e0e0e0)
- Use Foreground or Accent for main text
- Use Primary for highlights
- Use Muted for secondary text

## Usage Examples

### Icon Colors
- Status/Featured: Use Primary
- Warnings: Use Secondary  
- Success: Use Primary/Secondary mix
- Danger: Use Accent

### Badge Colors
```
<ThemeBadge variant="primary">   // Uses Primary
<ThemeBadge variant="secondary"> // Uses Secondary
<ThemeBadge variant="accent">    // Uses Accent
<ThemeBadge variant="success">   // Green
<ThemeBadge variant="warning">   // Yellow/Orange
<ThemeBadge variant="danger">    // Red
```

### Button Colors
```
variant="primary"   // Primary color background
variant="secondary" // Secondary color background
variant="accent"    // Accent color background
variant="ghost"     // Card background with border
```

### Card Styling
- Background: Card
- Border: Border
- Text: Foreground
- Hover: Shift border to Primary

## Creating New Themes

### Step 1: Choose Base
- Dark theme: Start with background ~#0a0a0f
- Light theme: Start with background ~#f8f9fa

### Step 2: Select Primary
Your main accent - should be vibrant and distinguishable

### Step 3: Add Secondary & Accent
- Secondary: Complement to Primary
- Accent: Third color for variety

### Step 4: Set Neutrals
- Card: Lighter/darker than background
- Border: Between Card and Background
- Muted: Gray/neutral for text
- Foreground: Opposite of background (light if dark, dark if light)

### Step 5: Test Contrast
Use https://webaim.org/resources/contrastchecker/
- Foreground on Background: > 7:1 (AAA)
- Primary on Background: > 4.5:1 (AA)
- Muted on Card: > 4.5:1 (AA)

## Color Theory Tips

### Complementary Colors
- Red ↔ Cyan
- Green ↔ Magenta  
- Blue ↔ Orange
- Yellow ↔ Purple

### Analogous Colors
- Blue, Blue-green, Green
- Red, Red-orange, Orange
- Purple, Red-purple, Red

### Triadic Colors
- Red, Green, Blue (60° apart)
- Orange, Purple, Green

### Split-Complementary
- Take complementary, add colors 30° away
- Less intense than pure complementary

## Accessibility Notes

✅ Ensure 4.5:1 contrast for text
✅ Don't rely on color alone for information
✅ Use icons alongside colors (no emojis!)
✅ Test in grayscale
✅ Avoid red-green only combinations

## Live Color Pickers

- https://coolors.co/
- https://color-hunt.vercel.app/
- https://www.colourlovers.com/
- https://mycolor.space/

## Theme Color Extraction

If you have a image or design you want to match:

1. Use https://image-color.com/ to extract colors
2. Use https://mycolor.space/ to generate palette
3. Adjust brightness for accessibility
4. Add to themes.ts

That's it!
