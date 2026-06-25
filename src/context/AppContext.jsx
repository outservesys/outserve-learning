import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultModules, defaultStaff, defaultPlans, defaultAssignments } from '../data/store';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [modules, setModules] = useState(() => {
    const saved = localStorage.getItem('os_modules');
    return saved ? JSON.parse(saved) : defaultModules;
  });
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('os_staff');
    return saved ? JSON.parse(saved) : defaultStaff;
  });
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('os_plans');
    return saved ? JSON.parse(saved) : defaultPlans;
  });
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('os_assignments');
    return saved ? JSON.parse(saved) : defaultAssignments;
  });
  const [view, setView] = useState('admin'); // 'admin' | 'learner'
  const [toast, setToast] = useState(null);

  useEffect(() => { localStorage.setItem('os_modules', JSON.stringify(modules)); }, [modules]);
  useEffect(() => { localStorage.setItem('os_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('os_plans', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem('os_assignments', JSON.stringify(assignments)); }, [assignments]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addAssignment = (assignment) => {
    const newA = { ...assignment, id: 'a' + Date.now() };
    setAssignments(prev => [...prev, newA]);
    showToast('Module assigned successfully');
    return newA;
  };

  const updateAssignment = (id, updates) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addModule = (mod) => {
    const newMod = { ...mod, id: 'm' + Date.now() };
    setModules(prev => [...prev, newMod]);
    showToast('Module created successfully');
    return newMod;
  };

  const updateModule = (id, updates) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showToast('Module updated');
  };

  const deleteModule = (id) => {
    setModules(prev => prev.filter(m => m.id !== id));
    setAssignments(prev => prev.filter(a => a.moduleId !== id));
    showToast('Module deleted');
  };

  const addStaff = (member) => {
    const newS = { ...member, id: 's' + Date.now() };
    setStaff(prev => [...prev, newS]);
    showToast('Staff member added');
    return newS;
  };

  const addPlan = (plan) => {
    const newP = { ...plan, id: 'p' + Date.now() };
    setPlans(prev => [...prev, newP]);
    showToast('Learning plan created');
    return newP;
  };

  const assignPlanToStaff = (planId, staffIds, dueDate) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const newAssignments = [];
    staffIds.forEach(staffId => {
      plan.moduleIds.forEach((moduleId, i) => {
        const exists = assignments.find(a => a.staffId === staffId && a.moduleId === moduleId);
        if (!exists) {
          const due = new Date(dueDate);
          due.setDate(due.getDate() + i * 14);
          newAssignments.push({
            id: 'a' + Date.now() + Math.random(),
            staffId,
            moduleId,
            assignedDate: new Date().toISOString().split('T')[0],
            dueDate: due.toISOString().split('T')[0],
            status: 'not_started',
            progress: 0,
            score: null,
          });
        }
      });
    });
    setAssignments(prev => [...prev, ...newAssignments]);
    showToast(`Learning plan assigned to ${staffIds.length} staff member${staffIds.length > 1 ? 's' : ''}`);
  };

  const getStaffAssignments = (staffId) => assignments.filter(a => a.staffId === staffId);
  const getModuleAssignments = (moduleId) => assignments.filter(a => a.moduleId === moduleId);

  const stats = {
    totalStaff: staff.length,
    totalModules: modules.length,
    completions: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => a.status !== 'completed' && new Date(a.dueDate) < new Date()).length,
    completionRate: assignments.length ? Math.round((assignments.filter(a => a.status === 'completed').length / assignments.length) * 100) : 0,
  };

  return (
    <AppContext.Provider value={{
      modules, staff, plans, assignments, view, setView, toast,
      showToast, addAssignment, updateAssignment, addModule, updateModule,
      deleteModule, addStaff, addPlan, assignPlanToStaff,
      getStaffAssignments, getModuleAssignments, stats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
