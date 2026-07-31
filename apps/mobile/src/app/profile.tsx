import { useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

export default function ProfileScreen() {
  const product = useProduct();
  const [name, setName] = useState(product.profile.displayName);
  const [editing, setEditing] = useState(false);

  const save = () => {
    const clean = name.trim();
    if (clean) product.finishOnboarding({ displayName: clean });
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={router.back} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Profil</Text>
        <Pressable
          accessibilityLabel={editing ? 'Enregistrer le profil' : 'Modifier le profil'}
          onPress={editing ? save : () => setEditing(true)}
          style={styles.editButton}>
          <Text style={styles.editText}>{editing ? 'Enregistrer' : 'Modifier'}</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{product.profile.displayName.slice(0, 1).toUpperCase()}</Text>
        </View>
        {editing ? (
          <TextInput
            autoFocus
            accessibilityLabel="Nom affiché"
            value={name}
            onChangeText={setName}
            onSubmitEditing={save}
            style={styles.nameInput}
          />
        ) : (
          <Text style={styles.name}>{product.profile.displayName}</Text>
        )}
        <Text style={styles.accountStatus}>Profil local Immerli</Text>

        <View style={styles.languageCard}>
          <View style={styles.languageIcon}>
            <SymbolView name="globe.europe.africa.fill" tintColor="#FFFFFF" size={23} />
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageLabel}>LANGUE D’APPRENTISSAGE</Text>
            <Text style={styles.languageValue}>anglais · {product.profile.level}</Text>
          </View>
          <Pressable accessibilityLabel="Modifier la langue" onPress={() => router.push('/languages')}>
            <SymbolView name="chevron.right" tintColor="#FFFFFF" size={17} />
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <Metric value={product.knownWords} label="Mots connus" />
          <View style={styles.metricDivider} />
          <Metric value={product.vocabulary.length} label="Mots sauvés" />
          <View style={styles.metricDivider} />
          <Metric value={product.totalWordsRead} label="Mots lus" />
        </View>

        <View style={styles.links}>
          <ProfileLink label="Statistiques" symbol="chart.line.uptrend.xyaxis" onPress={() => router.push('/stats')} />
          <ProfileLink label="Paramètres" symbol="gearshape.fill" onPress={() => router.push('/settings')} />
        </View>

        <View style={styles.syncNote}>
          <SymbolView name="externaldrive.badge.exclamationmark" tintColor={productTheme.orange} size={21} />
          <Text style={styles.syncText}>
            La progression est sauvegardée sur cet appareil. La synchronisation multi-appareils sera activée dès que le projet Supabase sera connecté.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProfileLink({
  label,
  symbol,
  onPress,
}: {
  label: string;
  symbol: string;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
      <View style={styles.linkIcon}>
        <SymbolView name={symbol as never} tintColor={productTheme.ink} size={19} />
      </View>
      <Text style={styles.linkLabel}>{label}</Text>
      <SymbolView name="chevron.right" tintColor={productTheme.muted} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 61,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
  },
  editButton: {
    minWidth: 78,
    height: 40,
    borderRadius: 20,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.blue,
  },
  content: {
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    marginTop: 17,
    borderRadius: 44,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  name: {
    marginTop: 15,
    fontSize: 25,
    fontWeight: '900',
    color: productTheme.ink,
  },
  nameInput: {
    minWidth: 220,
    minHeight: 48,
    marginTop: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.blue,
    borderRadius: 10,
    backgroundColor: productTheme.surface,
    fontSize: 20,
    fontWeight: '800',
    color: productTheme.ink,
    textAlign: 'center',
  },
  accountStatus: {
    marginTop: 4,
    fontSize: 12,
    color: productTheme.muted,
  },
  languageCard: {
    width: '100%',
    minHeight: 82,
    marginTop: 25,
    padding: 14,
    borderRadius: 15,
    backgroundColor: productTheme.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#183B75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCopy: {
    minWidth: 0,
    flex: 1,
  },
  languageLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#A7B7CC',
  },
  languageValue: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metrics: {
    width: '100%',
    minHeight: 88,
    marginTop: 13,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: productTheme.ink,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 9,
    color: productTheme.muted,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: productTheme.line,
  },
  links: {
    width: '100%',
    marginTop: 13,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  linkRow: {
    minHeight: 59,
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    minWidth: 0,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: productTheme.ink,
  },
  syncNote: {
    width: '100%',
    marginTop: 13,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8E9',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  syncText: {
    minWidth: 0,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#705323',
  },
  pressed: {
    opacity: 0.65,
  },
});
