import { useRouter } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { BranchBar } from '@/components/BranchBar';
import { Button } from '@/components/Button';
import { CartBar } from '@/components/CartBar';
import { catalog, menuForBranch } from '@/lib/catalog';
import { formatMoney } from '@/lib/pricing';
import { useCart } from '@/state/CartContext';
import { font, radius, spacing, useColors } from '@/theme';
import type { Product } from '@/types/catalog';

export default function MenuScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useCart();
  const sections = menuForBranch(state.branchId).map((s) => ({
    title: s.category.name,
    key: s.category.id,
    data: s.data,
  }));

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <BranchBar />
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={[font.heading, { color: colors.text, textAlign: 'center' }]}>
              Pick a branch to see its menu
            </Text>
            <Text style={[font.body, { color: colors.textMuted, textAlign: 'center' }]}>
              Each branch has its own availability. Allow location or choose one yourself.
            </Text>
            <Button title="Choose a branch" onPress={() => router.push('/branch')} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[font.title, styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <ProductRow product={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
      <CartBar />
    </View>
  );
}

function ProductRow({ product }: { product: Product }) {
  const colors = useColors();
  const router = useRouter();
  const hasOptions = product.optionGroups.length > 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatMoney(product.basePrice, catalog.currency)}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={styles.thumbEmoji}>{product.emoji}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[font.heading, { color: colors.text }]}>{product.name}</Text>
        <Text style={[font.caption, { color: colors.textMuted }]} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={[font.body, { color: colors.text, fontWeight: '600' }]}>
          {hasOptions ? 'From ' : ''}
          {formatMoney(product.basePrice, catalog.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Bottom padding keeps the last row clear of the floating cart bar.
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 36 },
  rowText: { flex: 1, gap: 4, justifyContent: 'center' },
  empty: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'stretch',
  },
  emptyEmoji: { fontSize: 40, textAlign: 'center' },
});
