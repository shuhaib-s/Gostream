'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { APP_CONFIG, APP_ROUTES } from '@/lib/constants';
import { auth } from '@/lib/api';
import { PlatformLogo } from '@/components/PlatformLogos';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redirect to dashboard if logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await auth.me();
        window.location.href = APP_ROUTES.DASHBOARD;
      } catch (err) {
        // Not authenticated, stay on home page
      }
    };
    checkAuth();
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-dark-bg-primary to-green-950/50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Floating Gradient Orbs with Parallax */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse-slow delay-1000"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow delay-500"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="text-left animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 hover:bg-primary-500/20 transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span className="text-sm font-medium text-primary-400">Live Now • Multistream</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="block text-dark-text-primary mb-2 animate-slide-up">Stream Once,</span>
                <span className="block gradient-text animate-slide-up delay-100">Reach Millions</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-dark-text-secondary mb-8 leading-relaxed max-w-xl animate-slide-up delay-200">
                Broadcast to <span className="text-primary-400 font-semibold">YouTube, Twitch, Facebook</span> and 7+ platforms simultaneously. One stream, infinite reach.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up delay-300">
                <Link href={APP_ROUTES.SIGNUP}>
                  <Button size="lg" className="min-w-[220px] group shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">
                    Start Free Today
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="#platforms">
                  <Button variant="outline" size="lg" className="min-w-[220px] group">
                    <svg className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    View Platforms
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 animate-slide-up delay-400">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-dark-bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-dark-text-primary">10,000+ Creators</div>
                  <div className="text-xs text-dark-text-tertiary">streaming right now</div>
                </div>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className="relative lg:block hidden animate-fade-in delay-200">
              <div className="relative">
                {/* Floating Platform Logos */}
                <div className="relative h-[500px]">
                  {platformPositions.map((item, index) => (
                    <div
                      key={item.platform}
                      className={`absolute bg-white/95 backdrop-blur-xl p-4 rounded-2xl border-2 border-gray-200 shadow-2xl hover:scale-110 transition-all duration-500 ${item.animation}`}
                      style={{ 
                        top: item.top, 
                        left: item.left,
                        animationDelay: `${index * 0.1}s`,
                        transform: `translate(${mousePosition.x * item.parallax}px, ${mousePosition.y * item.parallax}px)`
                      }}
                    >
                      <PlatformLogo platform={item.platform} size={48} />
                    </div>
                  ))}
                  
                  {/* Center Glow */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-dark-bg-secondary/30 backdrop-blur-sm border-y border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-dark-text-tertiary uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-black text-dark-text-primary mb-4">
              Everything You Need to
              <span className="block gradient-text mt-2">Dominate Live Streaming</span>
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              Professional-grade tools designed for content creators, businesses, and live streaming enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-dark-bg-card to-dark-bg-elevated rounded-2xl p-8 border border-dark-border-primary hover:border-primary-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-dark-text-primary mb-3 group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-dark-text-tertiary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section id="platforms" className="py-24 bg-dark-bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-green-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-black text-dark-text-primary mb-4">
              Stream to <span className="gradient-text">All Your Favorite Platforms</span>
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              Connect with your audience wherever they are. One click, unlimited reach.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {platforms.map((platform, index) => (
              <div
                key={platform.id}
                className="group relative bg-white/95 rounded-2xl p-8 border-2 border-gray-200 hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center justify-center space-y-4">
                  <div className="transform group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
                    <PlatformLogo platform={platform.id} size={56} />
                  </div>
                  <span className="font-bold text-gray-900 text-center text-sm group-hover:text-primary-600 transition-colors">
                    {platform.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Extra Platform Note */}
          <div className="mt-12 text-center animate-fade-in delay-500">
            <p className="text-dark-text-tertiary">
              + Custom RTMP destinations • Connect any platform
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-black text-dark-text-primary mb-4">
              Go Live in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-dark-text-secondary">
              From setup to streaming in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-white text-3xl font-black mb-6 shadow-2xl shadow-primary-500/30">
                  {index + 1}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-full top-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500 to-dark-border-primary" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-dark-text-primary mb-3">{step.title}</h3>
                <p className="text-dark-text-tertiary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-primary-600/10 to-green-600/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark-text-primary mb-6">
            Ready to <span className="gradient-text">10x Your Reach?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of creators already streaming to millions of viewers across every platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={APP_ROUTES.SIGNUP}>
              <Button size="lg" className="min-w-[250px] text-lg py-7 shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 group">
                Start Streaming Free
                <svg className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-dark-text-muted">
            No credit card required • 5 minute setup • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}

const platformPositions = [
  { platform: 'youtube', top: '10%', left: '10%', animation: 'animate-float', parallax: 0.3 },
  { platform: 'twitch', top: '20%', left: '70%', animation: 'animate-float delay-200', parallax: 0.5 },
  { platform: 'facebook', top: '50%', left: '15%', animation: 'animate-float delay-400', parallax: 0.2 },
  { platform: 'tiktok', top: '60%', left: '75%', animation: 'animate-float delay-600', parallax: 0.4 },
  { platform: 'instagram', top: '75%', left: '40%', animation: 'animate-float delay-800', parallax: 0.35 },
  { platform: 'twitter', top: '35%', left: '50%', animation: 'animate-float delay-1000', parallax: 0.25 },
];

const stats = [
  { value: '10+', label: 'Platforms' },
  { value: '10K+', label: 'Creators' },
  { value: '50M+', label: 'Views/Month' },
  { value: '99.9%', label: 'Uptime' },
];

const features = [
  {
    icon: '⚡',
    title: 'Lightning Setup',
    description: 'Connect OBS, Streamlabs, vMix, or any RTMP software in seconds. No technical knowledge required.',
  },
  {
    icon: '🌐',
    title: 'Multi-Platform',
    description: 'Stream to YouTube, Twitch, Facebook, TikTok, LinkedIn, and more—all at once.',
  },
  {
    icon: '📡',
    title: 'Real-Time Preview',
    description: 'Monitor your live stream with built-in HLS player. See exactly what your viewers see.',
  },
  {
    icon: '🔒',
    title: 'Bank-Level Security',
    description: '99.9% uptime with enterprise-grade encryption. Your content is safe and always online.',
  },
  {
    icon: '🚀',
    title: 'Zero Latency',
    description: 'Ultra-low latency streaming infrastructure. Your audience gets instant, buffer-free streams.',
  },
  {
    icon: '💎',
    title: '4K Quality',
    description: 'Support for 4K streaming, high bitrates, multi-track audio, and professional encoding.',
  },
];

const platforms = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'X' },
  { id: 'kick', name: 'Kick' },
  { id: 'rumble', name: 'Rumble' },
  { id: 'trovo', name: 'Trovo' },
];

const steps = [
  {
    title: 'Create Account',
    description: 'Sign up in 30 seconds with email or Google. No credit card needed.',
  },
  {
    title: 'Add Platforms',
    description: 'Connect YouTube, Twitch, Facebook, and any other platforms you use.',
  },
  {
    title: 'Go Live!',
    description: 'Start streaming from OBS and reach all platforms simultaneously.',
  },
];
