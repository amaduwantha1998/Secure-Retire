import { useMemo, useCallback } from 'react';
import { useRealTimeTranslation } from './useRealTimeTranslation';
import { useTranslation } from 'react-i18next';

interface UseDynamicTranslationReturn {
  dt: (text: string) => string;
  isLoading: boolean;
}

// Simple cache for dynamic translations - no state involved
const dynamicCache = new Map<string, string>();
const translationPromises = new Map<string, Promise<string>>();

export const useDynamicTranslation = (): UseDynamicTranslationReturn => {
  const { i18n } = useTranslation();
  const { translateText, isTranslating } = useRealTimeTranslation();

  const dt = useCallback((text: string): string => {
    const cacheKey = `${text}_${i18n.language}`;
    
    // Return from cache if available
    if (dynamicCache.has(cacheKey)) {
      return dynamicCache.get(cacheKey) || text;
    }

    // If target language is English, return original text and cache it
    if (i18n.language === 'en') {
      dynamicCache.set(cacheKey, text);
      return text;
    }

    // Check if we already have a translation promise for this text
    if (translationPromises.has(cacheKey)) {
      // Return original text while promise is pending
      return text;
    }

    // Create and cache the translation promise
    const translationPromise = translateText(text, i18n.language)
      .then(translatedText => {
        // Cache the result
        dynamicCache.set(cacheKey, translatedText);
        return translatedText;
      })
      .catch(error => {
        console.error('Dynamic translation error:', error);
        // Cache the original text as fallback
        dynamicCache.set(cacheKey, text);
        return text;
      })
      .finally(() => {
        // Remove the promise from our tracking
        translationPromises.delete(cacheKey);
      });

    translationPromises.set(cacheKey, translationPromise);

    // Return original text immediately while translation is in progress
    return text;
  }, [i18n.language, translateText]);

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    dt,
    isLoading: isTranslating || translationPromises.size > 0
  }), [dt, isTranslating, translationPromises.size]);

  return returnValue;
};