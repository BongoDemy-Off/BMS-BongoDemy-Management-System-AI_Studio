import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Maximize, Save } from 'lucide-react';

interface MindMapProps {
  id: string;
  type: 'project' | 'task';
  title: string;
}

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Root Concept' },
    position: { x: 250, y: 150 },
    style: { backgroundColor: '#1E2D40', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }
  },
];

const defaultEdges: Edge[] = [];

export function MindMap({ id, type, title }: MindMapProps) {
  // Use local storage to persist the mind map per project/task ID
  const storageKey = `mindmap-${type}-${id}`;
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    let initialNodes = [{ ...defaultNodes[0], data: { label: title } }];
    let initialEdges = defaultEdges;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length > 0) {
          initialNodes = parsed.nodes;
          // Always ensure the root node reflects the current title
          const rootNode = initialNodes.find((n: Node) => n.id === '1');
          if (rootNode) {
            rootNode.data = { ...rootNode.data, label: title };
          }
        }
        if (parsed.edges) {
          initialEdges = parsed.edges;
        }
      } catch (e) {
        // Fallback to defaults on error
      }
    }
    
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [storageKey, title]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#0ED7A8' } } as Edge, eds)),
    []
  );

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      data: { label: 'New Node' },
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      style: { backgroundColor: '#1E2D40', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearMap = () => {
    setNodes([{ ...defaultNodes[0], data: { label: title } }]);
    setEdges(defaultEdges);
  };

  const saveMap = () => {
    localStorage.setItem(storageKey, JSON.stringify({ nodes, edges }));
  };

  useEffect(() => {
    // Auto save whenever it changes
    const timeout = setTimeout(() => {
      saveMap();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  return (
    <div className="w-full h-[400px] border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-slate-800 border-slate-700 fill-white" />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={addNode}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Add Node
          </button>
          <button
            onClick={clearMap}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-rose-400 p-2 rounded-lg text-xs font-medium transition-colors shadow-lg"
          >
            Clear
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
