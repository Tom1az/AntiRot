import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Lock, CheckCircle, Orbit } from 'lucide-react';

interface SkillNodeProps {
  data: {
    label: string;
    status: 'locked' | 'in-progress' | 'mastered';
    icon?: string;
  };
}

const SkillNode = ({ data }: SkillNodeProps) => {
  const isMastered = data.status === 'mastered';
  const isInProgress = data.status === 'in-progress';
  const isLocked = data.status === 'locked';

  return (
    <div
      className={`relative rounded-2xl px-6 py-4 flex items-center gap-4 transition-all duration-300 w-64
        ${
          isMastered
            ? 'bg-white border-2 border-cyan-400 text-slate-800'
            : isInProgress
            ? 'bg-white border-2 border-purple-400 shadow-[0_8px_20px_rgba(168,85,247,0.15)] text-slate-800 animate-pulse'
            : 'bg-slate-50 border border-slate-200 text-slate-400 grayscale'
        }
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2 !border-none" />
      
      {/* Icon Area */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0
          ${
            isMastered
              ? 'bg-cyan-100 text-cyan-600'
              : isInProgress
              ? 'bg-purple-100 text-purple-600'
              : 'bg-slate-200 text-slate-500'
          }
        `}
      >
        {isMastered ? (
          <CheckCircle className="w-6 h-6" />
        ) : isInProgress ? (
          <Orbit className="w-6 h-6 animate-spin-slow" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
      </div>

      {/* Text Area */}
      <div>
        <div className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">
          {isMastered ? 'Thành thạo' : isInProgress ? 'Đang học' : 'Đã khoá'}
        </div>
        <div className="font-bold text-sm leading-tight">{data.label}</div>
      </div>

      {/* Decorative Glow inside mastered nodes */}
      {isMastered && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent to-cyan-50 pointer-events-none"></div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2 !border-none" />
    </div>
  );
};

export default memo(SkillNode);
