import rawCatalog from '@/data/catalog.json';
import type { Catalog, Category, Product, Selections } from '@/types/catalog';

export const catalog = rawCatalog as Catalog;

/** Looks up a product by id. */
export function findProduct(id: string, source: Catalog = catalog): Product | undefined {
  return source.products.find((p) => p.id === id);
}

/** Looks up a branch by id; returns undefined when no branch is selected. */
export function findBranch(id: string | null, source: Catalog = catalog) {
  return id ? source.branches.find((b) => b.id === id) : undefined;
}

/** True when the given branch sells the product. */
export function isAvailableAt(product: Product, branchId: string | null): boolean {
  return branchId !== null && product.availableAt.includes(branchId);
}

export interface MenuSection {
  category: Category;
  data: Product[];
}

/** Categories in catalog order, each with only the products the branch carries. Empty categories are dropped. */
export function menuForBranch(branchId: string | null, source: Catalog = catalog): MenuSection[] {
  return source.categories
    .map((category) => ({
      category,
      data: source.products.filter((p) => p.categoryId === category.id && isAvailableAt(p, branchId)),
    }))
    .filter((section) => section.data.length > 0);
}

/** Starting selections for the product detail screen: each group's `default` choice(s). */
export function defaultSelections(product: Product): Selections {
  const selections: Selections = {};
  for (const group of product.optionGroups) {
    const defaults = group.choices.filter((c) => c.default).map((c) => c.id);
    if (group.type === 'single' && defaults.length === 0 && group.choices.length > 0) {
      defaults.push(group.choices[0].id);
    }
    selections[group.id] = defaults;
  }
  return selections;
}

/** Human-readable option lines, e.g. ["Size: 12 pieces", "Extras: Spicy mayo, Eel sauce"]. */
export function describeSelections(product: Product, selections: Selections): string[] {
  const lines: string[] = [];
  for (const group of product.optionGroups) {
    const names = (selections[group.id] ?? [])
      .map((id) => group.choices.find((c) => c.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) lines.push(`${group.name}: ${names.join(', ')}`);
  }
  return lines;
}
