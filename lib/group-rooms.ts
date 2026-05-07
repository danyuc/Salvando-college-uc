import { supabase } from "./supabase"

export async function createRoom(mode: string) {
  const code = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()

  await supabase
    .from("study_group_rooms")
    .insert({
      code,
      mode,
    })

  return code
}

export async function joinRoom(input: {
  code: string
  nickname: string
}) {
  await supabase
    .from("study_group_players")
    .insert({
      room_code: input.code,
      nickname: input.nickname,
    })
}

export async function getPlayers(code: string) {
  const { data } = await supabase
    .from("study_group_players")
    .select("*")
    .eq("room_code", code)
    .order("score", { ascending: false })

  return data || []
}

export async function updateScore(input: {
  code: string
  nickname: string
  points: number
}) {
  const { data } = await supabase
    .from("study_group_players")
    .select("*")
    .eq("room_code", input.code)
    .eq("nickname", input.nickname)
    .single()

  if (!data) return

  await supabase
    .from("study_group_players")
    .update({
      score: Math.max(0, (data.score || 0) + input.points),
    })
    .eq("id", data.id)
}

export async function updateRoomState(input: {
  code: string
  currentQuestion?: string
  selectedPlayer?: string
  hostNickname?: string
  timeLeft?: number
  roundStarted?: boolean
}) {
  const { data, error } = await supabase
    .from("study_group_rooms")
    .update({
      current_question: input.currentQuestion,
      selected_player: input.selectedPlayer,
      host_nickname: input.hostNickname,
      time_left: input.timeLeft,
      round_started: input.roundStarted,
    })
    .eq("code", input.code)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRoom(code: string) {
  const { data, error } = await supabase
    .from("study_group_rooms")
    .select("*")
    .eq("code", code)
    .single()

  if (error) return null
  return data
}

export async function updateMemberScore(input: {
  memberId: string
  score: number
}) {
  const { data, error } = await supabase
    .from("study_group_members")
    .update({ score: input.score })
    .eq("id", input.memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRoomMembers(code: string) {
  const { data, error } = await supabase
    .from("study_group_members")
    .select("*")
    .eq("room_code", code)
    .order("score", { ascending: false })

  if (error) return []
  return data || []
}
