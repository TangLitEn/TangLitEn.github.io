# Badge images

Drop badge images here (PNG, JPG, WebP, GIF, SVG, or AVIF). Each image becomes
one badge. Its filename supplies its name: `student-leader.png` → Student Leader.
The included SVGs are complete vertical banner designs; replace them with your
own artwork and update post references if you change their filenames.

Link an image from a post's Markdown header using its exact filename:

```yaml
checkpoint: true
badges: ["student-leader.svg", "community-builder.svg"]
```

Only published checkpoint posts count. An image with no linked checkpoint is
automatically WIP. No manual status or badge registry is needed. Omit `badges`
or use `badges: []` for a checkpoint without a badge. Files in subfolders are
not scanned. Use unique names even across file extensions.

Edit every flag's name and achievement month in [flags.md](flags.md).
That single file contains entries keyed by exact image filenames, plus field
instructions. Update its keys and post references when renaming images.
No individual flag Markdown files are needed.

Images are the entire hanging fabric, not icons placed on another flag. Prefer
portrait artwork (the starters are 240 × 400) with transparent areas outside
the banner silhouette. The renderer preserves the image aspect ratio and cutouts.
