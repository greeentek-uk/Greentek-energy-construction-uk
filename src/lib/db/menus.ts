import { getDb } from "./mongodb";

const COLLECTION = "siteSettings";
const DOC_ID = "menus";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  /** Opens in a new tab — for links off the site. */
  newTab?: boolean;
  /** One level of nesting only; a deeper tree is more than this site's nav can show. */
  children?: MenuItem[];
}

export interface Menus {
  header: MenuItem[];
  footer: MenuItem[];
}

/** Matches the nav the site shipped with, so nothing changes until it's edited. */
export const DEFAULT_MENUS: Menus = {
  header: [
    { id: "h1", label: "Home", href: "/" },
    { id: "h2", label: "About", href: "/about" },
    { id: "h3", label: "Services", href: "/services" },
    { id: "h4", label: "Projects", href: "/projects" },
    { id: "h5", label: "Locations", href: "/locations" },
    { id: "h6", label: "Blog", href: "/blog" },
    { id: "h7", label: "Contact", href: "/contact" },
  ],
  footer: [
    { id: "f1", label: "Privacy Policy", href: "/privacy" },
    { id: "f2", label: "Terms of Service", href: "/terms" },
  ],
};

type MenusDoc = Menus & { _id: typeof DOC_ID };

/**
 * Reads the menus, falling back to whatever nav the site already had.
 *
 * Before this collection exists, navigation lived on `settings.navLinks` — and
 * that list has been edited since launch (the Finance entry was added by a
 * one-off script). Seeding from it rather than from DEFAULT_MENUS means turning
 * this feature on doesn't silently drop a live link.
 */
export async function getMenus(): Promise<Menus> {
  const db = await getDb();
  const doc = await db.collection<MenusDoc>(COLLECTION).findOne({ _id: DOC_ID });
  if (doc?.header?.length) {
    return { header: doc.header, footer: doc.footer?.length ? doc.footer : DEFAULT_MENUS.footer };
  }

  const settings = await db
    .collection<{ _id: string; navLinks?: { label: string; href: string }[] }>("settings")
    .findOne({ _id: "settings" });

  const inherited = settings?.navLinks?.length
    ? settings.navLinks.map((link, index) => ({
        id: `h${index + 1}`,
        label: link.label,
        href: link.href,
      }))
    : DEFAULT_MENUS.header;

  return { header: inherited, footer: DEFAULT_MENUS.footer };
}

export async function saveMenus(menus: Menus): Promise<void> {
  const db = await getDb();
  await db
    .collection<MenusDoc>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: menus }, { upsert: true });
}
