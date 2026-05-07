import { supabase } from "./supabase"

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createStudyGroup(input: {
  name: string
  createdBy?: string
}) {
  const code = randomCode()

  const { data, error } = await supabase
    .from("study_groups")
    .insert({
      name: input.name,
      code,
      created_by: input.createdBy || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function joinStudyGroup(input: {
  code: string
  nickname: string
  strengths?: string
  userId?: string
}) {
  const { data: group } = await supabase
    .from("study_groups")
    .select("*")
    .eq("code", input.code)
    .single()

  if (!group) throw new Error("Grupo no encontrado")

  const { data, error } = await supabase
    .from("study_group_members")
    .insert({
      group_id: group.id,
      nickname: input.nickname,
      strengths: input.strengths || "",
      user_id: input.userId || null,
    })
    .select()
    .single()

  if (error) throw error

  return {
    group,
    member: data,
  }
}

export async function getGroupMembers(groupId: string) {
  const { data } = await supabase
    .from("study_group_members")
    .select("*")
    .eq("group_id", groupId)

  return data || []
}
