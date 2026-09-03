import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { dataService } from '../services/dataService';
import { ChevronDown, Check, RotateCcw, User } from 'lucide-react';

interface Props {
  currentUser: StudentProfile;
  onUserChange: (user: StudentProfile) => void;
  onDataReset: () => void;
}

export const PersonaSwitcher: React.FC<Props> = ({ currentUser, onUserChange, onDataReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const students = dataService.getAllStudents();

  const handleSelect = (studentId: string) => {
    const updated = dataService.setCurrentUser(studentId);
    onUserChange(updated);
    setIsOpen(false);
  };

  return (
    <div className="bg-[#FFF1F2] border-b border-[#FFE4E6] px-4 py-1.5 text-xs text-[#666666] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Active Persona Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-[#262626]">
            <User className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Browsing as:</span>
          </span>
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 bg-white hover:bg-[#FFF8F8] text-[#262626] px-2.5 py-1 rounded-md border border-[#E5E5E5] transition text-xs font-medium shadow-2xs"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-4 h-4 rounded-full object-cover border border-[#E5E5E5]" 
              />
              <span className="font-semibold text-[#262626]">{currentUser.name}</span>
              <span className="text-[#666666] text-[11px] hidden sm:inline">({currentUser.department.split('&')[0]})</span>
              <ChevronDown className="w-3 h-3 text-[#666666]" />
            </button>

            {/* Persona Dropdown */}
            {isOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-white border border-[#E5E5E5] rounded-lg shadow-lg p-1 z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  Switch Student Profile
                </div>
                {students.map((student) => {
                  const isSelected = student.id === currentUser.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelect(student.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-left transition ${
                        isSelected ? 'bg-[#FFF1F2] text-[#E63946]' : 'hover:bg-[#FFF8F8] text-[#262626]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-7 h-7 rounded-full object-cover border border-[#E5E5E5]" 
                        />
                        <div>
                          <div className="font-semibold text-xs text-[#262626] flex items-center gap-1">
                            {student.name}
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#E63946]" />}
                          </div>
                          <div className="text-[11px] text-[#666666] truncate max-w-[170px]">
                            {student.college} • {student.skills[0]?.name}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDataReset}
            title="Reset sample data"
            className="flex items-center gap-1 text-[#666666] hover:text-[#E63946] transition py-0.5 px-1.5 text-xs font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
