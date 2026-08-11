import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AchievementsManager from '@/components/achievements/AchievementsManager'
import type { Mission, RaceResult } from '@/types'

export default async function ConquistasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, missionsResult, raceResultsResult, postsResult] = await Promise.all([
    supabase.from('profiles').select('team_joined_at').eq('user_id', user.id).single(),
    supabase.from('mission_catalog').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('race_results').select('*').eq('athlete_user_id', user.id).order('event_date', { ascending: false }),
    supabase.from('posts').select('distance_km, duration_minutes').eq('user_id', user.id).not('distance_km', 'is', null),
  ])
  if (profileResult.error || missionsResult.error || raceResultsResult.error || postsResult.error) throw new Error('Não foi possível carregar sua jornada e conquistas.')

  const raceResults = (raceResultsResult.data ?? []) as RaceResult[]
  const activities = [
    ...(postsResult.data ?? []).map((post) => ({ distanceKm: Number(post.distance_km), durationSeconds: post.duration_minutes ? Number(post.duration_minutes) * 60 : null })),
    ...raceResults.map((result) => ({ distanceKm: Number(result.distance_km), durationSeconds: result.duration_seconds })),
  ]

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-8">
      <div><p className="section-kicker mb-3">Minha jornada</p><h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">Missões e <span className="text-[#DC2626]">conquistas</span></h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#57534E]">Missões reconhecem sua evolução nos treinos. Conquistas registram premiações reais em provas — classificação geral ou por categoria.</p></div>
      <AchievementsManager missions={(missionsResult.data ?? []) as Mission[]} results={raceResults} activities={activities} joinedAt={profileResult.data.team_joined_at} />
    </div>
  )
}
