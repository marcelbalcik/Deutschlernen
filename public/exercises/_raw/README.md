# Raw images (upload here)

Drop your generated images here with **any filename** (e.g.
`feelings_body_026.png`). No renaming needed.

Each file is then linked to a phrase in `src/data/imageOverrides.ts`
(phrase id → filename). The app uses the mapped image; anything unmapped falls
back to the per-id folder image or the emoji placeholder.

Keep files square PNG and small (ideally < 200 KB each).
