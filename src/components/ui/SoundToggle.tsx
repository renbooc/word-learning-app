'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SoundManager } from '@/lib/sound';
import { cn } from '@/lib/utils';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled, soundManager]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);

    if (newState) {
      soundManager.playClick();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSound}
      className={cn("bg-white/50 border-2 border-transparent hover:border-[var(--primary)] rounded-2xl px-4 py-2", className)}
    >
      <motion.div
        key={soundEnabled ? 'on' : 'off'}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-3"
      >
        {soundEnabled ? (
          <>
            <SpeakerWaveIcon className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm font-bold text-[var(--foreground)] font-heading">音效已开启</span>
          </>
        ) : (
          <>
            <SpeakerXMarkIcon className="w-5 h-5 text-[var(--slate-400)]" />
            <span className="text-sm font-bold text-[var(--slate-400)] font-heading">音效已关闭</span>
          </>
        )}
      </motion.div>
    </Button>
  );
}