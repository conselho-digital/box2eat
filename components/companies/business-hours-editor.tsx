"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  WEEKDAY_LABELS,
  upsertBusinessHours,
  type BusinessHour,
  type BusinessHourInput,
} from "@/lib/domain/business-hours";

function buildInitialWeek(hours: BusinessHour[]): BusinessHourInput[] {
  return WEEKDAY_LABELS.map((_, dayOfWeek) => {
    const existing = hours.find((h) => h.day_of_week === dayOfWeek);
    return {
      dayOfWeek,
      isClosed: existing?.is_closed ?? true,
      opensAt: existing?.opens_at ?? "09:00",
      closesAt: existing?.closes_at ?? "18:00",
    };
  });
}

export function BusinessHoursEditor({
  companyId,
  initialHours,
}: {
  companyId: string;
  initialHours: BusinessHour[];
}) {
  const [week, setWeek] = useState<BusinessHourInput[]>(() => buildInitialWeek(initialHours));

  const saveMutation = useMutation({
    mutationFn: async (input: BusinessHourInput[]) => {
      const supabase = createClient();
      const { error } = await upsertBusinessHours(supabase, companyId, input);
      if (error) throw error;
    },
  });

  function updateDay(dayOfWeek: number, patch: Partial<BusinessHourInput>) {
    setWeek((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Horário de funcionamento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {week.map((day) => (
          <div key={day.dayOfWeek} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0">{WEEKDAY_LABELS[day.dayOfWeek]}</span>
            <label className="flex shrink-0 items-center gap-1.5">
              <input
                type="checkbox"
                checked={!day.isClosed}
                onChange={(e) => updateDay(day.dayOfWeek, { isClosed: !e.target.checked })}
              />
              Aberto
            </label>
            {!day.isClosed && (
              <>
                <input
                  type="time"
                  value={day.opensAt ?? ""}
                  onChange={(e) => updateDay(day.dayOfWeek, { opensAt: e.target.value })}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                />
                <span className="text-muted-foreground">até</span>
                <input
                  type="time"
                  value={day.closesAt ?? ""}
                  onChange={(e) => updateDay(day.dayOfWeek, { closesAt: e.target.value })}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                />
              </>
            )}
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          className="w-fit"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate(week)}
        >
          {saveMutation.isPending ? "Salvando…" : "Salvar horários"}
        </Button>
        {saveMutation.isSuccess && <p className="text-sm text-primary">Salvo.</p>}
        {saveMutation.isError && (
          <p className="text-sm text-destructive">Não foi possível salvar. Tente de novo.</p>
        )}
      </CardContent>
    </Card>
  );
}
