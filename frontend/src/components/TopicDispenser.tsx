"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Printer } from 'lucide-react';
import { Topic, DispenserStatus } from '../types/dispenser';
import { TOPICS } from '../data/topics';
import { Ticket } from './Ticket';

interface TopicDispenserProps {
  initialTopic?: Topic;
  onTopicChange?: (topic: Topic) => void;
  countdown?: number | null;
  onCancelCountdown?: () => void;
}

export const TopicDispenser: React.FC<TopicDispenserProps> = ({
  initialTopic,
  onTopicChange,
  countdown = null,
  onCancelCountdown,
}) => {
  // Topics queue / selection
  const [currentTopic, setCurrentTopic] = useState<Topic>(initialTopic || TOPICS[0]);
  const [dispenserStatus, setDispenserStatus] = useState<DispenserStatus>('ready');
  const [dispenseCount, setDispenseCount] = useState(1);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Sync if external initialTopic changes
  useEffect(() => {
    if (initialTopic && initialTopic.id !== currentTopic.id) {
      setCurrentTopic(initialTopic);
    }
  }, [initialTopic]);

  const dispenseNewTopic = () => {
    if (dispenserStatus === 'dispensing' || dispenserStatus === 'retracting') return;

    // Pick a new random topic different from current
    const pool = TOPICS.filter((t) => t.id !== currentTopic.id);
    const nextTopic = pool.length > 0 
      ? pool[Math.floor(Math.random() * pool.length)] 
      : TOPICS[0];

    // If a ticket is currently out, retract it first into the slot
    if (dispenserStatus === 'ready') {
      setDispenserStatus('retracting');

      // After retraction animation completes (280ms), load next topic and dispense
      setTimeout(() => {
        setCurrentTopic(nextTopic);
        onTopicChange?.(nextTopic);
        triggerDispenseFeed();
      }, 280);
    } else {
      // Direct dispense (e.g. from idle or torn)
      setCurrentTopic(nextTopic);
      onTopicChange?.(nextTopic);
      triggerDispenseFeed();
    }
  };

  const triggerDispenseFeed = () => {
    setDispenserStatus('dispensing');
    setDispenseCount((prev) => prev + 1);

    // Deliberate motorized feed duration: 2.6s (2600ms)
    const duration = 2600;

    // Set ready once paper fully emerges
    setTimeout(() => {
      setDispenserStatus('ready');
    }, duration + 50);
  };

  // Tear off ticket
  const handleTearTicket = () => {
    if (dispenserStatus !== 'ready') return;
    setDispenserStatus('torn');
  };

  const isBusy = dispenserStatus === 'dispensing' || dispenserStatus === 'retracting';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-2 select-none relative">
      {/* Top hint with arrow: "Press [ ||| ] to get your topic ↓" */}
      <div className="flex flex-col items-center mb-3">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-[#FF4A57] font-semibold text-sm sm:text-base tracking-wide flex items-center gap-1.5 font-sans">
            Press [ ||| ] to get your topic
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[#FF4A57] text-lg font-bold leading-none mt-0.5"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>

      {/* THE TOPIC DISPENSER MACHINE PROTOTYPE */}
      <div className="relative flex flex-col items-center">
        {/* Machine Body with Realistic 3D Skeuomorphic Styling */}
        <motion.div
          id="topic-machine"
          animate={
            dispenserStatus === 'dispensing'
              ? {
                  x: [-0.7, 0.7, -0.5, 0.5, 0],
                  y: [-0.4, 0.4, 0],
                  transition: { duration: 0.12, repeat: 8, ease: 'linear' },
                }
              : { x: 0, y: 0 }
          }
          className="group relative w-[340px] sm:w-[410px] rounded-[32px] sm:rounded-[36px] bg-[#F6F2EB] border-2 border-[#E7DFC0] cursor-default transition-all duration-200"
          style={{
            boxShadow: `
              0 30px 60px -15px rgba(80, 50, 20, 0.14),
              0 12px 24px -8px rgba(0, 0, 0, 0.07),
              inset 0 2px 4px rgba(255, 255, 255, 0.95),
              inset 0 -4px 8px rgba(0, 0, 0, 0.05)
            `,
          }}
        >
          {/* Subtle top bevel highlight reflection */}
          <div className="absolute top-1 left-6 right-6 h-3 rounded-full bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />

          {/* Machine Upper Deck - Casing above slot */}
          <div className="relative pt-6 sm:pt-7 pb-2 px-6 sm:px-8 flex flex-col items-center bg-[#F6F2EB] rounded-t-[30px] sm:rounded-t-[34px] z-[40]">
            {/* Header: • POP YOUR TOPIC • */}
            <div className="flex items-center justify-center gap-3 mb-4 select-none">
              <span className="w-2 h-2 rounded-full bg-[#FF4A57]" />
              <h1 className="text-xs sm:text-[14px] font-extrabold tracking-[0.25em] text-[#FF4A57] uppercase font-sans">
                POP YOUR TOPIC
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#FF4A57]" />
            </div>
          </div>

          {/* THE DISPENSER SLOT MOUTH WITH SERRATED CUTTER BLADE */}
          <div className="relative w-full flex flex-col items-center -mt-1 z-30">
            {/* Dark Recessed Slit Bezel */}
            <div
              className="relative w-[315px] sm:w-[350px] h-8 sm:h-9 rounded-lg sm:rounded-xl bg-[#18171D] border-2 border-[#282631] shadow-[inset_0_3px_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.12)] flex items-center justify-center overflow-visible"
            >
              {/* Dark Inner Cavity */}
              <div className="absolute inset-x-1 inset-y-0.5 bg-[#0C0B0E] rounded-md shadow-inner pointer-events-none" />

              {/* Serrated Cutter Blade along top lip of slot mouth */}
              <div className="absolute top-0 inset-x-1.5 h-3 sm:h-3.5 z-30 pointer-events-none overflow-hidden flex items-start">
                <svg
                  className="w-full h-3 sm:h-3.5 text-[#18171D] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
                  viewBox="0 0 320 10"
                  preserveAspectRatio="none"
                  fill="currentColor"
                >
                  {/* Cutter Teeth Sawtooth Path */}
                  <path d="M 0,0 L 320,0 L 320,3 
                    L 315,8 L 310,3 L 305,8 L 300,3 L 295,8 L 290,3 L 285,8 L 280,3 
                    L 275,8 L 270,3 L 265,8 L 260,3 L 255,8 L 250,3 L 245,8 L 240,3 
                    L 235,8 L 230,3 L 225,8 L 220,3 L 215,8 L 210,3 L 205,8 L 200,3 
                    L 195,8 L 190,3 L 185,8 L 180,3 L 175,8 L 170,3 L 165,8 L 160,3 
                    L 155,8 L 150,3 L 145,8 L 140,3 L 135,8 L 130,3 L 125,8 L 120,3 
                    L 115,8 L 110,3 L 105,8 L 100,3 L 95,8 L 90,3 L 85,8 L 80,3 
                    L 75,8 L 70,3 L 65,8 L 60,3 L 55,8 L 50,3 L 45,8 L 40,3 
                    L 35,8 L 30,3 L 25,8 L 20,3 L 15,8 L 10,3 L 5,8 L 0,3 Z" 
                  />
                  {/* Subtle highlight along teeth edge */}
                  <path
                    d="M 0,3 
                    L 5,8 L 10,3 L 15,8 L 20,3 L 25,8 L 30,3 L 35,8 L 40,3 
                    L 45,8 L 50,3 L 55,8 L 60,3 L 65,8 L 70,3 L 75,8 L 80,3 
                    L 85,8 L 90,3 L 95,8 L 100,3 L 105,8 L 110,3 L 115,8 L 120,3 
                    L 125,8 L 130,3 L 135,8 L 140,3 L 145,8 L 150,3 L 155,8 L 160,3 
                    L 165,8 L 170,3 L 175,8 L 180,3 L 175,12 L 180,0 L 185,12 L 190,0 L 195,12 L 200,0 Z"
                    fill="none"
                    stroke="#3C3A46"
                    strokeWidth="0.8"
                  />
                </svg>
              </div>

              {/* The Emerging Ticket Container (z-20) */}
              <div
                className="absolute top-1 inset-x-0 mx-auto w-full z-20 flex justify-center pointer-events-auto"
                style={{
                  perspective: 850,
                  perspectiveOrigin: '50% 0px',
                  clipPath: 'polygon(-50px 0px, calc(100% + 50px) 0px, calc(100% + 50px) 3000px, -50px 3000px)',
                }}
              >
                {dispenserStatus !== 'idle' && (
                  <Ticket
                    key={dispenseCount}
                    topic={currentTopic}
                    status={dispenserStatus}
                    onTear={handleTearTicket}
                  />
                )}
              </div>
            </div>
          </div>

          {/* LOWER MACHINE FRONT FACE STAGE (Behind the dispensed hanging ticket) */}
          <div className="relative w-full min-h-[350px] sm:min-h-[375px] z-10 pointer-events-none" />

          {/* BOTTOM MACHINE CONTROL PANEL */}
          <div className="w-full px-6 sm:px-8 pb-5 pt-2 z-30 flex flex-col gap-2.5 select-none">
            {/* Top Row: "🖨 Dispense Another Topic" Label / Action */}
            <div className="flex items-center justify-start w-full">
              <button
                type="button"
                onClick={dispenseNewTopic}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 text-[#FF4A57] font-bold text-xs sm:text-[13px] tracking-wide select-none hover:underline cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#FF4A57]" />
                <span>Dispense Another Topic</span>
              </button>
            </div>

            {/* Main Control Row: Left Tactile 3-groove Button | Center LED | Right 5x5 Grill */}
            <div className="flex items-center justify-between w-full pt-0.5">
              {/* Left: Tactile Button with 3 vertical grooves (|||) */}
              <button
                id="tactile-dispense-button"
                type="button"
                onMouseDown={() => setIsButtonPressed(true)}
                onMouseUp={() => setIsButtonPressed(false)}
                onMouseLeave={() => setIsButtonPressed(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  dispenseNewTopic();
                }}
                disabled={isBusy}
                title="Dispense another topic"
                className={`relative w-14 sm:w-16 h-10 sm:h-11 rounded-xl bg-gradient-to-b from-[#FAF6EF] to-[#E5DDCF] border border-[#D5CAB8] flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none ${
                  isButtonPressed
                    ? 'translate-y-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] bg-[#DDD4C5]'
                    : 'shadow-[0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]'
                }`}
              >
                {/* 3 Debossed Vertical Grooves: ||| */}
                <div className="w-[2.5px] h-4 rounded-full bg-[#A3998B] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0.5px_0_rgba(255,255,255,0.6)]" />
                <div className="w-[2.5px] h-4 rounded-full bg-[#A3998B] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0.5px_0_rgba(255,255,255,0.6)]" />
                <div className="w-[2.5px] h-4 rounded-full bg-[#A3998B] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_0.5px_0_rgba(255,255,255,0.6)]" />
              </button>

              {/* Center: Middle Status LED */}
              {/* Blinks yellow when topic is being generated/dispensed, solid glowing green when ready */}
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-[#E5DDCF] p-0.5 border border-[#D5CBBB] shadow-inner">
                  <motion.div
                    id="machine-status-led"
                    animate={
                      isBusy
                        ? {
                            backgroundColor: ['#EAB308', '#FEF08A', '#EAB308'],
                            scale: [1, 1.2, 1],
                            boxShadow: [
                              '0 0 12px rgba(234, 179, 8, 0.95), 0 0 4px #EAB308',
                              '0 0 4px rgba(234, 179, 8, 0.3)',
                              '0 0 12px rgba(234, 179, 8, 0.95), 0 0 4px #EAB308',
                            ],
                          }
                        : {
                            backgroundColor: '#10B981',
                            scale: 1,
                            boxShadow:
                              '0 0 10px rgba(16, 185, 129, 0.85), 0 0 3px #10B981, inset 0 1px 2px rgba(255, 255, 255, 0.6)',
                          }
                    }
                    transition={
                      isBusy
                        ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.3 }
                    }
                    className="w-2.5 h-2.5 rounded-full bg-[#10B981]"
                  />
                </div>
              </div>

              {/* Right: 5x5 Speaker / Vent Matrix Grill */}
              <div
                id="machine-speaker-grill"
                className="grid grid-cols-5 gap-1.5 p-1 select-none"
                title="Acoustic vent"
              >
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#C2B7A8] shadow-[inset_0_1px_1px_rgba(0,0,0,0.35),0_0.5px_0.5px_rgba(255,255,255,0.7)]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Machine Bottom Feet */}
          <div className="w-full flex justify-between px-10 -mb-2 z-0">
            <div className="w-10 h-3 rounded-b-lg bg-[#2D2A26] border-t border-[#1C1A17] shadow-md" />
            <div className="w-10 h-3 rounded-b-lg bg-[#2D2A26] border-t border-[#1C1A17] shadow-md" />
          </div>

          {/* 3...2...1... Countdown Overlay floating over machine if active */}
          {countdown !== null && (
            <div className="absolute inset-0 z-50 rounded-[32px] sm:rounded-[36px] bg-white/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 animate-fade-in pointer-events-auto">
              <div className="text-7xl sm:text-8xl font-black text-zinc-900 drop-shadow-[0_4px_12px_rgba(255,255,255,0.9)] anim-countdown select-none">
                {countdown}...
              </div>
              <p className="text-xs font-semibold text-zinc-800 mt-2 bg-white/70 px-3 py-1 rounded-full shadow-sm">
                Get ready to speak!
              </p>
              {onCancelCountdown && (
                <button
                  type="button"
                  onClick={onCancelCountdown}
                  className="mt-3 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 bg-white/70 hover:bg-white px-2.5 py-1 rounded-lg border border-zinc-300 cursor-pointer"
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
