const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const effectCode = `
  const addNotification = useAppStore(s => s.addNotification);
  const previousTasksRef = React.useRef(tasks);

  useEffect(() => {
    const prevTasks = previousTasksRef.current;
    if (prevTasks !== tasks) {
      const newlyCompleted = tasks.filter(t => 
        t.status === 'Completed' && 
        prevTasks.find(pt => pt.id === t.id)?.status !== 'Completed'
      );
      
      newlyCompleted.forEach(t => {
        addNotification({
          message: \`Great news! The "\${t.title}" task has been marked as completed.\`,
          type: 'success'
        });
      });
      
      previousTasksRef.current = tasks;
    }
  }, [tasks, addNotification]);
`;

// Insert the code inside AppProvider
content = content.replace("export function AppProvider({ children }: { children: ReactNode }) {", "export function AppProvider({ children }: { children: ReactNode }) {" + effectCode);

fs.writeFileSync('src/context/AppContext.tsx', content);
