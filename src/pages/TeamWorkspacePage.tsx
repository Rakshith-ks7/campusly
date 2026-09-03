import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KanbanTask, StudentProfile, TaskStatus } from '../types';
import { dataService } from '../services/dataService';
import { 
  FolderKanban, 
  Plus, 
  MessageSquare, 
  Send, 
  Users, 
  Trash2,
  X
} from 'lucide-react';

interface Props {
  currentUser: StudentProfile;
}

export const TeamWorkspacePage: React.FC<Props> = ({ currentUser }) => {
  const [searchParams] = useSearchParams();
  const allTeams = dataService.getAllTeams();

  const targetTeamId = searchParams.get('teamId') || allTeams[0]?.id;
  const [selectedTeamId, setSelectedTeamId] = useState<string>(targetTeamId || '');

  const activeTeam = allTeams.find(t => t.id === selectedTeamId) || allTeams[0];

  const [, setRefreshKey] = useState(0);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<KanbanTask['priority']>('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.id);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [messageInput, setMessageInput] = useState('');

  if (!activeTeam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <FolderKanban className="w-12 h-12 text-[#999999] mx-auto mb-2" />
        <h2 className="font-heading font-semibold text-xl text-[#262626]">No Active Teams Formed</h2>
        <p className="text-sm text-[#666666]">
          Form a squad using the Team Builder or join an existing project from the marketplace.
        </p>
        <Link
          to="/ai-builder"
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg"
        >
          Launch Team Builder
        </Link>
      </div>
    );
  }

  const tasks = dataService.getTasksByTeamId(activeTeam.id);
  const discussions = dataService.getDiscussionsByTeamId(activeTeam.id);

  const columns: { status: TaskStatus; label: string; dotColor: string }[] = [
    { status: 'TODO', label: 'To Do', dotColor: 'bg-gray-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-[#E63946]' },
    { status: 'REVIEW', label: 'Review', dotColor: 'bg-amber-500' },
    { status: 'COMPLETED', label: 'Completed', dotColor: 'bg-emerald-500' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignee = activeTeam.members.find(m => m.studentId === newTaskAssignee);

    dataService.createTask({
      teamId: activeTeam.id,
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'TODO',
      assigneeId: newTaskAssignee,
      assigneeName: assignee?.studentName || currentUser.name,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    dataService.updateTaskStatus(taskId, newStatus);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteTask = (taskId: string) => {
    dataService.deleteTask(taskId);
    setRefreshKey(prev => prev + 1);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    dataService.postDiscussionMessage(activeTeam.id, messageInput.trim());
    setMessageInput('');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
              Active Sprint
            </span>
            <span className="text-xs text-[#666666]">• {activeTeam.members.length} Collaborators</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-[#262626]">
            {activeTeam.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
            {activeTeam.description}
          </p>
        </div>

        {/* Team Selector & New Task CTA */}
        <div className="flex items-center gap-2">
          {allTeams.length > 1 && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs text-[#262626] focus:outline-none"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Team Members Strip */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-[#E63946]" />
          <span className="text-xs font-semibold uppercase text-[#666666]">Roster:</span>
          <div className="flex flex-wrap items-center gap-2">
            {activeTeam.members.map((member) => (
              <div
                key={member.studentId}
                className="flex items-center gap-1.5 bg-[#FFF8F8] border border-[#E5E5E5] px-2.5 py-1 rounded-lg text-xs"
              >
                <img
                  src={member.avatar}
                  alt={member.studentName}
                  className="w-5 h-5 rounded-full object-cover border border-[#E5E5E5]"
                />
                <span className="font-semibold text-[#262626]">{member.studentName}</span>
                <span className="text-[11px] text-[#666666] bg-white px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                  {member.role.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to={`/projects/${activeTeam.projectId}`}
          className="text-xs font-medium text-[#E63946] hover:underline"
        >
          View Project Specs →
        </Link>
      </div>

      {/* Kanban Task Board Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-base text-[#262626] flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#E63946]" />
            <span>Tasks</span>
          </h2>
          <span className="text-xs text-[#666666]">{tasks.length} total tasks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-white rounded-xl p-3.5 border border-[#E5E5E5] flex flex-col justify-between min-h-[360px] shadow-xs"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5E5E5]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                      <span className="text-xs font-semibold text-[#262626]">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#666666] bg-[#FFF8F8] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] hover:border-[#FECDD3] transition space-y-1.5 group shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-[#262626] leading-snug">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-[#999999] hover:text-[#E63946] p-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-[#666666] line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-[#E5E5E5] text-[11px]">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            task.priority === 'High' 
                              ? 'bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]' 
                              : 'bg-white text-[#666666] border border-[#E5E5E5]'
                          }`}>
                            {task.priority}
                          </span>

                          <span className="text-[#666666] truncate max-w-[100px]">
                            {task.assigneeName || 'Unassigned'}
                          </span>
                        </div>

                        {/* Status mover dropdown */}
                        <div className="pt-1">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="w-full bg-white border border-[#E5E5E5] rounded text-[11px] text-[#666666] py-1 px-1.5 focus:outline-none"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add task button in column */}
                <button
                  onClick={() => setNewTaskModalOpen(true)}
                  className="mt-3 w-full py-1.5 border border-dashed border-[#E5E5E5] hover:border-[#FECDD3] rounded-lg text-xs text-[#666666] hover:text-[#E63946] transition flex items-center justify-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Discussions / Feed */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#E63946]" />
            <h3 className="font-heading font-semibold text-sm text-[#262626]">Team Chat & Updates</h3>
          </div>
          <span className="text-xs text-[#666666]">{discussions.length} messages</span>
        </div>

        {/* Message feed */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {discussions.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5]">
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E5E5E5]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#262626]">{msg.senderName}</span>
                  <span className="text-[11px] text-[#999999]">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handlePostMessage} className="flex gap-2 pt-1">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${activeTeam.name}...`}
            className="flex-1 bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3.5 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-3">
              <h3 className="font-heading font-semibold text-base text-[#262626]">Create New Task</h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-[#666666] hover:text-[#262626]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design mobile login screen"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details and instructions..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
                  >
                    {activeTeam.members.map(m => (
                      <option key={m.studentId} value={m.studentId}>{m.studentName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
