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
  Panel,
  Handle,
  Position,
  NodeProps,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Maximize, Save, Trash2, X, Network, LayoutTemplate } from 'lucide-react';
import dagre from 'dagre';

interface MindMapProps {
  id: string;
  type: 'project' | 'task';
  title: string;
}

type NodeCategory = 'High' | 'Medium' | 'Low' | 'Completed' | 'In Progress' | 'Not Started' | 'Assigned' | 'default';

function EditableNode({ id, data, selected }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);
  const category = (data.category as NodeCategory) || 'default';
  const { updateNodeData, setNodes } = useReactFlow();

  const onBlur = () => {
    setIsEditing(false);
    updateNodeData(id, { label });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onBlur();
    }
  };

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };
  
  const setCategory = (newCategory: NodeCategory) => {
    updateNodeData(id, { category: newCategory });
  };

  const styles: Record<NodeCategory, { border: string, bg: string, text: string }> = {
    'High': { border: 'border-rose-500', bg: 'bg-rose-500/20', text: 'text-rose-400' },
    'Medium': { border: 'border-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-400' },
    'Low': { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    'Completed': { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    'In Progress': { border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    'Not Started': { border: 'border-slate-500', bg: 'bg-slate-500/20', text: 'text-slate-400' },
    'Assigned': { border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
    'default': { border: selected ? 'border-[#0ED7A8]' : 'border-[#334155]', bg: 'bg-[#1E2D40]', text: 'text-slate-400' }
  };

  const currentStyle = styles[category] || styles['default'];

  return (
    <div className={`${currentStyle.bg} text-white border ${currentStyle.border} rounded-lg p-2.5 min-w-[120px] max-w-[200px] text-center shadow-lg group relative transition-colors`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
      
      {id !== '1' && (
        <button 
          onClick={deleteNode}
          className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 p-1 rounded-full border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col gap-1 z-30">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-xl">
             <div className="relative group/menu">
                <button className="px-2 py-1 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-medium">Priority</button>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover/menu:flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                   <button onClick={() => setCategory('High')} className="px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-700 text-left whitespace-nowrap">High</button>
                   <button onClick={() => setCategory('Medium')} className="px-3 py-1.5 text-xs text-amber-400 hover:bg-slate-700 text-left whitespace-nowrap">Medium</button>
                   <button onClick={() => setCategory('Low')} className="px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-700 text-left whitespace-nowrap">Low</button>
                </div>
             </div>
             <div className="relative group/menu">
                <button className="px-2 py-1 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-medium">Status</button>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover/menu:flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                   <button onClick={() => setCategory('Not Started')} className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 text-left whitespace-nowrap">Not Started</button>
                   <button onClick={() => setCategory('In Progress')} className="px-3 py-1.5 text-xs text-blue-400 hover:bg-slate-700 text-left whitespace-nowrap">In Progress</button>
                   <button onClick={() => setCategory('Completed')} className="px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-700 text-left whitespace-nowrap">Completed</button>
                </div>
             </div>
             <button onClick={() => setCategory('Assigned')} className="px-2 py-1 hover:bg-slate-700 rounded text-[10px] text-purple-400 font-medium whitespace-nowrap">Assignee</button>
             <button onClick={() => setCategory('default')} className="p-1 hover:bg-slate-700 rounded text-slate-400" title="Clear Color"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {category !== 'default' && (
        <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${currentStyle.text}`}>
          {category}
        </div>
      )}

      {isEditing ? (
        <textarea
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 onBlur();
             }
          }}
          className="bg-slate-800/80 text-white text-xs w-full outline-none text-center rounded border border-[#0ED7A8] px-1 py-0.5 resize-none overflow-hidden min-h-[40px]"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      ) : (
        <div 
          onDoubleClick={() => setIsEditing(true)} 
          className="text-xs font-medium cursor-text px-1 py-1 min-h-[20px] break-words"
          title="Double-click to edit"
        >
          {data.label as string}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
      <Handle type="target" position={Position.Left} id="target-left" className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
      <Handle type="target" position={Position.Right} id="target-right" className="w-2 h-2 !bg-[#0ED7A8] !border-none" />
    </div>
  );
}

const nodeTypes = {
  editableNode: EditableNode,
};

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'editableNode',
    data: { label: 'Root Concept' },
    position: { x: 250, y: 150 }
  },
];

const defaultEdges: Edge[] = [];

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 150;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
};

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
      type: 'editableNode',
      data: { label: 'New Node' },
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearMap = () => {
    setNodes([{ ...defaultNodes[0], data: { label: title } }]);
    setEdges(defaultEdges);
  };

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

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
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-slate-800 border-slate-700 fill-white" />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => onLayout('TB')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-lg"
            title="Auto-Layout (Tree)"
          >
            <Network className="w-3.5 h-3.5" /> Auto Layout
          </button>
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
