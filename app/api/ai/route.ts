import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

// Assainit l'entrée utilisateur pour éviter les injections de prompt
function sanitizeTitle(raw: unknown): string {
  if (typeof raw !== 'string') return 'notre mariage';
  return raw
    .replace(/[\x00-\x1F\x7F]/g, '') // supprime les caractères de contrôle
    .trim()
    .slice(0, 200) || 'notre mariage';
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Securite : L'utilisateur doit etre connecte pour utiliser l'IA
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { ok } = rateLimit(`ai:${user.id}`, 10, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const title = sanitizeTitle(body?.title);

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ 
        error: "Service IA temporairement indisponible." 
      }, { status: 503 });
    }

    // Prompt système séparé du contenu utilisateur pour éviter les injections
    const systemPrompt = `Tu es un prestigieux organisateur de mariage au Sénégal. 
Rédige un magnifique texte d'invitation (un faire-part) pour un événement.
Le ton doit être solennel, poétique, romantique, très chaleureux, et respectueux des valeurs traditionnelles sénégalaises.
Le texte doit faire environ 2 à 3 petits paragraphes. 
Ne mets PAS de variables entre crochets, sois direct. Ne mets pas de titre au texte. Écris en français parfait. Ne rajoute aucun commentaire.`;

    // Appel direct a l'API Groq (compatible avec le format OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `L'événement s'intitule : "${title}"` },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Erreur Groq API:", err);
      // V6 : Ne jamais exposer les détails d'erreur internes au client
      return NextResponse.json({ error: 'Le service IA est temporairement indisponible. Réessayez plus tard.' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("Erreur AI route:", e);
    return NextResponse.json({ error: 'Erreur interne du service IA.' }, { status: 500 });
  }
}

