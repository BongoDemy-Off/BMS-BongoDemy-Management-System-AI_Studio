const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace Tasks -> Projects sync logic with a safer comparison
const tasksToProjects = `
  // Sync Global Tasks -> Projects
  useEffect(() => {
    setProjects(prevProjects => {
      let changed = false;
      const next = prevProjects.map(p => {
        const pTasks = tasks.filter(t => t.project === p.name).map(t => ({
          id: t.id,
          title: t.title,
          startDate: t.startDate,
          deadline: t.dueDate,
          progress: t.progress || 0,
          assignee: t.assignee,
          dependencies: t.dependencies,
          status: t.status,
          lastActiveProgress: t.lastActiveProgress,
          subtasks: t.subtasks
        }));
        
        // Safer comparison
        const oldTasksStr = JSON.stringify((p.tasks || []).map(t => ({ id: t.id, progress: t.progress, status: t.status, subtasks: t.subtasks })));
        const newTasksStr = JSON.stringify(pTasks.map(t => ({ id: t.id, progress: t.progress, status: t.status, subtasks: t.subtasks })));
        
        if (oldTasksStr !== newTasksStr) {
          changed = true;
          const tot = pTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
          let newProg = pTasks.length > 0 ? Math.round(tot / pTasks.length) : 0;
          let newStatus = p.status;
          if (newProg === 100) newStatus = 'Completed';
          else if (newProg === 0) newStatus = 'Not Started';
          else if (p.status === 'Completed' || p.status === 'Not Started') newStatus = 'In Progress';
          return { ...p, tasks: pTasks, progress: newProg, status: newStatus };
        }
        return p;
      });
      return changed ? next : prevProjects;
    });
  }, [tasks, setProjects]);
`;

// Replace Projects -> Global Tasks sync logic with safer comparison
const projectsToTasks = `
  // Sync Projects -> Global Tasks
  useEffect(() => {
    setTasks(prevTasks => {
      let changed = false;
      let nextTasks = [...prevTasks];
      projects.forEach(p => {
        (p.tasks || []).forEach(pt => {
          const tIdx = nextTasks.findIndex(t => t.id === pt.id);
          if (tIdx !== -1) {
            const t = nextTasks[tIdx];
            const oldTStr = JSON.stringify({ progress: t.progress, status: t.status, subtasks: t.subtasks });
            const newTStr = JSON.stringify({ progress: pt.progress, status: pt.status || t.status, subtasks: pt.subtasks });
            
            if (oldTStr !== newTStr) {
              changed = true;
              nextTasks[tIdx] = { 
                 ...t, 
                 progress: pt.progress, 
                 status: pt.status || t.status, 
                 subtasks: pt.subtasks, 
                 lastActiveProgress: pt.lastActiveProgress 
               };
            }
          }
        });
      });
      return changed ? nextTasks : prevTasks;
    });
  }, [projects, setTasks]);
`;

const beforeTasksSync = content.split('  // Sync Global Tasks -> Projects')[0];
const afterTasksSync = content.split('  // Sync Projects -> Global Tasks')[1].split('  return <>{children}</>;')[1];

fs.writeFileSync('src/context/AppContext.tsx', beforeTasksSync + tasksToProjects + projectsToTasks + '  return <>{children}</>;\n}\n');
