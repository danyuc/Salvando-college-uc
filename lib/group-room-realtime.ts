import { supabase } from "./supabase"

export function subscribeToRoom(
  roomCode: string,
  callback: () => void
) {
  const roomChannel = supabase
    .channel(`room-${roomCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "study_group_rooms",
        filter: `code=eq.${roomCode}`,
      },
      () => callback()
    )
    .subscribe()

  const membersChannel = supabase
    .channel(`members-${roomCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "study_group_members",
        filter: `room_code=eq.${roomCode}`,
      },
      () => callback()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(roomChannel)
    supabase.removeChannel(membersChannel)
  }
}
