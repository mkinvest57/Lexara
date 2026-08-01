/**
 * Web phonetics entry point. The logic lives in @yapro/core; web additionally
 * registers the real pinyin engine, which only ships in this bundle.
 */

import { registerPinyinProvider } from '@yapro/core';
import { pinyin } from 'pinyin-pro';

registerPinyinProvider((text) => pinyin(text, { toneType: 'num', type: 'string' }));

export { getPhoneticAnnotation, defaultPhoneticMode, type PhoneticMode } from '@yapro/core';
