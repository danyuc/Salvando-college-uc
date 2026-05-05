import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LabAmbientalClient from "../components/LabAmbientalClient";

export default async function LabAmbientalPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_research_member")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_research_member) redirect("/");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <LabAmbientalClient />
    </main>
  );
}
