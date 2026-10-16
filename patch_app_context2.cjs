const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const effectCode = `
  const previousProjectsRef = React.useRef(projects);

  useEffect(() => {
    const prevProjects = previousProjectsRef.current;
    if (prevProjects !== projects) {
      const newlyCompleted = projects.filter(p => 
        p.status === 'Completed' && 
        prevProjects.find(pp => pp.id === p.id)?.status !== 'Completed'
      );
      
      newlyCompleted.forEach(p => {
        addNotification({
          message: \`Milestone Broadcast: "\${p.name}" has officially been completed! Client \${p.client} has been notified.\`,
          type: 'success'
        });
      });
      
      previousProjectsRef.current = projects;
    }
  }, [projects, addNotification]);
`;

// Insert the code inside AppProvider
content = content.replace("export function AppProvider({ children }: { children: ReactNode }) {", "export function AppProvider({ children }: { children: ReactNode }) {" + effectCode);

fs.writeFileSync('src/context/AppContext.tsx', content);
