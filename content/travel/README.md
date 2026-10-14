# Travel memories

Each flag on About opens the Markdown file matching its code: `la.md` for Laos, `th.md` for Thailand, and so on. Flags without a file show “More memories to come.”

Add as many dated photo entries as you like, in the order you want them displayed:

```markdown
### DD/MM/YYYY

![A description of the photograph](/travel/fr/photo.jpg)

Your caption here.

---

### DD/MM/YYYY

![Another photograph](/travel/fr/another-photo.jpg)

Another caption.
```

Put new images in `public/travel/<code>/`, then reference them without the `public` prefix. Existing photos anywhere in `public/` can also be reused. Dates are free-form text, so use a month or year if that is all you know.

Current flags: `la` Laos, `th` Thailand, `tw` Taiwan, `id` Indonesia, `fr` France, `be` Belgium, `de` Germany, `it` Italy, `ch` Switzerland, `cn` China, `mo` Macao, `hk` Hong Kong, `vn` Vietnam, and `kr` South Korea. Edit the destinations in `lib/travel.ts` to add or reorder flags.
