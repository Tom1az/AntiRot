'use client';
import { useCallback } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import SkillNode from '@/components/SkillNode';
import { Network, Search, Target, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define the custom node types mapping
const nodeTypes = {
  skill: SkillNode,
};

// Mock Data for DSA Skill Tree
const initialNodes: Node[] = [
  { id: '1', type: 'skill', position: { x: 400, y: 50 }, data: { label: 'Big-O Notation', status: 'mastered' } },
  { id: '2', type: 'skill', position: { x: 250, y: 200 }, data: { label: 'Arrays & Strings', status: 'mastered' } },
  { id: '3', type: 'skill', position: { x: 550, y: 200 }, data: { label: 'Linked Lists', status: 'mastered' } },
  { id: '4', type: 'skill', position: { x: 250, y: 350 }, data: { label: 'Hash Tables', status: 'mastered' } },
  { id: '5', type: 'skill', position: { x: 550, y: 350 }, data: { label: 'Stacks & Queues', status: 'in-progress' } },
  { id: '6', type: 'skill', position: { x: 400, y: 500 }, data: { label: 'Trees & Graphs', status: 'locked' } },
  { id: '7', type: 'skill', position: { x: 400, y: 650 }, data: { label: 'Dynamic Programming', status: 'locked' } },
  { id: '8', type: 'skill', position: { x: 100, y: 500 }, data: { label: 'Sorting Algorithms', status: 'locked' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#9333ea', strokeWidth: 2 } },
  { id: 'e4-6', source: '4', target: '6', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
  { id: 'e4-8', source: '4', target: '8', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', animated: false, style: { stroke: '#cbd5e1', strokeWidth: 2 } },
];

export default function KnowledgeGraphPage() {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-4xl p-8 text-slate-800 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="absolute right-[-50px] top-[-50px] opacity-5 pointer-events-none">
          <Network className="w-64 h-64 text-blue-600" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dynamic Knowledge Graph</h1>
            </div>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              Xin chào {user?.full_name || 'Học sinh'}! Đây là Cây Kỹ năng của bạn. Hãy hoàn thành các bài học để mở khóa các khái niệm mới và chinh phục nhánh kiến thức tiếp theo.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 min-w-[140px]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Thành thạo</p>
              <p className="text-2xl font-bold text-cyan-600 flex items-center gap-2">
                4 <span className="text-sm font-medium text-slate-500">/ 8</span>
              </p>
            </div>
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 min-w-[140px]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Môn học</p>
              <p className="text-lg font-bold text-slate-800 mt-1">DSA Base</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 bg-white rounded-4xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white min-h-[600px]">
        {/* Top bar overlay inside graph */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
          <div className="bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm kỹ năng..." 
              className="bg-transparent border-none outline-none w-48 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Mastered
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> In Progress
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Locked
            </div>
        </div>

        {/* React Flow Component */}
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={2} />
          <Controls className="!bg-white !border-slate-200 !fill-slate-600 shadow-sm" />
        </ReactFlow>

        {/* AI Insight Overlay */}
        <div className="absolute bottom-6 right-6 z-10 max-w-sm">
          <div className="bg-white p-5 rounded-3xl border border-cyan-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-slate-800 text-sm">AI Insight</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Bạn đang học "Stacks & Queues". Hãy chú ý, khái niệm này kế thừa rất nhiều tính chất từ "Linked Lists" mà bạn đã hoàn thành xuất sắc!
            </p>
            <button className="mt-4 w-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-cyan-200">
              Tiếp tục bài học
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
