/**
 * Mobile phonetics entry point.
 *
 * No pinyin provider is registered here: `pinyin-pro` would add significant
 * weight to the native bundle. Mandarin falls back to the built-in tables in
 * @yapro/core until a lightweight native provider is wired in.
 */

export { getPhoneticAnnotation, defaultPhoneticMode, type PhoneticMode } from '@yapro/core';
