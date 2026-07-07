import React from 'react';
import { Edit2, Trash2, Target } from 'lucide-react';
import { Goal } from '../../../logic/types/finance';
import { cn } from '../../../logic/utils/classNames';
import * as TOKENS from '../../../ui/styles/tokens';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const progress = Math.min(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100, 100);
  const formattedDeadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline';
  
  return (
    <div className={cn(
      "p-6 shadow-sm border group relative",
      TOKENS.BG_SURFACE,
      TOKENS.RADIUS_CARD,
      TOKENS.BORDER_LIGHT
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
            {goal.icon || '🎯'}
          </div>
          <div>
            <h3 className={cn("font-bold text-lg", TOKENS.TEXT_PRIMARY)}>{goal.name}</h3>
            <p className={cn("text-xs", TOKENS.TEXT_MUTED)}>{goal.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(goal)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className={cn("text-2xl font-bold", TOKENS.TEXT_PRIMARY)}>
            Rp {(goal.currentAmount || 0).toLocaleString('id-ID')}
          </span>
          <span className={cn("text-xs font-medium", TOKENS.TEXT_MUTED)}>
            Target: Rp {(goal.targetAmount || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-green-600 font-bold">{progress.toFixed(1)}% Completed</span>
          <span className={TOKENS.TEXT_MUTED}>Deadline: {formattedDeadline}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          goal.status === 'Achieved' ? "bg-green-100 text-green-700" : 
          goal.status === 'On Hold' ? "bg-yellow-100 text-yellow-700" : 
          "bg-blue-100 text-blue-700"
        )}>
          {goal.status}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Target className="w-3 h-3" />
          <span>{Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0)).toLocaleString('id-ID')} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
