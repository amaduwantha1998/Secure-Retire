import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json()
    
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: text, targetLanguage' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If target language is English or same as source, return original text
    if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
      return new Response(
        JSON.stringify({ translatedText: text }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check cache first
    const cacheKey = `${text}-${sourceLanguage}-${targetLanguage}`
    const { data: cachedTranslation } = await supabase
      .from('translations')
      .select('value')
      .eq('key', cacheKey)
      .eq('language', targetLanguage)
      .maybeSingle()

    if (cachedTranslation) {
      return new Response(
        JSON.stringify({ translatedText: cachedTranslation.value }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Try Google Translate API
    const googleApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY')
    
    if (googleApiKey) {
      const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`
      
      const response = await fetch(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const translatedText = data.data.translations[0].translatedText
        
        // Cache the translation
        await supabase
          .from('translations')
          .upsert({
            key: cacheKey,
            language: targetLanguage,
            value: translatedText
          })
        
        return new Response(
          JSON.stringify({ translatedText }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Fallback to LibreTranslate (free alternative)
    try {
      const libreResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      })

      if (libreResponse.ok) {
        const data = await libreResponse.json()
        const translatedText = data.translatedText
        
        // Cache the translation
        await supabase
          .from('translations')
          .upsert({
            key: cacheKey,
            language: targetLanguage,
            value: translatedText
          })
        
        return new Response(
          JSON.stringify({ translatedText }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (error) {
      console.error('LibreTranslate error:', error)
    }

    // Final fallback - return original text
    return new Response(
      JSON.stringify({ 
        translatedText: text,
        fallback: true,
        error: 'Translation service unavailable'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})