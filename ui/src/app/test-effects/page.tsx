'use client';

import { Sparkles, Rocket, Zap, Cloud, Star, Leaf, TreePine } from 'lucide-react';

export default function TestEffectsPage() {
  return (
    <div className="min-h-screen p-8 space-y-12">
      {/* Page Title */}
      <div className="text-center mb-16 spring-entrance">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-7xl font-black bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
            Glass Effects Demo
          </h1>
        </div>
        <p className="text-2xl text-slate-700 dark:text-slate-300 font-semibold">
          Testing WORKING glass morphism with GREEN branding
        </p>
      </div>

      {/* Glass Morphism Tests */}
      <div className="stagger-children space-y-8">
        
        {/* Ultra Glass with Strong Visibility */}
        <div className="glass-ultra p-8 rounded-2xl spring-entrance micro-glow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient">
                Glass Ultra Effect
              </h2>
              <p className="text-lg text-slate-600">
                50% opacity with 25px blur and colored borders
              </p>
            </div>
          </div>
          <p className="text-slate-700">
            This should show a translucent background with strong blur effects and blue borders.
            Hover to see micro-glow animation.
          </p>
        </div>

        {/* Strong Glass */}
        <div className="glass-strong p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient">
                Glass Strong Effect
              </h2>
              <p className="text-lg text-slate-600">
                50% opacity with 30px blur and saturated effects
              </p>
            </div>
          </div>
          <p className="text-slate-700">
            This uses glass-strong with heavy blur and color saturation effects.
          </p>
        </div>

        {/* Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="card-interactive hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gradient mb-2">
              Interactive Card
            </h3>
            <p className="text-slate-600">
              Hover to see lift animation and enhanced glass effects
            </p>
          </div>

          <div className="card-interactive hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gradient mb-2">
              Hover Effects
            </h3>
            <p className="text-slate-600">
              Advanced hover animations with color transitions
            </p>
          </div>

          <div className="card-interactive hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gradient mb-2">
              Glass Morphism
            </h3>
            <p className="text-slate-600">
              Real translucent glass with backdrop blur
            </p>
          </div>
        </div>

        {/* Terminal Glass */}
        <div className="terminal-glass p-6 rounded-xl">
          <div className="terminal-prompt mb-4">
            ~/sirsi-nexus --test-glass-effects
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Terminal Glass Effect
          </h3>
          <p className="text-slate-600">
            Hover to see the sliding shimmer animation across the surface
          </p>
        </div>

        {/* Button Tests */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gradient">Button Effects</h3>
          <div className="flex gap-4 flex-wrap">
            
            <button className="btn-primary px-8 py-4 rounded-xl text-lg font-bold">
              Primary Button
            </button>
            
            <button className="btn-glass px-8 py-4 rounded-xl text-lg font-bold text-slate-700">
              Glass Button
            </button>
            
            <button className="glass-hover px-8 py-4 rounded-xl text-lg font-bold text-slate-700 border-2 border-indigo-200">
              Hover Glass
            </button>
          </div>
        </div>

        {/* Animation Tests */}
        <div className="floating-panel p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-gradient mb-4">
            Animation Tests
          </h3>
          <div className="space-y-4">
            <div className="animate-slide-up p-4 glass rounded-xl">
              <p className="text-slate-700">Slide up animation</p>
            </div>
            <div className="scale-in p-4 glass rounded-xl">
              <p className="text-slate-700">Scale in animation</p>
            </div>
            <div className="fade-in p-4 glass rounded-xl">
              <p className="text-slate-700">Fade in animation</p>
            </div>
          </div>
        </div>

        {/* Text Effects */}
        <div className="glass p-8 rounded-2xl">
          <h2 className="text-display text-4xl mb-4">
            Beautiful Display Text
          </h2>
          <h3 className="text-gradient text-2xl mb-4">
            Gradient Text Effect
          </h3>
          <p className="text-gradient-subtle text-xl">
            Subtle gradient text
          </p>
        </div>
      </div>
    </div>
  );
}
