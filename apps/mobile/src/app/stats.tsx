import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const weekLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const BADGES = [
  { id: 'words_100', label: '100 mots lus', icon: 'book.fill', threshold: 100, field: 'totalWordsRead' as const },
  { id: 'words_1k', label: '1 000 mots lus', icon: 'book.fill', threshold: 1000, field: 'totalWordsRead' as const },
  { id: 'words_10k', label: '10 000 mots lus', icon: 'books.vertical.fill', threshold: 10000, field: 'totalWordsRead' as const },
  { id: 'streak_7', label: 'Série de 7 jours', icon: 'flame.fill', threshold: 7, field: 'currentStreak' as const },
  { id: 'streak_30', label: 'Série de 30 jours', icon: 'flame.fill', threshold: 30, field: 'currentStreak' as const },
  { id: 'coins_500', label: '500 pièces', icon: 'lightbulb.fill', threshold: 500, field: 'coins' as const },
];

export default function StatsScreen() {
  const product = useProduct();
  const readGoal = product.profile.dailyWordGoal;
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const weekStart = new Date(now);
  const dayFromMonday = (now.getDay() + 6) % 7;
  weekStart.setDate(now.getDate() - dayFromMonday);
  const week = weekLabels.map((label, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { label, key };
  });
  const recentCutoff = Date.now() - 7 * 86_400_000;
  const recentProgress = Object.values(product.progress).filter(
    (item) => new Date(item.updatedAt).getTime() >= recentCutoff,
  );
  const todayWords = Object.values(product.progress)
    .filter((item) => item.updatedAt.startsWith(todayKey))
    .reduce((sum, item) => sum + item.wordsRead, 0);
  const recentWords = recentProgress.reduce((sum, item) => sum + item.wordsRead, 0);
  const minutes = Math.round(
    recentProgress.reduce((sum, item) => sum + item.secondsSpent, 0) / 60,
  );
  const listeningMinutes = Math.round(
    recentProgress.reduce((sum, item) => sum + (item.listenedSeconds ?? 0), 0) / 60,
  );
  const progress = Math.min(1, todayWords / Math.max(1, readGoal));
  const levelCodeMap: Record<string, string> = {
    'Débutant 1': 'A1',
    'Débutant 2': 'A2',
    Intermédiaire: 'B1',
    Avancé: 'B2',
  };
  const levelCode = levelCodeMap[product.profile.level] ?? 'A1';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Statistiques anglais</Text>
        <Pressable
          accessibilityLabel="Voir le classement et défis"
          onPress={() => router.push('/challenges')}
          style={styles.headerButton}>
          <SymbolView name="chart.bar.fill" tintColor={productTheme.ink} size={19} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.goalCard}>
          <View style={styles.goalRing}>
            <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <Text style={styles.goalValue}>{todayWords}/{readGoal} mots aujourd’hui</Text>
          <Text style={styles.goalCopy}>Continuez à travailler pour atteindre votre objectif quotidien !</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.coin}>
            <SymbolView name="lightbulb.fill" tintColor={productTheme.greenDark} size={16} />
          </View>
          <Text style={styles.balanceLabel}>Solde de pièces</Text>
          <Text style={styles.balanceValue}>{product.coins}</Text>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>7 derniers jours</Text>
            <Text style={styles.cardLink}>La Méthode YAPRO</Text>
          </View>
          <GoalRow label="Mots lus" value={recentWords} goal={readGoal * 7} />
          <GoalRow label="Temps d’étude" value={minutes} goal={product.profile.dailyMinutes * 7} suffix=" min" />
          <GoalRow label="Écoute réelle" value={listeningMinutes} goal={product.profile.dailyMinutes * 7} suffix=" min" />
          <GoalRow label="Mots enregistrés" value={product.vocabulary.length} goal={10} />
        </View>

        <View style={styles.streakCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{product.currentStreak} jour série</Text>
            <Text style={styles.cardLink}>Calendrier</Text>
          </View>
          <View style={styles.week}>
            {week.map((day) => {
              const active = product.activityDates.includes(day.key);
              return (
              <View key={day.key} style={styles.day}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={[styles.dayDot, active && styles.dayDotActive]}>
                  <SymbolView
                    name="flame.fill"
                    tintColor={active ? '#FFFFFF' : '#B7BBC1'}
                    size={15}
                  />
                </View>
              </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Stat value={product.coins} label="Pièces" />
          <Stat value={product.knownWords} label="Mots connus" />
          <Stat value={product.vocabulary.length} label="Mots enregistrés" />
          <Stat value={product.vocabulary.filter((item) => item.status < 4).length} label="Mots à apprendre" />
          <Stat value={product.totalWordsRead} label="Nombre de mots lus" />
          <Stat value={minutes} label="Minutes d’étude" />
        </View>

        <Text style={styles.sectionTitle}>Jalons</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => {
            const earned = product[badge.field] >= badge.threshold;
            return (
              <View key={badge.id} style={[styles.badgeItem, !earned && styles.badgeItemLocked]}>
                <View style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                  <SymbolView name={badge.icon} tintColor={earned ? '#FFFFFF' : productTheme.muted} size={20} />
                </View>
                <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]} numberOfLines={2}>
                  {badge.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Votre niveau</Text>
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{levelCode}</Text>
          </View>
          <View style={styles.levelCopy}>
            <Text style={styles.levelTitle}>{product.profile.level}</Text>
            <Text style={styles.levelText}>{Math.max(0, 500 - product.knownWords)} mots jusqu’au prochain niveau</Text>
            <View style={styles.levelTrack}>
              <View style={[styles.levelFill, { width: `${Math.min(100, (product.knownWords / 500) * 100)}%` }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalRow({
  label,
  value,
  goal,
  suffix = '',
}: {
  label: string;
  value: number;
  goal: number;
  suffix?: string;
}) {
  const ratio = Math.min(1, value / Math.max(1, goal));
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalLabelRow}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalRatio}>{value}{suffix} / {goal}{suffix}</Text>
      </View>
      <View style={styles.rowTrack}>
        <View style={[styles.rowFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 62,
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
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 120,
    gap: 12,
  },
  goalCard: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
  },
  goalRing: {
    width: 96,
    height: 96,
    borderWidth: 9,
    borderColor: '#DCE9DD',
    borderTopColor: productTheme.green,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPercent: {
    fontSize: 20,
    fontWeight: '900',
    color: productTheme.greenDark,
  },
  goalValue: {
    marginTop: 13,
    fontSize: 18,
    fontWeight: '900',
    color: productTheme.ink,
  },
  goalCopy: {
    marginTop: 5,
    maxWidth: 260,
    fontSize: 13,
    lineHeight: 18,
    color: productTheme.muted,
    textAlign: 'center',
  },
  balanceCard: {
    minHeight: 58,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDF16C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: productTheme.ink,
  },
  balanceValue: {
    marginLeft: 'auto',
    fontSize: 17,
    fontWeight: '900',
    color: productTheme.ink,
  },
  activityCard: {
    padding: 16,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  cardHeader: {
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: productTheme.ink,
  },
  cardLink: {
    fontSize: 11,
    color: productTheme.muted,
  },
  goalRow: {
    paddingVertical: 8,
  },
  goalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  goalRatio: {
    fontSize: 11,
    color: productTheme.muted,
  },
  rowTrack: {
    height: 5,
    marginTop: 7,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: productTheme.lineSoft,
  },
  rowFill: {
    height: '100%',
    backgroundColor: productTheme.orange,
  },
  streakCard: {
    padding: 16,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 10,
    color: productTheme.muted,
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: '#EF7430',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    width: '48.8%',
    minHeight: 92,
    padding: 15,
    borderRadius: 13,
    backgroundColor: productTheme.surface,
  },
  statValue: {
    fontSize: 25,
    fontWeight: '900',
    color: productTheme.ink,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    color: productTheme.muted,
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '900',
    color: productTheme.ink,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    width: '30.8%',
    padding: 12,
    borderRadius: 13,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    gap: 8,
  },
  badgeItemLocked: {
    backgroundColor: productTheme.surface,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconLocked: {
    backgroundColor: productTheme.lineSoft,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: productTheme.muted,
  },
  levelCard: {
    padding: 17,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  levelCopy: {
    minWidth: 0,
    flex: 1,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: productTheme.ink,
  },
  levelText: {
    marginTop: 4,
    fontSize: 11,
    color: productTheme.muted,
  },
  levelTrack: {
    height: 5,
    marginTop: 9,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: productTheme.lineSoft,
  },
  levelFill: {
    height: '100%',
    backgroundColor: productTheme.green,
  },
});
