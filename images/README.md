# Images

Everything in this folder is a **placeholder** generated for development. Swap
each one for the museum's real photograph — keep the same filename and nothing
in the code has to change.

| File | Used by | Aspect ratio |
| --- | --- | --- |
| `hero-museum.jpg` | Home page hero — `src/components/home/Hero.tsx` | 21:10 (wide) |
| `card-collection.jpg` | "Collection" card | 4:3 |
| `card-events.jpg` | "Events" card | 4:3 |
| `card-materials.jpg` | "Materials" card | 4:3 |

The card filenames come from `HOME_CARDS` in `src/config/site.ts`, so you can
also point them somewhere else by editing that list.

**Alt text lives in the dictionary**, not next to the image:
`src/lib/i18n/dictionaries/en.ts` → `home.heroImageAlt` and
`home.cards.*ImageAlt`. Update the description when you change a photo — a
stale alt text is worse than none.
