"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useRequireUser } from "@/lib/hooks/useRequireUser";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createTeamMember,
  listTeamMembers,
  removeTeamMember,
  updateTeamMember,
} from "@/lib/api/users";
import { translateApiError } from "@/lib/api/errorMessages";
import type { TeamMember } from "@/lib/types/user";
import type { UserRole } from "@/lib/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "editor" as UserRole };

export default function EquipePage() {
  const { ready } = useRequireUser(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>("editor");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await listTeamMembers());
    } catch (err) {
      setError(translateApiError(err, "Não foi possível carregar a equipe."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) void load();
  }, [ready, load]);

  async function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createTeamMember(form);
      setMembers((m) => [...m, created]);
      setForm(EMPTY_FORM);
      setFormOpen(false);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível adicionar essa pessoa."));
    } finally {
      setSaving(false);
    }
  }

  function startEditRole(member: TeamMember) {
    setEditingId(member.id);
    setEditingRole(member.role);
  }

  async function saveRole(id: string) {
    setError(null);
    try {
      const updated = await updateTeamMember(id, { role: editingRole });
      setMembers((m) => m.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
    } catch (err) {
      setError(translateApiError(err, "Não foi possível atualizar o papel."));
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    try {
      await removeTeamMember(id);
      setMembers((m) => m.filter((x) => x.id !== id));
    } catch (err) {
      setError(translateApiError(err, "Não foi possível remover essa pessoa."));
    }
  }

  if (!ready) return null;

  return (
    <PanelLayout>
      <div className="mx-auto max-w-[900px] p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink">Equipe</h1>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="flex h-10 items-center rounded-md bg-accent-700 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            + Adicionar pessoa
          </button>
        </div>

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {formOpen ? (
          <div className="mb-6 rounded-md border border-divider bg-surface p-5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Nome" htmlFor="newName">
                <Input
                  id="newName"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Email" htmlFor="newEmail">
                <Input
                  id="newEmail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              <Field label="Senha provisória" htmlFor="newPassword" hint="Mínimo 6 caracteres — compartilhe com a pessoa depois.">
                <Input
                  id="newPassword"
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </Field>
              <Field label="Papel" htmlFor="newRole">
                <select
                  id="newRole"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                  className="h-10 w-full rounded-md border border-divider bg-surface px-3 text-sm text-ink outline-none focus:border-accent-700 focus:ring-1 focus:ring-accent-700"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="h-10 rounded-md border border-divider bg-surface px-4 text-sm font-medium text-ink hover:border-accent-700 hover:text-accent-700"
              >
                Cancelar
              </button>
              <Button type="button" onClick={() => void handleCreate()} loading={saving} className="px-4">
                Adicionar
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-divider bg-surface p-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{member.name}</div>
                  <div className="text-[13px] text-ink-soft">{member.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === member.id ? (
                    <>
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value as UserRole)}
                        className="h-9 rounded-md border border-divider bg-surface px-2 text-sm text-ink"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Visualizador</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => void saveRole(member.id)}
                        title="Salvar"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-success"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        title="Cancelar"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-ink"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full border border-divider px-2.5 py-0.5 text-xs text-ink-soft">
                        {ROLE_LABELS[member.role]}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditRole(member)}
                        title="Editar papel"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-accent-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(member.id)}
                        title="Remover"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-neutral-bar hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
