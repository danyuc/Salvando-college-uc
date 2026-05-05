"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PrivateActivity = {
  id: string;
  title: string;
  subject: string;
  type: string;
  topic: string | null;
  icon: string | null;
  gradient: string | null;
  bg_soft: string | null;
};

export default function PrivateSeminarioActivity() {
  const [activities, setActivities] = useState<PrivateActivity[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("private_activities")
        .select("*")
        .eq("is_active", true)
        .contains("visible_to_user_ids", [user.id]);

      setActivities((data ?? []) as PrivateActivity[]);
    }

    load();
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="rounded-3xl border border-teal-300/20 bg-teal-400/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">
        Seminario privado
      </p>

      <div className="mt-3 space-y-3">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href="/lab-ambiental"
            className="block rounded-2xl p-4 text-white transition hover:scale-[1.01]"
            style={{
              background:
                activity.gradient ??
                "linear-gradient(135deg,#0f766e,#0891b2)",
            }}
          >
            <div className="text-lg font-black">
              {activity.icon ?? "🧪"} {activity.title}
            </div>
            <p className="mt-1 text-sm text-white/80">
              {activity.topic ?? "PM2.5 / bacterias / decibeles"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
