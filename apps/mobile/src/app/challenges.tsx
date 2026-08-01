import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from '@/components/symbol-view';
import { productTheme } from '@/constants/product-theme';

interface ChallengeItem {
  id: string;
  title: string;
  badge: string;
  members: string;
  dates: string;
  joined?: boolean;
}

const challengesData: ChallengeItem[] = [
  {
    id: 'book',
    title: 'LingQ Book Challenge',
    badge: '📚',
    members: '8 645 Membres',
    dates: '1 août 2026 – 1 nov. 2026',
    joined: true,
  },
  {
    id: '1000words',
    title: '1000 Word Challenge for English',
    badge: '💎',
    members: '59 222 Membres',
    dates: '1 août 2026 – 1 nov. 2026',
    joined: false,
  },
  {
    id: '90day',
    title: '90-Day English Challenge',
    badge: '🛡️',
    members: '520 Membres',
    dates: '1 juil. 2026 – 1 oct. 2026',
    joined: true,
  },
  {
    id: 'hardcore',
    title: 'Hard Core 90-Day English Challenge',
    badge: '🏆',
    members: '240 Membres',
    dates: '1 août 2026 – 1 nov. 2026',
    joined: false,
  },
];

const leaderboardData = [
  { rank: 1, name: 'kathleenliu1', score: '283 555', gap: '0', initials: 'KL', color: '#D9A74A' },
  { rank: 2, name: 'Jeurax', score: '273 882', gap: '-9 673', initials: 'J', color: '#9B51E0' },
  { rank: 3, name: 'Camille (Vous)', score: '929', gap: '-282 626', initials: 'CA', color: productTheme.green },
];

export default function ChallengesScreen() {
  const [tab, setTab] = useState<'defis' | 'classement'>('defis');
  const [joinedState, setJoinedState] = useState<Record<string, boolean>>({
    book: true,
    '90day': true,
  });

  const toggleJoin = (id: string) => {
    setJoinedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Défis & Classement</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setTab('defis')}
          style={[styles.tabButton, tab === 'defis' && styles.tabButtonActive]}>
          <Text style={[styles.tabText, tab === 'defis' && styles.tabTextActive]}>Défis</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('classement')}
          style={[styles.tabButton, tab === 'classement' && styles.tabButtonActive]}>
          <Text style={[styles.tabText, tab === 'classement' && styles.tabTextActive]}>
            Classement
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'defis' ? (
          <View style={styles.defisGroup}>
            <Text style={styles.sectionTitle}>CHALLENGES ACTIFS</Text>
            {challengesData.map((item) => {
              const isJoined = joinedState[item.id];
              return (
                <View key={item.id} style={styles.challengeCard}>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeEmoji}>{item.badge}</Text>
                  </View>
                  <View style={styles.challengeCopy}>
                    <Text style={styles.challengeTitle}>{item.title}</Text>
                    <Text style={styles.challengeMeta}>{item.members}</Text>
                    <Text style={styles.challengeDates}>{item.dates}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleJoin(item.id)}
                    style={[
                      styles.joinBtn,
                      isJoined ? styles.quitBtn : styles.activeJoinBtn,
                    ]}>
                    <Text
                      style={[
                        styles.joinBtnText,
                        isJoined ? styles.quitBtnText : styles.activeJoinBtnText,
                      ]}>
                      {isJoined ? 'Quitter' : 'Rejoindre +'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.leaderboardGroup}>
            <View style={styles.userRankBanner}>
              <Text style={styles.userRankLabel}>Votre rang actuel</Text>
              <Text style={styles.userRankValue}>Rang : 520</Text>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.sectionTitle}>LEADERBOARD GLOBAL</Text>
              <Text style={styles.filterDropdown}>Tous les Membres ∨</Text>
            </View>

            <View style={styles.leaderboardTable}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.thRang}>Rang</Text>
                <Text style={styles.thMembre}>Membre</Text>
                <Text style={styles.thScore}>Score</Text>
                <Text style={styles.thGap}>Écart</Text>
              </View>

              {leaderboardData.map((item) => (
                <View key={item.rank} style={styles.tableRow}>
                  <Text style={styles.tdRang}>#{item.rank}</Text>
                  <View style={styles.tdUserCol}>
                    <View style={[styles.avatarCircle, { backgroundColor: item.color }]}>
                      <Text style={styles.avatarText}>{item.initials}</Text>
                    </View>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.tdScore}>{item.score}</Text>
                  <Text style={styles.tdGap}>{item.gap}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 14,
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
  tabsRow: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    padding: 3,
    borderRadius: 12,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: productTheme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.muted,
  },
  tabTextActive: {
    color: productTheme.ink,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
    marginBottom: 10,
  },
  defisGroup: {
    gap: 12,
  },
  challengeCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  challengeCopy: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  challengeMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.greenDark,
  },
  challengeDates: {
    marginTop: 2,
    fontSize: 11,
    color: productTheme.muted,
  },
  joinBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeJoinBtn: {
    backgroundColor: productTheme.green,
  },
  quitBtn: {
    backgroundColor: productTheme.background,
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  activeJoinBtnText: {
    color: '#FFFFFF',
  },
  quitBtnText: {
    color: productTheme.muted,
  },
  leaderboardGroup: {},
  userRankBanner: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 15,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
  },
  userRankLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.greenDark,
  },
  userRankValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '900',
    color: productTheme.greenDark,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterDropdown: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.greenDark,
  },
  leaderboardTable: {
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thRang: { width: 45, fontSize: 11, fontWeight: '800', color: productTheme.muted },
  thMembre: { flex: 1, fontSize: 11, fontWeight: '800', color: productTheme.muted },
  thScore: { width: 70, fontSize: 11, fontWeight: '800', color: productTheme.muted, textAlign: 'right' },
  thGap: { width: 70, fontSize: 11, fontWeight: '800', color: productTheme.muted, textAlign: 'right' },
  tableRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tdRang: { width: 45, fontSize: 13, fontWeight: '800', color: productTheme.ink },
  tdUserCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  userName: { flex: 1, fontSize: 13, fontWeight: '700', color: productTheme.ink },
  tdScore: { width: 70, fontSize: 13, fontWeight: '800', color: productTheme.ink, textAlign: 'right' },
  tdGap: { width: 70, fontSize: 12, fontWeight: '600', color: productTheme.muted, textAlign: 'right' },
});
