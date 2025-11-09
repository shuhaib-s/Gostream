'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { projects, destinations, Project, Destination, auth } from '@/lib/api';
import { Button, Card, CardHeader, Modal, ModalFooter, Input, Select, Badge } from '@/components/ui';
import { PlatformSelector } from '@/components/PlatformSelector';
import { PlatformLogo } from '@/components/PlatformLogos';
import HLSPlayer from '@/components/HLSPlayer';
import { 
  getPlatformConfig, 
  PlatformConfig, 
  APP_ROUTES, 
  SUCCESS_MESSAGES,
  RTMP_CONFIG
} from '@/lib/constants';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: '',
    rtmpUrl: '',
    streamKey: '',
  });
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [streamingDestinations, setStreamingDestinations] = useState<Record<string, boolean>>({});
  const [startingStream, setStartingStream] = useState<Record<string, boolean>>({});
  const [expandedDestinations, setExpandedDestinations] = useState<Record<string, boolean>>({});
  const [isStreamingAll, setIsStreamingAll] = useState(false);
  const [startingAll, setStartingAll] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuthAndLoadProject();
  }, [projectId, router]);

  // Smart polling: Only poll when stream is NOT live
  useEffect(() => {
    if (!project) return;

    const isLive = project.streams && project.streams.length > 0 && project.streams[0].status === 'live';

    // Start polling if stream is NOT live
    if (!isLive) {
      startPolling();
    } else {
      // Stop polling once stream is live
      stopPolling();
    }

    return () => stopPolling();
  }, [project?.streams]);

  const startPolling = () => {
    // Avoid multiple intervals
    if (pollingIntervalRef.current) return;

    console.log('🔄 Starting polling for stream status...');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = await projects.get(projectId);
        setProject(data);
        
        // Check if stream just went live
        const justWentLive = data.streams && data.streams.length > 0 && data.streams[0].status === 'live';
        if (justWentLive) {
          console.log('✅ Stream detected! Stopping poll.');
          stopPolling();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('⏹️ Stopping polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const checkAuthAndLoadProject = async () => {
    try {
      await auth.me();
      await loadProject();
    } catch (err: any) {
      window.location.href = APP_ROUTES.LOGIN;
    }
  };

  const loadProject = async () => {
    try {
      const data = await projects.get(projectId);
      setProject(data);
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        window.location.href = APP_ROUTES.LOGIN;
      } else {
        setError('Failed to load project');
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string, field: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    if (field === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handlePlatformSelect = (platform: PlatformConfig) => {
    setSelectedPlatform(platform);
    setNewDestination({
      name: platform.displayName,
      rtmpUrl: platform.rtmpUrl,
      streamKey: '',
    });
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;

    setSaving(true);
    setError('');

    try {
      await destinations.create(projectId, {
        platform: selectedPlatform.id,
        ...newDestination,
      });
      setNewDestination({ name: '', rtmpUrl: '', streamKey: '' });
      setSelectedPlatform(null);
      setShowAddDestination(false);
      loadProject();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add destination');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDestination = async (dest: Destination) => {
    try {
      await destinations.update(dest.id, { enabled: !dest.enabled });
      loadProject();
    } catch (err: any) {
      setError('Failed to update destination');
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      await destinations.delete(id);
      loadProject();
    } catch (err: any) {
      setError('Failed to delete destination');
    }
  };

  const toggleKeyVisibility = (destId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [destId]: !prev[destId]
    }));
  };

  const toggleDestinationExpanded = (destId: string) => {
    setExpandedDestinations(prev => ({
      ...prev,
      [destId]: !prev[destId]
    }));
  };

  const handleStartStream = async (dest: Destination) => {
    setStartingStream(prev => ({ ...prev, [dest.id]: true }));
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/destinations/${dest.id}/relay/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start stream');
      }

      setStreamingDestinations(prev => ({ ...prev, [dest.id]: true }));
    } catch (err: any) {
      setError(err.message || 'Failed to start stream');
    } finally {
      setStartingStream(prev => ({ ...prev, [dest.id]: false }));
    }
  };

  const handleStopStream = async (dest: Destination) => {
    setStartingStream(prev => ({ ...prev, [dest.id]: true }));
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/destinations/${dest.id}/relay/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop stream');
      }

      setStreamingDestinations(prev => ({ ...prev, [dest.id]: false }));
    } catch (err: any) {
      setError(err.message || 'Failed to stop stream');
    } finally {
      setStartingStream(prev => ({ ...prev, [dest.id]: false }));
    }
  };

  const handleStartAllStreams = async () => {
    if (!project?.destinations) return;

    setStartingAll(true);
    setError('');

    const enabledDestinations = project.destinations.filter(d => d.enabled);
    
    if (enabledDestinations.length === 0) {
      setError('No enabled destinations to stream to');
      setStartingAll(false);
      return;
    }

    try {
      // Start all destinations in parallel
      const startPromises = enabledDestinations.map(dest =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/destinations/${dest.id}/relay/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }).then(async (response) => {
          if (!response.ok) {
            const data = await response.json();
            throw new Error(`${dest.name}: ${data.error || 'Failed'}`);
          }
          return dest.id;
        })
      );

      const results = await Promise.allSettled(startPromises);
      
      // Update streaming status for successful ones
      const newStreamingStatus: Record<string, boolean> = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newStreamingStatus[enabledDestinations[index].id] = true;
        }
      });
      
      setStreamingDestinations(newStreamingStatus);
      setIsStreamingAll(true);

      // Check if any failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        const failedReasons = failures.map((r: any) => r.reason.message).join(', ');
        setError(`Some streams failed: ${failedReasons}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start streams');
    } finally {
      setStartingAll(false);
    }
  };

  const handleStopAllStreams = async () => {
    if (!project?.destinations) return;

    setStartingAll(true);
    setError('');

    const streamingDests = project.destinations.filter(d => streamingDestinations[d.id]);

    try {
      // Stop all streaming destinations in parallel
      const stopPromises = streamingDests.map(dest =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/destinations/${dest.id}/relay/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      );

      await Promise.all(stopPromises);
      
      // Clear all streaming status
      setStreamingDestinations({});
      setIsStreamingAll(false);
    } catch (err: any) {
      setError(err.message || 'Failed to stop streams');
    } finally {
      setStartingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-emerald-950 via-dark-bg-primary to-purple-950">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-500 border-r-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-emerald-950 via-dark-bg-primary to-purple-950">
        <Card className="text-center p-12 backdrop-blur-xl bg-dark-bg-card/50 border-emerald-500/20">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Project not found</h2>
          <Button onClick={() => router.push(APP_ROUTES.DASHBOARD)}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isLive = project.streams && project.streams.length > 0 && project.streams[0].status === 'live';
  const rtmpUrl = RTMP_CONFIG.DEFAULT_SERVER;
  const hasEnabledDestinations = project.destinations && project.destinations.some(d => d.enabled);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-emerald-950 via-dark-bg-primary to-purple-950 py-8 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(APP_ROUTES.DASHBOARD)}
              className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                {project.name}
              </h1>
              <p className="text-sm text-emerald-300/60 mt-1">
                {project.destinations?.length || 0} destination(s) • {isLive ? 'Live now' : 'Offline'}
              </p>
            </div>
          </div>
          {isLive && (
            <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-semibold text-sm">LIVE</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-300">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Layout: Left = Preview, Right = Destinations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE: Live Preview & Configuration */}
          <div className="space-y-6">
            {/* Stream Preview with Glass Effect */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500/20 to-purple-500/20 px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                    <p className="text-sm text-emerald-300/60">Monitor your stream in real-time</p>
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-emerald-300">Broadcasting</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <HLSPlayer streamKey={project.streamKey} isLive={isLive} />
                </div>
              </div>
            </div>

            {/* Streaming Software Configuration with Glass Effect */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Stream Configuration</h3>
                <p className="text-sm text-purple-300/60">Use with OBS, Streamlabs, vMix, XSplit, or any RTMP software</p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* RTMP URL */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300/80 mb-2">
                    RTMP Server URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rtmpUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(rtmpUrl, 'url')}
                      className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border-white/10"
                    >
                      {copiedUrl ? (
                        <>
                          <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <label className="block text-sm font-medium text-purple-300/80 mb-2">
                    Stream Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={project.streamKey}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(project.streamKey, 'key')}
                      className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border-white/10"
                    >
                      {copiedKey ? (
                        <>
                          <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Help Text */}
                <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-300 mb-1">Compatible Software</p>
                      <p className="text-sm text-blue-200/60 mb-2">
                        Works with OBS Studio, Streamlabs OBS, vMix, XSplit, Zoom, and any RTMP encoder
                      </p>
                      <p className="text-xs text-blue-200/50">
                        Settings → Stream → Custom Service → Paste Server URL & Stream Key
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Streaming Destinations with Accordion */}
          <div>
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Streaming Destinations</h3>
                  <p className="text-sm text-pink-300/60">Multi-cast to multiple platforms</p>
                </div>
                <Button
                  onClick={() => setShowAddDestination(true)}
                  className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Add
                </Button>
              </div>

              <div className="p-6">
                {/* Start/Stop All Button */}
                {hasEnabledDestinations && isLive && (
                  <div className="mb-6">
                    {isStreamingAll ? (
                      <Button
                        onClick={handleStopAllStreams}
                        loading={startingAll}
                        fullWidth
                        size="lg"
                        className="backdrop-blur-xl bg-red-500/20 border-2 border-red-500/50 text-red-300 hover:bg-red-500/30 shadow-xl"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        Stop All Streams
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStartAllStreams}
                        loading={startingAll}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white border-0 shadow-2xl shadow-emerald-500/50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start All Streams
                      </Button>
                    )}
                  </div>
                )}

                {project.destinations && project.destinations.length > 0 ? (
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                    {project.destinations.map((dest) => {
                      const platformConfig = getPlatformConfig(dest.platform);
                      const isStreaming = streamingDestinations[dest.id];
                      const isKeyVisible = visibleKeys[dest.id];
                      const isLoading = startingStream[dest.id];
                      const isExpanded = expandedDestinations[dest.id];
                      
                      return (
                        <div
                          key={dest.id}
                          className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 overflow-hidden shadow-lg hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300"
                        >
                          {/* Accordion Header */}
                          <div 
                            className="p-5 cursor-pointer"
                            onClick={() => toggleDestinationExpanded(dest.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 rounded-xl blur-lg"></div>
                                  <div className="relative p-3">
                                    <PlatformLogo platform={dest.platform} size={48} />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg text-white">
                                      {dest.name}
                                    </h4>
                                    {isStreaming && (
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-semibold text-red-300">LIVE</span>
                                      </div>
                                    )}
                                    {!dest.enabled && (
                                      <div className="px-2 py-1 rounded-full bg-gray-500/20 border border-gray-500/40">
                                        <span className="text-xs font-semibold text-gray-400">DISABLED</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/40">{platformConfig.displayName}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {/* Individual Start/Stop Button - Only show if NOT using Start All */}
                                {!isStreamingAll && (
                                  <>
                                    {isStreaming ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStopStream(dest);
                                        }}
                                        loading={isLoading}
                                        className="backdrop-blur-xl bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                      >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        Stop
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartStream(dest);
                                        }}
                                        loading={isLoading}
                                        disabled={!dest.enabled || !isLive}
                                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0 shadow-lg shadow-emerald-500/25"
                                      >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start
                                      </Button>
                                    )}
                                  </>
                                )}
                                
                                {/* Expand/Collapse Icon */}
                                <svg 
                                  className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          <div 
                            className={`overflow-hidden transition-all duration-300 ${
                              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-5 pb-5 pt-0 space-y-4 border-t border-white/10">
                              {/* Stream Key */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-xs font-medium text-emerald-300/80">
                                    Stream Key
                                  </label>
                                  <button
                                    onClick={() => toggleKeyVisibility(dest.id)}
                                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                  >
                                    {isKeyVisible ? (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                        Hide
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Show
                                      </>
                                    )}
                                  </button>
                                </div>
                                <input
                                  type={isKeyVisible ? "text" : "password"}
                                  value={dest.streamKey}
                                  readOnly
                                  className="w-full px-3 py-2.5 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg text-white/80 font-mono text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                              </div>

                              {/* RTMP URL */}
                              <div>
                                <label className="block text-xs font-medium text-purple-300/80 mb-2">
                                  RTMP URL
                                </label>
                                <input
                                  type="text"
                                  value={dest.rtmpUrl}
                                  readOnly
                                  className="w-full px-3 py-2.5 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg text-white/60 font-mono text-xs focus:outline-none"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  fullWidth
                                  onClick={() => handleToggleDestination(dest)}
                                  className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border-white/10"
                                >
                                  {dest.enabled ? (
                                    <>
                                      <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Enabled
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                      Disabled
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDestination(dest.id)}
                                  className="backdrop-blur-xl bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>

                              {!isLive && dest.enabled && (
                                <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                  <p className="text-xs text-yellow-300 flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Start streaming from OBS first before pushing to this platform</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="relative mx-auto mb-8 w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                      <div className="relative w-24 h-24 backdrop-blur-xl bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No destinations yet
                    </h3>
                    <p className="text-white/60 mb-8">
                      Add streaming destinations to broadcast on multiple platforms
                    </p>
                    <Button 
                      onClick={() => setShowAddDestination(true)}
                      className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Destination
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Destination Modal */}
      <Modal
        isOpen={showAddDestination}
        onClose={() => {
          setShowAddDestination(false);
          setSelectedPlatform(null);
          setNewDestination({ name: '', rtmpUrl: '', streamKey: '' });
        }}
        title="Add Streaming Destination"
        size="lg"
      >
        {!selectedPlatform ? (
          <>
            <p className="text-dark-text-tertiary mb-6">
              Select a platform to stream to
            </p>
            <PlatformSelector onSelect={handlePlatformSelect} />
          </>
        ) : (
          <form onSubmit={handleAddDestination}>
            <div className="space-y-5">
              {/* Selected Platform */}
              <div className="flex items-center gap-3 p-4 bg-dark-bg-elevated rounded-lg border border-primary-500/30">
                <div className="p-2">
                  <PlatformLogo platform={selectedPlatform.id} size={40} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark-text-primary">{selectedPlatform.displayName}</p>
                  <p className="text-sm text-dark-text-tertiary">{selectedPlatform.category}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatform(null)}
                >
                  Change
                </Button>
              </div>

              <Input
                label="Destination Name"
                placeholder="My YouTube Channel"
                value={newDestination.name}
                onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                fullWidth
                required
                helperText="Give this destination a friendly name"
              />

              <Input
                label="RTMP Server URL"
                placeholder="rtmp://a.rtmp.youtube.com/live2"
                value={newDestination.rtmpUrl}
                onChange={(e) => setNewDestination({ ...newDestination, rtmpUrl: e.target.value })}
                fullWidth
                required
                helperText="The RTMP ingest URL from the platform"
              />

              <Input
                label="Stream Key"
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={newDestination.streamKey}
                onChange={(e) => setNewDestination({ ...newDestination, streamKey: e.target.value })}
                fullWidth
                required
                helperText="Your unique stream key from the platform"
              />
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddDestination(false);
                  setSelectedPlatform(null);
                  setNewDestination({ name: '', rtmpUrl: '', streamKey: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Add Destination
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
