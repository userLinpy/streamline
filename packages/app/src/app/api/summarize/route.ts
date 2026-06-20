import { NextRequest, NextResponse } from 'next/server'

type SummarizeBody = { title: string; text: string }
type GitHubModelsResponse = {
  choices: Array<{ message: { content: string } }>
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SummarizeBody
  const { title, text } = body

  if (!title?.trim() && !text?.trim()) {
    return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    return NextResponse.json({ error: 'Token GitHub non configuré' }, { status: 500 })
  }

  const content = [
    title ? `Titre : ${title}` : '',
    text ? `\n\nContenu :\n${text.slice(0, 3000)}` : '',
  ]
    .filter(Boolean)
    .join('')

  const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un assistant de veille technologique. Résume en exactement 3 points clés, en français, de façon concise et factuelle. Réponds uniquement avec un JSON valide : {"points":["point 1","point 2","point 3"]}',
        },
        { role: 'user', content },
      ],
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    return NextResponse.json(
      { error: `GitHub Models : ${res.status} — ${errText.slice(0, 200)}` },
      { status: 502 }
    )
  }

  const data = (await res.json()) as GitHubModelsResponse
  const raw = data.choices?.[0]?.message?.content ?? '{}'

  try {
    const parsed = JSON.parse(raw) as { points?: string[] }
    return NextResponse.json({ points: parsed.points ?? [] })
  } catch {
    return NextResponse.json({ error: 'Réponse invalide du modèle' }, { status: 500 })
  }
}
