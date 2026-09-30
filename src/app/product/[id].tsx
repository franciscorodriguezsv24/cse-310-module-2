import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { OptionGroupPicker } from '@/components/OptionGroupPicker';
import { QuantityStepper } from '@/components/QuantityStepper';
import { catalog, defaultSelections, findBranch, findProduct, isAvailableAt } from '@/lib/catalog';
import { formatMoney, lineTotal } from '@/lib/pricing';
import { useCart } from '@/state/CartContext';
import { font, radius, spacing, useColors } from '@/theme';
import type { Product, Selections } from '@/types/catalog';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = findProduct(id);
  const colors = useColors();

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={[font.heading, { color: colors.text }]}>This item is no longer on the menu.</Text>
      </View>
    );
  }
  // Keyed so the form state resets when navigating between products.
  return <ProductForm key={product.id} product={product} />;
}

function ProductForm({ product }: { product: Product }) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useCart();
  const [selections, setSelections] = useState<Selections>(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);

  const branch = findBranch(state.branchId);
  const available = isAvailableAt(product, state.branchId);
  const total = lineTotal(product, selections, quantity);

  const addToCart = () => {
    dispatch({ type: 'add', productId: product.id, selections, quantity });
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={styles.heroEmoji}>{product.emoji}</Text>
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text style={[font.title, { color: colors.text }]}>{product.name}</Text>
          <Text style={[font.body, { color: colors.textMuted }]}>{product.description}</Text>
          <Text style={[font.heading, { color: colors.text }]}>{formatMoney(product.basePrice, catalog.currency)}</Text>
        </View>

        {!available && (
          <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
            <Text style={[font.body, { color: colors.warning }]}>
              {branch ? `Not available at ${branch.name}.` : 'Choose a branch before adding items.'}
            </Text>
          </View>
        )}

        {product.optionGroups.map((group) => (
          <OptionGroupPicker
            key={group.id}
            group={group}
            currency={catalog.currency}
            selected={selections[group.id] ?? []}
            onChange={(ids) => setSelections((prev) => ({ ...prev, [group.id]: ids }))}
          />
        ))}

        <View style={styles.quantityRow}>
          <Text style={[font.heading, { color: colors.text }]}>Quantity</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
      >
        <Button
          title={`Add to cart · ${formatMoney(total, catalog.currency)}`}
          disabled={!available}
          onPress={addToCart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  hero: { height: 180, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 88 },
  notice: { padding: spacing.md, borderRadius: radius.md },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
});
