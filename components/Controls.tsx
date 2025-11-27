import React from 'react';
import { SCENARIO_DESCRIPTIONS } from '../constants';

interface ControlsProps {
  currentScenario: string;
  onSetScenario: (s: any) => void;
}

const Controls: React.FC<ControlsProps> = ({ currentScenario, onSetScenario }) => {
  const scenarios = ['NORMAL', 'TOR_FAILURE', 'AGG_FAILURE', 'CORE_FAILURE', 'HIGH_LOAD'];

  return (
    <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-lg max-w-md mb-2">
         <h4 className="text-white font-semibold text-sm mb-1">{currentScenario.replace('_', ' ')}</h4>
         <p className="text-gray-400 text-xs">
           {SCENARIO_DESCRIPTIONS[currentScenario as keyof typeof SCENARIO_DESCRIPTIONS]}
         </p>
      </div>
      
      <div className="flex gap-2">
        {scenarios.map(s => (
          <button
            key={s}
            onClick={() => onSetScenario(s)}
            className={`
              px-4 py-2 text-xs font-bold rounded-full transition-all duration-300
              border 
              ${currentScenario === s 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}
            `}
          >
            {s === 'NORMAL' ? 'RESET' : s.replace('_FAILURE', '')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Controls;