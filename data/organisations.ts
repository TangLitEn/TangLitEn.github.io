export type OrganisationChip = {
  name: string;
  href: string;
  logo: string;
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidPublicAssetPath = (value: string): boolean =>
  value.startsWith("/") && !value.includes("..");

const ORGANISATION_CHIPS_DATA: OrganisationChip[] = [
  {
    name: "Micron",
    href: "https://www.micron.com/",
    logo: "/organisation/micron.jpg"
  },
  {
    name: "Learnr",
    href: "https://www.learnr.sg/",
    logo: "/organisation/learnr.png"
  },
  {
    name: "Tinkrr",
    href: "https://www.tinkrr.org/",
    logo: "/organisation/Tinkrr_logo.png"
  }
];

for (const org of ORGANISATION_CHIPS_DATA) {
  if (!org.name.trim()) {
    throw new Error("Organisation name must not be empty.");
  }
  if (!isValidHttpUrl(org.href)) {
    throw new Error(`Invalid organisation URL: "${org.href}"`);
  }
  if (!isValidPublicAssetPath(org.logo)) {
    throw new Error(`Invalid organisation logo path: "${org.logo}"`);
  }
}

export const ORGANISATION_CHIPS: ReadonlyArray<OrganisationChip> = Object.freeze(
  ORGANISATION_CHIPS_DATA.map((item) => Object.freeze({ ...item }))
);
