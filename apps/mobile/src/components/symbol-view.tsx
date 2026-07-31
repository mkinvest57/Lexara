import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type PlatformSymbol = {
  ios?: string;
  android?: string;
  web?: string;
  default?: string;
};

type SymbolViewProps = {
  name: string | PlatformSymbol;
  size?: number;
  style?: StyleProp<TextStyle>;
  tintColor?: string;
  weight?: string;
};

const iconMap: Record<string, IoniconName> = {
  airplane: 'airplane',
  'arrow.up': 'arrow-up',
  'arrow.up.right': 'arrow-up-outline',
  'book.pages.fill': 'book',
  bookmark: 'bookmark-outline',
  'bookmark.fill': 'bookmark',
  'books.vertical': 'library-outline',
  'brain.head.profile': 'bulb-outline',
  'briefcase.fill': 'briefcase',
  'building.columns.fill': 'library',
  'camera.viewfinder': 'scan',
  'chart.bar.fill': 'bar-chart',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'character.book.closed.fill': 'book',
  checkmark: 'checkmark',
  'checkmark.circle.fill': 'checkmark-circle',
  'checkmark.shield.fill': 'shield-checkmark',
  'chevron.down': 'chevron-down',
  'chevron.left': 'chevron-back',
  'chevron.right': 'chevron-forward',
  'chevron.up': 'chevron-up',
  'cup.and.saucer.fill': 'cafe',
  'doc.fill': 'document',
  'doc.text.fill': 'document-text',
  ellipsis: 'ellipsis-horizontal',
  'exclamationmark.circle.fill': 'alert-circle',
  'exclamationmark.triangle.fill': 'warning',
  'externaldrive.badge.exclamationmark': 'cloud-offline-outline',
  'figure.2.and.child.holdinghands': 'people',
  'figure.run': 'walk',
  'flame.fill': 'flame',
  gearshape: 'settings-outline',
  'gearshape.fill': 'settings',
  globe: 'globe-outline',
  'globe.americas.fill': 'globe',
  'globe.asia.australia.fill': 'globe',
  'globe.europe.africa.fill': 'globe',
  'graduationcap.fill': 'school',
  headphones: 'headset',
  'heart.fill': 'heart',
  'house.fill': 'home',
  hourglass: 'hourglass-outline',
  infinity: 'infinite',
  lightbulb: 'bulb-outline',
  'lightbulb.fill': 'bulb',
  'line.3.horizontal': 'menu',
  link: 'link',
  'list.bullet.rectangle': 'list',
  'lock.fill': 'lock-closed',
  magnifyingglass: 'search',
  'message.fill': 'chatbubble',
  minus: 'remove',
  'pause.fill': 'pause',
  'pencil.line': 'pencil',
  'person.2.fill': 'people',
  'person.crop.circle.fill': 'person-circle',
  'play.fill': 'play',
  'popcorn.fill': 'film',
  plus: 'add',
  'rectangle.stack.fill': 'albums',
  'safari.fill': 'compass',
  'speaker.wave.2.fill': 'volume-high',
  sparkles: 'sparkles',
  speedometer: 'speedometer',
  'square.and.arrow.down': 'download',
  'text.book.closed.fill': 'book',
  'text.bubble': 'chatbox-ellipses-outline',
  'theatermasks.fill': 'film',
  waveform: 'pulse',
  xmark: 'close',
  'xmark.circle.fill': 'close-circle',
};

function resolveSymbolName(name: string | PlatformSymbol) {
  if (typeof name === 'string') return name;
  return name.ios ?? name.android ?? name.web ?? name.default ?? 'ellipse';
}

export function SymbolView({
  name,
  size = 24,
  style,
  tintColor = '#111111',
}: SymbolViewProps) {
  const symbol = resolveSymbolName(name);
  return (
    <Ionicons
      accessibilityElementsHidden
      importantForAccessibility="no"
      color={tintColor}
      name={iconMap[symbol] ?? 'ellipse-outline'}
      size={size}
      style={style}
    />
  );
}
