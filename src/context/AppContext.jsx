import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [plans, setPlans] = useState([]);          // [{...plan, moduleIds:[]}]
  const [assignments, setAssignments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('admin');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Fetch all data ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: staffData,       error: e1 },
        { data: modulesData,     error: e2 },
        { data: assignData,      error: e3 },
        { data: planRows,        error: e4 },
        { data: planModuleRows,  error: e5 },
        { data: catData,         error: e6 },
      ] = await Promise.all([
        supabase.from('staff').select('*').order('name'),
        supabase.from('modules').select('*').order('title'),
        supabase.from('assignments').select('*'),
        supabase.from('plans').select('*').order('title'),
        supabase.from('plan_modules').select('*').order('position'),
        supabase.from('categories').select('*').order('position'),
      ]);

      for (const err of [e1, e2, e3, e4, e5]) {
        if (err) throw err;
      }

      // Normalise snake_case → camelCase for assignments
      const normAssign = (assignData || []).map(a => ({
        id: a.id,
        staffId: a.staff_id,
        moduleId: a.module_id,
        assignedDate: a.assigned_date,
        dueDate: a.due_date,
        status: a.status,
        progress: a.progress,
        score: a.score,
      }));

      // Attach moduleIds array to each plan
      const normPlans = (planRows || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        moduleIds: (planModuleRows || [])
          .filter(pm => pm.plan_id === p.id)
          .sort((a, b) => a.position - b.position)
          .map(pm => pm.module_id),
      }));

      setStaff(staffData || []);
      setModules(modulesData || []);
      setCategories(catData || []);
      setAssignments(normAssign);
      setPlans(normPlans);
    } catch (err) {
      console.error('fetchAll error:', err);
      showToast('Failed to load data from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Modules ────────────────────────────────────────────────
  const addModule = async (mod) => {
    const { data, error } = await supabase.from('modules').insert([{
      title: mod.title, category: mod.category, duration: mod.duration,
      description: mod.description, lessons: mod.lessons, pass_mark: mod.passMark,
    }]).select().single();
    if (error) { showToast('Failed to create module', 'error'); return null; }
    setModules(prev => [...prev, data].sort((a, b) => a.title.localeCompare(b.title)));
    showToast('Module created');
    return data;
  };

  const updateModule = async (id, updates) => {
    const patch = {};
    if (updates.title       !== undefined) patch.title       = updates.title;
    if (updates.category    !== undefined) patch.category    = updates.category;
    if (updates.duration    !== undefined) patch.duration    = updates.duration;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.lessons     !== undefined) patch.lessons     = updates.lessons;
    if (updates.passMark    !== undefined) patch.pass_mark   = updates.passMark;
    const { error } = await supabase.from('modules').update(patch).eq('id', id);
    if (error) { showToast('Failed to update module', 'error'); return; }
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    showToast('Module updated');
  };

  const deleteModule = async (id) => {
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) { showToast('Failed to delete module', 'error'); return; }
    setModules(prev => prev.filter(m => m.id !== id));
    setAssignments(prev => prev.filter(a => a.moduleId !== id));
    showToast('Module deleted');
  };

  // ── Staff ──────────────────────────────────────────────────
  const addStaff = async (member) => {
    const { data, error } = await supabase.from('staff').insert([{
      name: member.name, role: member.role, dept: member.dept,
      email: member.email, avatar: member.avatar, color: member.color,
    }]).select().single();
    if (error) { showToast('Failed to add staff member', 'error'); return null; }
    setStaff(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    showToast('Staff member added');
    return data;
  };

  const deleteStaff = async (id) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) { showToast('Failed to remove staff member', 'error'); return; }
    setStaff(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => prev.filter(a => a.staffId !== id));
    showToast('Staff member removed');
  };

  // ── Assignments ────────────────────────────────────────────
  const addAssignment = async (assignment) => {
    const row = {
      staff_id:      assignment.staffId,
      module_id:     assignment.moduleId,
      assigned_date: assignment.assignedDate,
      due_date:      assignment.dueDate,
      status:        assignment.status || 'not_started',
      progress:      assignment.progress || 0,
      score:         assignment.score || null,
    };
    const { data, error } = await supabase.from('assignments').insert([row]).select().single();
    if (error) {
      if (error.code === '23505') showToast('This module is already assigned to that staff member', 'error');
      else showToast('Failed to assign module', 'error');
      return null;
    }
    const norm = { id: data.id, staffId: data.staff_id, moduleId: data.module_id, assignedDate: data.assigned_date, dueDate: data.due_date, status: data.status, progress: data.progress, score: data.score };
    setAssignments(prev => [...prev, norm]);
    showToast('Module assigned successfully');
    return norm;
  };

  const updateAssignment = async (id, updates) => {
    const patch = {};
    if (updates.status   !== undefined) patch.status   = updates.status;
    if (updates.progress !== undefined) patch.progress = updates.progress;
    if (updates.score    !== undefined) patch.score    = updates.score;
    if (updates.dueDate  !== undefined) patch.due_date = updates.dueDate;
    const { error } = await supabase.from('assignments').update(patch).eq('id', id);
    if (error) { showToast('Failed to update assignment', 'error'); return; }
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // ── Plans ──────────────────────────────────────────────────
  const addPlan = async (plan) => {
    const { data: planData, error: planError } = await supabase
      .from('plans').insert([{ title: plan.title, description: plan.description, icon: plan.icon || 'server' }])
      .select().single();
    if (planError) { showToast('Failed to create plan', 'error'); return null; }

    if (plan.moduleIds?.length) {
      const pmRows = plan.moduleIds.map((mid, i) => ({ plan_id: planData.id, module_id: mid, position: i }));
      await supabase.from('plan_modules').insert(pmRows);
    }

    const newPlan = { ...planData, moduleIds: plan.moduleIds || [] };
    setPlans(prev => [...prev, newPlan]);
    showToast('Learning plan created');
    return newPlan;
  };

  const assignPlanToStaff = async (planId, staffIds, firstDueDate) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const rows = [];
    staffIds.forEach(staffId => {
      plan.moduleIds.forEach((moduleId, i) => {
        const exists = assignments.find(a => a.staffId === staffId && a.moduleId === moduleId);
        if (!exists) {
          const due = new Date(firstDueDate);
          due.setDate(due.getDate() + i * 14);
          rows.push({
            staff_id: staffId, module_id: moduleId,
            assigned_date: new Date().toISOString().split('T')[0],
            due_date: due.toISOString().split('T')[0],
            status: 'not_started', progress: 0, score: null,
          });
        }
      });
    });
    if (!rows.length) { showToast('All modules already assigned', 'error'); return; }
    const { data, error } = await supabase.from('assignments').insert(rows).select();
    if (error) { showToast('Failed to assign plan', 'error'); return; }
    const normed = data.map(d => ({ id: d.id, staffId: d.staff_id, moduleId: d.module_id, assignedDate: d.assigned_date, dueDate: d.due_date, status: d.status, progress: d.progress, score: d.score }));
    setAssignments(prev => [...prev, ...normed]);
    showToast(`Plan assigned to ${staffIds.length} staff member${staffIds.length > 1 ? 's' : ''}`);
  };

  // ── Categories ────────────────────────────────────────────
  const addCategory = async (cat) => {
    // Generate a unique key: label slug + timestamp suffix to avoid collisions
    const slug = cat.label.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 15);
    const key  = slug + '_' + Date.now().toString(36).toUpperCase();
    const { data, error } = await supabase.from('categories')
      .insert([{ key, label: cat.label, color: cat.color, position: categories.length }])
      .select().single();
    if (error) {
      showToast('Failed to create category: ' + error.message, 'error');
      console.error('addCategory error:', error);
      return null;
    }
    setCategories(prev => [...prev, data]);
    showToast('Category created');
    return data;
  };

  const updateCategory = async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) { showToast('Failed to update category', 'error'); return; }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Category updated');
  };

  const deleteCategory = async (id) => {
    const cat = categories.find(c => c.id === id);
    const inUse = modules.some(m => m.category === cat?.key);
    if (inUse) { showToast('Cannot delete — modules are using this category', 'error'); return; }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { showToast('Failed to delete category', 'error'); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted');
  };

  // ── Derived helpers ────────────────────────────────────────
  const getStaffAssignments  = (staffId)  => assignments.filter(a => a.staffId  === staffId);
  const getModuleAssignments = (moduleId) => assignments.filter(a => a.moduleId === moduleId);

  const stats = {
    totalStaff:      staff.length,
    totalModules:    modules.length,
    completions:     assignments.filter(a => a.status === 'completed').length,
    overdue:         assignments.filter(a => a.status !== 'completed' && new Date(a.dueDate) < new Date()).length,
    completionRate:  assignments.length
      ? Math.round((assignments.filter(a => a.status === 'completed').length / assignments.length) * 100)
      : 0,
  };

  return (
    <AppContext.Provider value={{
      modules, staff, plans, assignments, categories, loading, view, setView, toast,
      showToast, addAssignment, updateAssignment, addModule, updateModule,
      deleteStaff,
      deleteModule, addStaff, addPlan, assignPlanToStaff,
      addCategory, updateCategory, deleteCategory,
      getStaffAssignments, getModuleAssignments, stats, refetch: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
