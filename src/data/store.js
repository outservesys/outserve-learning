export const CATEGORIES = {
  IT: { label: 'IT & Technical', color: '#00D4B8', bg: 'rgba(0,212,184,0.12)' },
  COMPLIANCE: { label: 'Compliance', color: '#FFB432', bg: 'rgba(255,180,50,0.12)' },
  SOFT: { label: 'Customer & Soft skills', color: '#9090FF', bg: 'rgba(130,130,255,0.14)' },
};

export const defaultModules = [
  { id: 'm1', title: 'Cyber Security Essentials', category: 'IT', duration: 150, description: 'Core security practices, phishing awareness, password hygiene and incident response fundamentals.', lessons: 8, passMark: 80 },
  { id: 'm2', title: 'Microsoft Azure Fundamentals', category: 'IT', duration: 240, description: 'Cloud concepts, core Azure services, pricing models and support options. Covers AZ-900 syllabus.', lessons: 12, passMark: 75 },
  { id: 'm3', title: 'Network Infrastructure', category: 'IT', duration: 195, description: 'TCP/IP, routing, switching, VLANs and practical network troubleshooting techniques.', lessons: 10, passMark: 75 },
  { id: 'm4', title: 'ServiceNow Fundamentals', category: 'IT', duration: 180, description: 'Ticket management, ITSM workflows, SLA management and reporting dashboards.', lessons: 9, passMark: 75 },
  { id: 'm5', title: 'Azure DevOps & CI/CD', category: 'IT', duration: 210, description: 'Pipeline automation, repository management, release pipelines and monitoring.', lessons: 11, passMark: 75 },
  { id: 'm6', title: 'GDPR & Data Handling', category: 'COMPLIANCE', duration: 105, description: 'UK GDPR obligations, lawful basis for processing, data subject rights and breach response procedures.', lessons: 6, passMark: 85 },
  { id: 'm7', title: 'Health & Safety at Work', category: 'COMPLIANCE', duration: 90, description: 'Workplace safety regulations, risk assessment methodologies, reporting obligations and PPE.', lessons: 5, passMark: 85 },
  { id: 'm8', title: 'Anti-Bribery & Ethics', category: 'COMPLIANCE', duration: 60, description: 'Bribery Act 2010, ethical conduct framework, conflicts of interest and whistleblowing policy.', lessons: 4, passMark: 90 },
  { id: 'm9', title: 'Fire Safety Awareness', category: 'COMPLIANCE', duration: 45, description: 'Fire prevention, evacuation procedures, extinguisher types and warden responsibilities.', lessons: 3, passMark: 90 },
  { id: 'm10', title: 'Customer Excellence', category: 'SOFT', duration: 120, description: 'Handling queries, complaint resolution, NPS and satisfaction metrics. Practical call and email scenarios.', lessons: 7, passMark: 70 },
  { id: 'm11', title: 'Effective Communication', category: 'SOFT', duration: 90, description: 'Written, verbal and remote communication skills for professional client-facing and internal settings.', lessons: 6, passMark: 70 },
  { id: 'm12', title: 'Leadership Essentials', category: 'SOFT', duration: 150, description: 'Team motivation, delegation, difficult conversations and performance coaching fundamentals.', lessons: 8, passMark: 70 },
];

export const defaultStaff = [
  { id: 's1', name: 'Aisha Rahman', role: 'IT Support Engineer', dept: 'Technology', email: 'a.rahman@outserve.co.uk', avatar: 'AR', color: '#00D4B8' },
  { id: 's2', name: 'Marcus Jones', role: 'Service Desk Analyst', dept: 'Technology', email: 'm.jones@outserve.co.uk', avatar: 'MJ', color: '#9090FF' },
  { id: 's3', name: 'Priya Watts', role: 'Cloud Solutions Architect', dept: 'Technology', email: 'p.watts@outserve.co.uk', avatar: 'PW', color: '#FFB432' },
  { id: 's4', name: 'Tom Lawson', role: 'Customer Success Manager', dept: 'Operations', email: 't.lawson@outserve.co.uk', avatar: 'TL', color: '#FF7070' },
  { id: 's5', name: 'Sofia Nkosi', role: 'Network Engineer', dept: 'Technology', email: 's.nkosi@outserve.co.uk', avatar: 'SN', color: '#70D070' },
  { id: 's6', name: 'Daniel Kim', role: 'IT Support Engineer', dept: 'Technology', email: 'd.kim@outserve.co.uk', avatar: 'DK', color: '#00D4B8' },
  { id: 's7', name: 'Rachel Brooks', role: 'Operations Manager', dept: 'Operations', email: 'r.brooks@outserve.co.uk', avatar: 'RB', color: '#FF9F50' },
  { id: 's8', name: 'James Okafor', role: 'Senior Developer', dept: 'Technology', email: 'j.okafor@outserve.co.uk', avatar: 'JO', color: '#50C8FF' },
];

export const defaultPlans = [
  {
    id: 'p1',
    title: 'IT Support Pathway',
    description: 'Foundation training for IT support staff covering security, compliance and core tools.',
    icon: 'server',
    moduleIds: ['m1', 'm6', 'm4', 'm3', 'm7', 'm8'],
  },
  {
    id: 'p2',
    title: 'Cloud & Infrastructure Pathway',
    description: 'Technical pathway for cloud engineers and infrastructure specialists.',
    icon: 'cloud',
    moduleIds: ['m2', 'm3', 'm1', 'm5', 'm6'],
  },
  {
    id: 'p3',
    title: 'Compliance Foundation',
    description: 'Mandatory compliance training required for all staff across departments.',
    icon: 'shield',
    moduleIds: ['m6', 'm7', 'm8', 'm9'],
  },
  {
    id: 'p4',
    title: 'Customer Success Track',
    description: 'Customer-facing skills and service excellence for operations and support teams.',
    icon: 'users',
    moduleIds: ['m10', 'm11', 'm6', 'm7'],
  },
];

// assignments: { id, staffId, moduleId, assignedDate, dueDate, status: 'not_started'|'in_progress'|'completed', progress: 0-100, score: null }
export const defaultAssignments = [
  { id: 'a1', staffId: 's1', moduleId: 'm1', assignedDate: '2026-06-05', dueDate: '2026-06-26', status: 'in_progress', progress: 60, score: null },
  { id: 'a2', staffId: 's1', moduleId: 'm7', assignedDate: '2026-06-01', dueDate: '2026-06-20', status: 'completed', progress: 100, score: 92 },
  { id: 'a3', staffId: 's1', moduleId: 'm4', assignedDate: '2026-06-12', dueDate: '2026-06-30', status: 'not_started', progress: 0, score: null },
  { id: 'a4', staffId: 's2', moduleId: 'm6', assignedDate: '2026-06-10', dueDate: '2026-06-24', status: 'in_progress', progress: 30, score: null },
  { id: 'a5', staffId: 's2', moduleId: 'm7', assignedDate: '2026-05-28', dueDate: '2026-06-20', status: 'completed', progress: 100, score: 88 },
  { id: 'a6', staffId: 's3', moduleId: 'm2', assignedDate: '2026-06-05', dueDate: '2026-06-30', status: 'completed', progress: 100, score: 96 },
  { id: 'a7', staffId: 's3', moduleId: 'm6', assignedDate: '2026-06-02', dueDate: '2026-06-25', status: 'completed', progress: 100, score: 91 },
  { id: 'a8', staffId: 's3', moduleId: 'm5', assignedDate: '2026-06-15', dueDate: '2026-07-10', status: 'in_progress', progress: 45, score: null },
  { id: 'a9', staffId: 's4', moduleId: 'm10', assignedDate: '2026-06-01', dueDate: '2026-06-20', status: 'in_progress', progress: 20, score: null },
  { id: 'a10', staffId: 's4', moduleId: 'm7', assignedDate: '2026-05-28', dueDate: '2026-06-15', status: 'completed', progress: 100, score: 85 },
  { id: 'a11', staffId: 's5', moduleId: 'm3', assignedDate: '2026-06-15', dueDate: '2026-06-29', status: 'in_progress', progress: 50, score: null },
  { id: 'a12', staffId: 's5', moduleId: 'm1', assignedDate: '2026-06-12', dueDate: '2026-06-26', status: 'in_progress', progress: 75, score: null },
  { id: 'a13', staffId: 's6', moduleId: 'm1', assignedDate: '2026-06-20', dueDate: '2026-07-05', status: 'not_started', progress: 0, score: null },
  { id: 'a14', staffId: 's7', moduleId: 'm6', assignedDate: '2026-06-01', dueDate: '2026-06-25', status: 'completed', progress: 100, score: 89 },
  { id: 'a15', staffId: 's8', moduleId: 'm5', assignedDate: '2026-06-10', dueDate: '2026-07-01', status: 'in_progress', progress: 65, score: null },
];

export const currentUser = { id: 's1', name: 'Aisha Rahman', role: 'IT Support Engineer', avatar: 'AR' };
export const adminUser = { id: 'admin', name: 'James Taylor', role: 'Learning & Development Manager', avatar: 'JT' };
