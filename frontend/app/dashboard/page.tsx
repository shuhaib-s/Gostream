'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, projects, Project } from '@/lib/api';
import { Button } from '@/components/ui';
import { AlertDialog } from '@/components/AlertDialog';
import { useToast } from '@/components/Toast';
import { APP_ROUTES } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; project: Project | null }>({
    isOpen: false,
    project: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadProjects();
  }, [router]);

  const checkAuthAndLoadProjects = async () => {
    try {
      await auth.me();
      await loadProjects();
    } catch (err: any) {
      window.location.href = APP_ROUTES.LOGIN;
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projects.list();
      setProjectsList(data);
    } catch (err: any) {
      showError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      showError('Please enter a project name');
      return;
    }

    try {
      setCreating(true);
      await projects.create(newProjectName.trim());
      showSuccess('Project created successfully!');
      setNewProjectName('');
      setShowNewProjectModal(false);
      await loadProjects();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;

    try {
      setDeleting(true);
      await projects.delete(deleteDialog.project.id);
      showSuccess(`Project "${deleteDialog.project.name}" deleted successfully`);
      setDeleteDialog({ isOpen: false, project: null });
      await loadProjects();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-dark-text-primary mb-1">
                Your <span className="gradient-text">Projects</span>
              </h1>
              <p className="text-sm text-dark-text-tertiary">
                Manage your streaming projects and destinations
              </p>
            </div>
            <Button
              onClick={() => setShowNewProjectModal(true)}
              className="group"
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-dark-bg-card border border-dark-border-secondary rounded-lg p-3">
              <div className="text-2xl font-bold gradient-text">{projectsList.length}</div>
              <div className="text-xs text-dark-text-tertiary">Total Projects</div>
            </div>
            <div className="bg-dark-bg-card border border-dark-border-secondary rounded-lg p-3">
              <div className="text-2xl font-bold text-primary-400">
                {projectsList.reduce((acc, p) => acc + (p.destinations?.length || 0), 0)}
              </div>
              <div className="text-xs text-dark-text-tertiary">Destinations</div>
            </div>
            <div className="bg-dark-bg-card border border-dark-border-secondary rounded-lg p-3">
              <div className="text-2xl font-bold text-primary-400">
                {projectsList.filter(p => p.streams && p.streams.length > 0).length}
              </div>
              <div className="text-xs text-dark-text-tertiary">Active Streams</div>
            </div>
            <div className="bg-dark-bg-card border border-dark-border-secondary rounded-lg p-3">
              <div className="text-2xl font-bold text-primary-400">99.9%</div>
              <div className="text-xs text-dark-text-tertiary">Uptime</div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projectsList.length === 0 ? (
          <div className="text-center py-16 animate-fade-in delay-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-bg-card border border-dark-border-secondary mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark-text-primary mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-dark-text-tertiary max-w-md mx-auto mb-6">
              Create your first streaming project to start broadcasting
            </p>
            <Button
              onClick={() => setShowNewProjectModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsList.map((project, index) => (
              <div
                key={project.id}
                className="group relative bg-dark-bg-card rounded-lg border border-dark-border-secondary hover:border-primary-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Content */}
                <div className="p-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-dark-text-primary mb-1 truncate group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-dark-text-tertiary">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span>{project.destinations?.length || 0} destinations</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button
                        fullWidth
                        size="sm"
                      >
                        Open
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ isOpen: true, project })}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-fade-in"
            onClick={() => !creating && setShowNewProjectModal(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="bg-dark-bg-card border border-dark-border-primary rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-dark-text-primary">Create New Project</h3>
                  <button
                    onClick={() => setShowNewProjectModal(false)}
                    disabled={creating}
                    className="text-dark-text-tertiary hover:text-dark-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateProject}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-dark-text-secondary mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="My Awesome Stream"
                      className="w-full px-3 py-2 bg-dark-bg-elevated border border-dark-border-secondary rounded-lg text-sm text-dark-text-primary placeholder:text-dark-text-muted focus:border-primary-500 focus:outline-none transition-colors"
                      autoFocus
                      disabled={creating}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => setShowNewProjectModal(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      loading={creating}
                    >
                      Create Project
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, project: null })}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteDialog.project?.name}"? This action cannot be undone and will remove all destinations and stream history.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
