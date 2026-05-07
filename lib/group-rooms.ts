import { supabase } from "./supabase"

export type GroupQuestion = {
  id: string
  text: string
  options: string[]
  correct: string
  topic: string
  difficulty: "media" | "alta" | "uc"
}

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createRoom(mode: string) {
  const code = makeCode()

  const { error } = await supabase.from("study_group_rooms").insert({
    code,
    mode,
    current_question: null,
    selected_player: null,
    host_nickname: "Host",
    time_left: 60,
    round_started: false,
  })

  if (error) {
    console.warn("Supabase createRoom failed, using local room:", error.message)
    return code
  }

  return code
}

export async function joinRoom(input: { code: string; nickname: string }) {
  const { error } = await supabase.from("study_group_members").insert({
    room_code: input.code,
    nickname: input.nickname,
    score: 0,
  })

  if (error) {
    console.warn("Supabase joinRoom failed:", error.message)
  }
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

export async function getRoom(code: string) {
  const { data, error } = await supabase
    .from("study_group_rooms")
    .select("*")
    .eq("code", code)
    .single()

  if (error) return null
  return data
}

export async function updateRoomState(input: {
  code: string
  currentQuestion?: string | null
  selectedPlayer?: string | null
  hostNickname?: string
  timeLeft?: number
  roundStarted?: boolean
}) {
  const payload: any = {}

  if ("currentQuestion" in input) payload.current_question = input.currentQuestion
  if ("selectedPlayer" in input) payload.selected_player = input.selectedPlayer
  if ("hostNickname" in input) payload.host_nickname = input.hostNickname
  if ("timeLeft" in input) payload.time_left = input.timeLeft
  if ("roundStarted" in input) payload.round_started = input.roundStarted

  const { error } = await supabase
    .from("study_group_rooms")
    .update(payload)
    .eq("code", input.code)

  if (error) console.warn("updateRoomState failed:", error.message)
}

export async function updateMemberScore(input: {
  memberId: string
  score: number
}) {
  const { error } = await supabase
    .from("study_group_members")
    .update({ score: input.score })
    .eq("id", input.memberId)

  if (error) console.warn("updateMemberScore failed:", error.message)
}
