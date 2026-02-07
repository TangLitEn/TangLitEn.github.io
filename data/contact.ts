export type ContactLink = {
  label: string;
  href: string;
};

export type ContactData = {
  email: string;
  links: ReadonlyArray<ContactLink>;
};

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const CONTACT_DATA: ContactData = {
  email: "litentang@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/TangLitEn" },
    { label: "Instagram", href: "https://www.instagram.com/liten_512/" }
  ]
};

if (!isValidEmail(CONTACT_DATA.email)) {
  throw new Error(`Invalid contact email: "${CONTACT_DATA.email}"`);
}

for (const link of CONTACT_DATA.links) {
  if (!link.label.trim()) {
    throw new Error("Contact link labels must not be empty.");
  }
  if (!isValidHttpUrl(link.href)) {
    throw new Error(`Invalid contact URL: "${link.href}"`);
  }
}

export const CONTACT: ContactData = Object.freeze({
  email: CONTACT_DATA.email,
  links: Object.freeze(CONTACT_DATA.links.map((link) => Object.freeze({ ...link })))
});
