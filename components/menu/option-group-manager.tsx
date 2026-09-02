"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  createOption,
  createOptionGroup,
  deleteOption,
  deleteOptionGroup,
  getItem,
} from "@/lib/domain/menu";
import {
  menuOptionSchema,
  optionGroupSchema,
  type MenuOptionInput,
  type OptionGroupInput,
} from "@/lib/validations/menu";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  signDisplay: "always",
});

export function OptionGroupManager({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["menu-item", itemId];

  const { data: item } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getItem(supabase, itemId);
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const [showGroupForm, setShowGroupForm] = useState(false);
  const {
    register: registerGroup,
    handleSubmit: handleGroupSubmit,
    reset: resetGroup,
    formState: { errors: groupErrors },
  } = useForm<OptionGroupInput>({
    resolver: zodResolver(optionGroupSchema),
    defaultValues: { maxSelect: 1 },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: OptionGroupInput) => {
      const supabase = createClient();
      const { error } = await createOptionGroup(supabase, itemId, values);
      if (error) throw error;
    },
    onSuccess: () => {
      resetGroup();
      setShowGroupForm(false);
      invalidate();
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const supabase = createClient();
      const { error } = await deleteOptionGroup(supabase, groupId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Grupos de opções</h2>
        <Button size="sm" variant="outline" onClick={() => setShowGroupForm((v) => !v)}>
          {showGroupForm ? "Cancelar" : "Novo grupo"}
        </Button>
      </div>

      {showGroupForm && (
        <form
          onSubmit={handleGroupSubmit((values) => createGroupMutation.mutate(values))}
          className="flex flex-col gap-3 rounded-lg border p-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-name">Nome do grupo</Label>
            <Input id="group-name" placeholder="Ex: Acompanhamentos" {...registerGroup("name")} />
            {groupErrors.name && (
              <p className="text-sm text-destructive">{groupErrors.name.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="group-min">Mínimo obrigatório</Label>
              <Input
                id="group-min"
                type="number"
                min="0"
                placeholder="Opcional"
                className="w-28"
                {...registerGroup("minSelect")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="group-max">Máximo</Label>
              <Input id="group-max" type="number" min="1" className="w-20" {...registerGroup("maxSelect")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Deixe o mínimo em branco pra um grupo opcional, ou um número pra exigir pelo menos
            essa quantidade (ex: 1 pra obrigar escolher pelo menos uma opção).
          </p>
          {groupErrors.minSelect && (
            <p className="text-sm text-destructive">{groupErrors.minSelect.message}</p>
          )}
          <Button type="submit" disabled={createGroupMutation.isPending}>
            Criar grupo
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {item?.menu_item_option_groups.map((group) => (
          <div key={group.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.is_required ? "Obrigatório" : "Opcional"} · escolha de{" "}
                  {group.min_select} a {group.max_select}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteGroupMutation.mutate(group.id)}
              >
                Excluir grupo
              </Button>
            </div>
            <OptionsList
              groupId={group.id}
              options={group.menu_item_options}
              onChanged={invalidate}
            />
          </div>
        ))}
        {item?.menu_item_option_groups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum grupo de opções ainda. Use para variações como tamanho ou
            acompanhamentos.
          </p>
        )}
      </div>
    </div>
  );
}

function OptionsList({
  groupId,
  options,
  onChanged,
}: {
  groupId: string;
  options: { id: string; name: string; price_delta: number }[];
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuOptionInput>({
    resolver: zodResolver(menuOptionSchema),
    defaultValues: { priceDelta: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (values: MenuOptionInput) => {
      const supabase = createClient();
      const { error } = await createOption(supabase, groupId, values);
      if (error) throw error;
    },
    onSuccess: () => {
      reset();
      setShowForm(false);
      onChanged();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const supabase = createClient();
      const { error } = await deleteOption(supabase, optionId);
      if (error) throw error;
    },
    onSuccess: onChanged,
  });

  return (
    <div className="mt-3 flex flex-col gap-2">
      {options.map((option) => (
        <div key={option.id} className="flex items-center justify-between text-sm">
          <span>
            {option.name}
            {option.price_delta !== 0 && (
              <span className="text-muted-foreground"> ({currency.format(option.price_delta)})</span>
            )}
          </span>
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => deleteMutation.mutate(option.id)}
          >
            Remover
          </button>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="flex items-end gap-2"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor={`option-name-${groupId}`} className="text-xs">
              Nome
            </Label>
            <Input id={`option-name-${groupId}`} className="h-7 w-40" {...register("name")} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`option-price-${groupId}`} className="text-xs">
              Preço adicional
            </Label>
            <Input
              id={`option-price-${groupId}`}
              type="number"
              step="0.01"
              className="h-7 w-24"
              {...register("priceDelta")}
            />
          </div>
          <Button size="sm" type="submit" disabled={createMutation.isPending}>
            Adicionar
          </Button>
        </form>
      ) : (
        <Button size="sm" variant="ghost" className="w-fit" onClick={() => setShowForm(true)}>
          + opção
        </Button>
      )}
      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
    </div>
  );
}
