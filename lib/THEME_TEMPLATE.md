// THEME CREATION TEMPLATE
// Copy and customize this to add new themes to lib/themes.ts

/*
STEP 1: Choose your color palette
- Pick 8 colors: background, foreground, primary, secondary, accent, card, border, muted

STEP 2: Add to themes object in lib/themes.ts

STEP 3: Update the Theme type

STEP 4: Done! Theme will appear in switcher

---

COLOR SELECTION TIPS:

For Dark Themes:
- background: Very dark (near black) - #0a0a0f, #0d0221, #0f0419, #0a0e27
- foreground: Very light (near white) - #f5f5f7, #faf9f9, #ede7e1, #f0f4f8
- card: Slightly lighter than background - #13131a, #180828, #1a0f2e, #111827
- border: Between card and background - #1f1f2e, #2a1a3a, #2d1b4e, #1f2937
- primary: Your main accent color - pick a vibrant color
- secondary: Complementary to primary
- accent: Third color for extra flair
- muted: Gray/muted color for secondary text

For Light Themes:
- background: White or very light - #f8f9fa, #ffffff
- foreground: Dark - #1a1a1a, #000000
- card: White or light gray - #ffffff, #f0f4f8
- border: Light gray - #e5e7eb, #d1d5db
- primary/secondary/accent: Your main colors (they'll be darker on light bg)

---

EXAMPLE THEME TEMPLATES:

==== SUNSET THEME ====
background: '#1a0a0a'
foreground: '#fef3f0'
primary: '#ff6b35'      // Warm orange
secondary: '#f7931e'    // Golden
accent: '#c41e3a'       // Deep red
card: '#2a1515'
border: '#3a2525'
muted: '#a0907f'

==== FOREST THEME ====
background: '#0a1f12'
foreground: '#e8f5e9'
primary: '#2e7d32'      // Forest green
secondary: '#81c784'    // Light green
accent: '#558b2f'       // Olive
card: '#1b3a26'
border: '#2d5a3d'
muted: '#7da97c'

==== OCEAN THEME ====
background: '#001a33'
foreground: '#e0f2f1'
primary: '#00838f'      // Teal
secondary: '#00bcd4'    // Cyan
accent: '#0277bd'       // Blue
card: '#0d2f3f'
border: '#1a4a5a'
muted: '#5a8a95'

==== CYBER THEME ====
background: '#0a0e27'
foreground: '#00ff88'
primary: '#00ff88'      // Matrix green
secondary: '#0099ff'    // Cyan
accent: '#ff00ff'       // Magenta
card: '#0f1a3a'
border: '#1a2a4a'
muted: '#6a7a9a'

==== LAVENDER THEME ====
background: '#1a0a2e'
foreground: '#f5e6ff'
primary: '#b17ff1'      // Lavender
secondary: '#d89ef8'    // Light purple
accent: '#f72585'       // Pink
card: '#2a1a4e'
border: '#3a2a6e'
muted: '#8a7aaa'

==== VANILLA CREAM ====
background: '#faf8f3'
foreground: '#2a2a2a'
primary: '#d4a574'      // Warm tan
secondary: '#e8d5c4'    // Cream
accent: '#8b6f47'       // Brown
card: '#ffffff'
border: '#e0d7cc'
muted: '#999999'

*/

// ADD TO lib/themes.ts:

/*

  [THEME_NAME]: {
    name: '[THEME_NAME]',
    label: '[Display Name]',
    description: '[Short description]',
    colors: {
      background: '#',
      foreground: '#',
      primary: '#',
      secondary: '#',
      accent: '#',
      card: '#',
      border: '#',
      muted: '#',
    },
  },

*/

// ONLINE COLOR PALETTE TOOLS:
// - https://coolors.co/
// - https://color-hunt.vercel.app/
// - https://www.colourlovers.com/
// - https://www.adobe.com/products/color/explore
// - https://mycolor.space/

// CONTRAST CHECKER (accessibility):
// - https://webaim.org/resources/contrastchecker/
// - https://www.tpgi.com/color-contrast-checker/

// NAMING CONVENTIONS:
// - Use descriptive, aesthetic names
// - Keep theme names lowercase, no spaces
// - Examples: sunset, forest_vibes, ocean_blue, cyber_punk, lavender_dream
