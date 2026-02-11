import { format, startOfWeek } from 'date-fns';
import { supabaseServer } from '@/lib/supabase-server';

export type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sort_order: number;
};

export type LessonRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  summary: string;
  key_arguments: string[];
  objections: string[];
  key_terms: { term: string; definition: string }[];
  references_text: string[];
  body_markdown: string;
  sort_order: number;
};

export async function requireUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function getAcademyModules() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from('modules').select('*').order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as ModuleRow[];
}

export async function getLessonsForModule(moduleId: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as LessonRow[];
}

export async function getLessonProgress(userId: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.lesson_id));
}

export function toISODate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekStartISO(date = new Date()) {
  return toISODate(startOfWeek(date, { weekStartsOn: 1 }));
}
