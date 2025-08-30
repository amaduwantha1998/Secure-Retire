import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/utils/sentry';

interface TranslationCache {
  [key: string]: {
    [language: string]: string;
  };
}

interface UseRealTimeTranslationReturn {
  t: (key: string, fallback?: string) => string;
  isTranslating: boolean;
  translateText: (text: string, targetLanguage?: string) => Promise<string>;
  clearCache: () => void;
}

const translationCache: TranslationCache = {};
const pendingTranslations = new Set<string>();
const activeRequests = new Map<string, Promise<string>>();

export const useRealTimeTranslation = (): UseRealTimeTranslationReturn => {
  const { i18n, t: originalT } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const translateText = useCallback(async (
    text: string, 
    targetLanguage?: string
  ): Promise<string> => {
    const language = targetLanguage || i18n.language;
    
    // Return original text if target language is English
    if (language === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-en-${language}`;
    if (translationCache[cacheKey]?.[language]) {
      return translationCache[cacheKey][language];
    }

    // Return existing promise if request is already active
    if (activeRequests.has(cacheKey)) {
      return activeRequests.get(cacheKey)!;
    }

    // Avoid duplicate requests
    if (pendingTranslations.has(cacheKey)) {
      return text; // Return original text while translation is pending
    }

    const translationPromise = (async () => {
      try {
        pendingTranslations.add(cacheKey);
        
        if (mountedRef.current) {
          setIsTranslating(true);
        }

        // Check Supabase cache first
        const { data: cachedTranslation } = await supabase
          .from('translations')
          .select('value')
          .eq('key', cacheKey)
          .eq('language', language)
          .maybeSingle();

        if (cachedTranslation) {
          // Update local cache
          if (!translationCache[cacheKey]) {
            translationCache[cacheKey] = {};
          }
          translationCache[cacheKey][language] = cachedTranslation.value;
          return cachedTranslation.value;
        }

        // Call translation API
        const { data, error } = await supabase.functions.invoke('translate-text', {
          body: {
            text,
            targetLanguage: language,
            sourceLanguage: 'en'
          }
        });

        if (error) {
          console.error('Translation API error:', error);
          logError(new Error(`Translation API error: ${error.message}`), {
            text,
            targetLanguage: language
          });
          return text; // Fallback to original text
        }

        const translatedText = data.translatedText || text;
        
        // Update local cache
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][language] = translatedText;

        return translatedText;
      } catch (error) {
        console.error('Translation error:', error);
        logError(error as Error, { text, targetLanguage: language });
        return text; // Fallback to original text
      } finally {
        pendingTranslations.delete(cacheKey);
        activeRequests.delete(cacheKey);
        
        if (mountedRef.current) {
          setIsTranslating(false);
        }
      }
    })();

    activeRequests.set(cacheKey, translationPromise);
    return translationPromise;
  }, [i18n.language]);

  const t = useCallback((key: string, fallback?: string): string => {
    // First try the standard i18n translation
    const translation = originalT(key);
    
    // If we have a translation and it's different from the key, use it
    if (translation && translation !== key) {
      return translation;
    }

    // If we have a fallback, use that
    if (fallback) {
      return fallback;
    }

    // Return the key as last resort
    return key;
  }, [originalT]);

  const clearCache = useCallback(() => {
    Object.keys(translationCache).forEach(key => {
      delete translationCache[key];
    });
    pendingTranslations.clear();
    activeRequests.clear();
  }, []);

  // Listen for language changes and clear cache
  useEffect(() => {
    const handleLanguageChange = () => {
      clearCache();
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, clearCache]);

  return {
    t,
    isTranslating,
    translateText,
    clearCache
  };
};