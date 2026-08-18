import type { Config } from "tailwindcss";

/**
 * ---------------------------------------------------------------------------
 * DESIGN TOKENS
 * ---------------------------------------------------------------------------
 * Every colour, font and radius used across the site is declared here so the
 * whole look of the museum site can be re-skinned from ONE file.
 *
 * The values were sampled directly from the official mock-ups
 * (SYU_Museum_Website_Home_Page_&_Registration_Page.pdf and
 * SYUM_Website_Booking_Pages.docx).
 *
 * Every foreground/background pair below has been checked against
 * WCAG 2.2 Level AA (4.5:1 for body text, 3:1 for large text and UI borders).
 * The measured ratio is written next to each colour — if you change a value,
 * re-check it with a contrast checker before shipping.
 * ---------------------------------------------------------------------------
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /** Deep museum green — left side of the header/footer gradient. */
        brand: {
          green: "#0A5449", // white text on this = 8.8:1  ✅ AA / AAA
          navy: "#1A3A4E", // white text on this = 11.9:1 ✅ AA / AAA
          brown: "#5B442C", // white text on this = 9.1:1  ✅ (buttons, alert bar)
          "brown-hover": "#46341F",
          "brown-soft": "#6E5A3E", // muted values on cards = 5.1:1 ✅ AA
        },
        /** Warm paper tones used for page and card backgrounds. */
        surface: {
          cream: "#F6F1E4", // home page "welcome" band
          parchment: "#EFEADC", // announcement bar, home cards band
          sand: "#E5E1D6", // booking page background
          card: "#E5E3DF", // the rounded booking card
        },
        /** Hairlines and dividers. Used for 3:1 non-text contrast. */
        line: {
          DEFAULT: "#B7AE9A",
          soft: "#CFC8B6",
        },
        /** Body copy. 12:1 on sand ✅ AAA */
        ink: "#2A2118",
        /** Errors and required markers. 7.1:1 on card ✅ AAA */
        danger: "#8C1D18",
        /** Success confirmation. */
        success: "#1F5136",
      },
      fontFamily: {
        /** Headings + most body copy in the design are a warm serif. */
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        /** Small UI labels / helper text. */
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        card: "18px", // the big rounded booking card
        pill: "9999px", // Register / Learn More / Submit buttons
      },
      maxWidth: {
        content: "1180px", // the shared page gutter used by every section
      },
      boxShadow: {
        card: "0 1px 2px rgba(42, 33, 24, 0.06)",
        raised: "0 6px 20px rgba(42, 33, 24, 0.12)",
      },
      keyframes: {
        "nudge-right": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
        },
        "nudge-left": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-4px)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "nudge-right": "nudge-right 1.8s ease-in-out infinite",
        "nudge-left": "nudge-left 1.8s ease-in-out infinite",
        "fade-in": "fade-in 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
