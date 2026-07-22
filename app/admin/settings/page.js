'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import {
  HiOutlineCheckCircle, HiOutlineCog, HiOutlineExclamation,
  HiOutlineMail, HiOutlinePhone, HiOutlineRefresh, HiOutlineShieldCheck,
  HiOutlineTag, HiOutlinePlus, HiOutlineX
} from 'react-icons/hi';

const defaultSources = ['Admission', 'Board', 'Main Book', 'Onusiloni', 'Top School/College', 'Inspired'];

const defaults = {
  platformName: '',
  platformDescription: '',
  supportEmail: '',
  supportPhone: '',
  maintenanceMode: false,
  allowTeacherRegistration: true,
  questionSources: defaultSources,
};

const editable = (value) => ({
  platformName: value.platformName,
  platformDescription: value.platformDescription,
  supportEmail: value.supportEmail,
  supportPhone: value.supportPhone,
  maintenanceMode: value.maintenanceMode,
  allowTeacherRegistration: value.allowTeacherRegistration,
  questionSources: value.questionSources || defaultSources,
});

export default function SettingsPage() {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [status, setStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [newSourceInput, setNewSourceInput] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await apiClient.get('/settings');
      const value = {
        ...defaults,
        ...response.data,
        questionSources: response.data?.questionSources?.length ? response.data.questionSources : defaultSources,
      };
      setForm(value); setSaved(value); setUpdatedAt(value.updatedAt); setStatus('success');
    } catch { setStatus('error'); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const dirty = JSON.stringify(editable(form)) !== JSON.stringify(editable(saved));

  const addSourceTag = () => {
    const tag = newSourceInput.trim();
    if (!tag) return;
    if (form.questionSources.includes(tag)) {
      toast.error('এই সোর্স ট্যাগটি ইতিমধ্যেই যোগ করা আছে');
      return;
    }
    setForm((current) => ({ ...current, questionSources: [...current.questionSources, tag] }));
    setNewSourceInput('');
  };

  const removeSourceTag = (tagToRemove) => {
    if (form.questionSources.length <= 1) {
      toast.error('কমপক্ষে ১টি সোর্স ট্যাগ থাকা আবশ্যক');
      return;
    }
    setForm((current) => ({
      ...current,
      questionSources: current.questionSources.filter((t) => t !== tagToRemove),
    }));
  };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const response = await apiClient.put('/settings', editable(form));
      const value = {
        ...defaults,
        ...response.data,
        questionSources: response.data?.questionSources?.length ? response.data.questionSources : defaultSources,
      };
      setForm(value); setSaved(value); setUpdatedAt(value.updatedAt);
      toast.success('সেটিংস সংরক্ষণ হয়েছে');
    } catch (error) { toast.error(error?.error?.message || 'সেটিংস সংরক্ষণ করা যায়নি'); }
    finally { setSaving(false); }
  };

  if (status === 'loading') return <div className="mx-auto max-w-5xl animate-pulse"><div className="mb-6 h-8 w-48 rounded bg-neutral-200" /><div className="h-[520px] rounded-2xl bg-white" /></div>;
  if (status === 'error') return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center"><div className="w-full rounded-2xl border border-rose-200 bg-white p-7 text-center"><HiOutlineExclamation className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-bold">সেটিংস লোড করা যায়নি</h1><p className="mt-2 text-sm text-neutral-500">ব্যাকএন্ড সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p><Button onClick={load} className="mt-5"><HiOutlineRefresh className="h-4 w-4" /> আবার চেষ্টা করুন</Button></div></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <header className="mb-7"><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Platform configuration</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">সাধারণ সেটিংস</h1><p className="mt-1 text-sm text-neutral-500">প্ল্যাটফর্ম পরিচিতি, সহায়তা ও প্রবেশাধিকার নিয়ন্ত্রণ করুন</p></header>
      <form onSubmit={submit} className="space-y-5">
        <Panel icon={HiOutlineCog} title="প্ল্যাটফর্ম পরিচিতি" subtitle="ব্যবহারকারীদের কাছে প্রদর্শিত মৌলিক তথ্য">
          <Field label="প্ল্যাটফর্ম নাম"><input required maxLength={100} value={form.platformName} onChange={(e) => change('platformName', e.target.value)} className="admin-setting-input" /></Field>
          <Field label="বিবরণ"><textarea rows={4} maxLength={500} value={form.platformDescription} onChange={(e) => change('platformDescription', e.target.value)} className="admin-setting-input py-3" /></Field>
        </Panel>

        <Panel icon={HiOutlineTag} title="প্রশ্ন উৎস ব্যবস্থাপনা (Dynamic Question Sources)" subtitle="প্রশ্নের উৎস ট্যাগগুলো পছন্দমত যুক্ত ও পরিচালনা করুন (যেমন: Inspired, Board, Admission)">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন উৎস ট্যাগ লিখুন (যেমন: Inspired, Verification Pending)"
                value={newSourceInput}
                onChange={(e) => setNewSourceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSourceTag(); } }}
                className="admin-setting-input flex-1"
              />
              <Button type="button" onClick={addSourceTag} variant="secondary">
                <HiOutlinePlus className="h-4 w-4 mr-1" /> যুক্ত করুন
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {form.questionSources?.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    tag === 'Inspired'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                      : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                  }`}
                >
                  <HiOutlineTag className="h-3.5 w-3.5 text-neutral-400" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeSourceTag(tag)}
                    className="ml-1 text-neutral-400 hover:text-rose-600 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <HiOutlineX className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              * <b>"Inspired"</b> উৎস ট্যাগটি কালেকশন করা প্রশ্নগুলোর সঠিকতা পরবর্তীতে ভেরিফাই করার জন্য ব্যবহৃত হবে।
            </p>
          </div>
        </Panel>

        <Panel icon={HiOutlineMail} title="সহায়তা যোগাযোগ" subtitle="ব্যবহারকারীরা যে ঠিকানায় সহায়তা চাইবেন">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="ইমেইল"><div className="relative"><HiOutlineMail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" /><input type="email" value={form.supportEmail} onChange={(e) => change('supportEmail', e.target.value)} className="admin-setting-input pl-10" /></div></Field>
            <Field label="ফোন"><div className="relative"><HiOutlinePhone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" /><input maxLength={30} value={form.supportPhone} onChange={(e) => change('supportPhone', e.target.value)} className="admin-setting-input pl-10" /></div></Field>
          </div>
        </Panel>

        <Panel icon={HiOutlineShieldCheck} title="প্রবেশাধিকার" subtitle="গুরুত্বপূর্ণ প্ল্যাটফর্ম নিয়ন্ত্রণ">
          <Toggle title="শিক্ষক নিবন্ধন" text="নতুন শিক্ষকরা অ্যাকাউন্ট তৈরি করতে পারবেন" checked={form.allowTeacherRegistration} onChange={(value) => change('allowTeacherRegistration', value)} />
          <Toggle title="রক্ষণাবেক্ষণ মোড" text="প্ল্যাটফর্মকে রক্ষণাবেক্ষণ অবস্থায় চিহ্নিত করুন" checked={form.maintenanceMode} onChange={(value) => change('maintenanceMode', value)} danger />
        </Panel>
        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">{updatedAt ? 'সর্বশেষ সংরক্ষণ: ' + new Date(updatedAt).toLocaleString('bn-BD') : 'এখনও সংরক্ষণ করা হয়নি'}</p>
          <div className="flex gap-2"><Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setForm(saved)} className="flex-1">বাতিল</Button><Button type="submit" loading={saving} disabled={!dirty} className="flex-1"><HiOutlineCheckCircle className="h-4 w-4" /> সংরক্ষণ</Button></div>
        </div>
      </form>
    </motion.div>
  );
}

function Panel({ icon: Icon, title, subtitle, children }) {
  return <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b px-4 py-4 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon className="h-5 w-5" /></span><div><h2 className="font-bold">{title}</h2><p className="text-xs text-neutral-500">{subtitle}</p></div></div><div className="space-y-5 p-4 sm:p-6">{children}</div></section>;
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>{children}</label>; }
function Toggle({ title, text, checked, onChange, danger }) {
  return <label className="mb-3 flex min-h-[72px] cursor-pointer items-center justify-between gap-4 rounded-xl border p-3.5 hover:bg-neutral-50"><span><b className="block text-sm">{title}</b><small className="mt-1 block text-neutral-500">{text}</small></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" /><span className={['relative h-7 w-12 shrink-0 rounded-full', checked ? (danger ? 'bg-rose-500' : 'bg-primary-600') : 'bg-neutral-300'].join(' ')}><span className={['absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1'].join(' ')} /></span></label>;
}