"use client";

import React from 'react';
import { motion, TargetAndTransition } from 'motion/react';
import { Clock, Copy, Check, Scissors } from 'lucide-react';
import { Topic, DispenserStatus } from '../types/dispenser';

interface TicketProps {
  topic: Topic;
  status: DispenserStatus;
  onTear?: () => void;
}

const TEETH_COUNT = 25;
const SVG_WIDTH = 100;
const TOOTH_HEIGHT = 8;

// Generate SVG path coordinates for the zigzag / sawtooth cut
const generateZigzagPaths = () => {
  const toothWidth = SVG_WIDTH / TEETH_COUNT;
  let strokeD = 'M 0,0';
  for (let i = 0; i < TEETH_COUNT; i++) {
    const midX = i * toothWidth + toothWidth / 2;
    const endX = (i + 1) * toothWidth;
    strokeD += ` L ${midX.toFixed(2)},${TOOTH_HEIGHT} L ${endX.toFixed(2)},0`;
  }
  const fillD = `${strokeD} L ${SVG_WIDTH},0 L 0,0 Z`;
  return { strokeD, fillD };
};

const { strokeD: zigzagStrokePath, fillD: zigzagFillPath } = generateZigzagPaths();

export const Ticket: React.FC<TicketProps> = ({
  topic,
  status,
  onTear,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pointsText = topic.talkingPoints && topic.talkingPoints.length > 0
      ? `\n\nPoints to talk about:\n${topic.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      : '';
    const fullContent = `Topic: "${topic.text}"${pointsText}`;
    navigator.clipboard?.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Animation configuration: Prototype 1 (Deliberate motorized downward extrusion)
  const getAnimationProps = (): TargetAndTransition => {
    if (status === 'retracting') {
      return {
        y: -540,
        z: 0,
        rotateX: 0,
        rotateZ: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        transition: {
          duration: 0.28,
          ease: [0.38, 0, 0.7, 0.1] as const, // snappy upward retraction into slot
        },
      };
    }

    if (status === 'dispensing') {
      // Prototype 1: Deliberate motorized extrusion (~2.6s) with steady downward feed:
      // Monotonically terminates at y=0 so the top of the slip remains anchored inside the slot roller
      return {
        x: 0,
        y: [-540, -425, -300, -180, -75, -20, -3, 0, 0],
        rotateX: [2, 4.5, 7.5, 9.5, 8, 4.5, 3.5, 1, 0],
        rotateZ: 0,
        skewX: 0,
        scaleY: [0.99, 0.995, 1, 1.006, 1.003, 1, 1, 1, 1],
        opacity: 1,
        transition: {
          duration: 2.6,
          times: [0, 0.22, 0.44, 0.65, 0.82, 0.91, 0.95, 0.98, 1],
          ease: [0.22, 0.88, 0.32, 1] as const,
        },
      };
    }

    if (status === 'ready') {
      return {
        y: 0,
        z: 0,
        rotateX: 0,
        rotateZ: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        transition: { duration: 0.15 },
      };
    }

    if (status === 'torn') {
      return {
        y: 60,
        opacity: 0,
        scale: 0.95,
        rotate: 3,
        transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const },
      };
    }

    return { x: 0, y: -540, z: 0, rotateX: 0, rotateZ: 0, skewX: 0, scaleX: 1, scaleY: 1, opacity: 1 };
  };

  return (
    <motion.div
      id="dispenser-ticket"
      className="relative w-[255px] sm:w-[285px] cursor-default select-none will-change-transform"
      style={{
        transformOrigin: 'top center',
        perspective: 1100,
        transformStyle: 'preserve-3d',
        filter:
          'drop-shadow(0 16px 28px rgba(60, 45, 30, 0.16)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))',
      }}
      initial={
        status === 'ready'
          ? { x: 0, y: 0, z: 0, rotateX: 0, rotateZ: 0, skewX: 0, scaleX: 1, scaleY: 1, opacity: 1 }
          : { x: 0, y: -540, z: 0, rotateX: 2, rotateZ: 0, skewX: 0, scaleX: 1, scaleY: 0.99, opacity: 1 }
      }
      animate={getAnimationProps()}
    >
      <div className="w-full relative">
        {/* Main Ticket Paper Body (White with side borders) */}
        <div className="w-full bg-white rounded-t-xs border-l border-r border-[#ECE6DE] overflow-hidden relative">
          {/* Subtle paper thermal feed sheen overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/[0.03] via-transparent to-black/[0.02]" />

          {/* Ticket Body Content */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 text-center flex flex-col items-center justify-between min-h-[330px] sm:min-h-[355px] relative bg-gradient-to-b from-[#FFFFFF] via-[#FCFCFA] to-[#FAF8F5]">
            {/* Header matching image: ✦ YOUR TOPIC IS READY! ✦ */}
            <div className="w-full flex flex-col items-center pt-0.5 pb-2">
              <div className="flex items-center justify-center gap-2 text-[#FF4A57]">
                <span className="text-sm font-bold select-none leading-none">✦</span>
                <span className="text-xs sm:text-[13px] font-extrabold tracking-wider uppercase font-sans">
                  YOUR TOPIC IS READY!
                </span>
                <span className="text-sm font-bold select-none leading-none">✦</span>
              </div>
              {/* Subtle separator line below header */}
              <div className="w-full h-[1px] bg-[#FF4A57]/20 mt-2 mb-1" />
            </div>

            {/* Category Pill */}
            <div className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#A0988E] mb-1 font-mono">
              {topic.categoryLabel}
            </div>

            {/* Main Topic Prompt Text */}
            <div className="px-1 py-1 w-full">
              <h2
                id="ticket-topic-text"
                className="text-base sm:text-[17px] font-bold text-[#1F1E24] leading-snug tracking-tight font-sans"
              >
                "{topic.text}"
              </h2>
            </div>

            {/* 3 POINTS TO TALK ABOUT (User Request) */}
            {topic.talkingPoints && topic.talkingPoints.length > 0 && (
              <div className="w-full text-left my-2 px-0.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A57]" />
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#FF4A57] font-mono">
                    3 Points to Talk About
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  {topic.talkingPoints.slice(0, 3).map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-[#F9F7F3] px-2.5 py-1.5 rounded-lg border border-[#EDE6DC]"
                    >
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#FF4A57]/12 text-[#FF4A57] text-[10px] font-bold flex items-center justify-center font-mono mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] sm:text-xs text-[#38332E] font-medium leading-relaxed font-sans">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Metadata & Actions */}
            <div className="w-full pt-2.5 mt-1 border-t border-dashed border-[#E8E2D8] flex items-center justify-between text-xs text-[#7A7267]">
              <div className="flex items-center gap-1.5 font-medium">
                <div className="p-1 rounded-full bg-[#F3EFEA] text-[#FF4A57]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] sm:text-xs">{topic.timeToSpeak || 90}s to speak</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Copy button */}
                <button
                  id="ticket-copy-btn"
                  onClick={handleCopy}
                  title="Copy topic and points"
                  className="p-1.5 rounded-md hover:bg-[#F4EFEA] text-[#7A7267] hover:text-[#1F1E24] transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Tear off ticket button */}
                {onTear && status === 'ready' && (
                  <button
                    id="ticket-tear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTear();
                    }}
                    title="Tear off ticket"
                    className="p-1.5 rounded-md hover:bg-[#FFF0F2] text-[#7A7267] hover:text-[#FF4A57] transition-colors"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Realistic Jagged / Serrated Sawtooth Receipt Bottom Cut */}
        <div className="w-full relative -mt-[1px] leading-none select-none block overflow-visible">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${TOOTH_HEIGHT}`}
            preserveAspectRatio="none"
            className="w-full h-3 sm:h-3.5 block overflow-visible"
          >
            {/* Paper teeth solid fill */}
            <path d={zigzagFillPath} fill="#FAF8F5" />
            {/* Subtle paper torn edge stroke along each sawtooth tooth */}
            <path
              d={zigzagStrokePath}
              fill="none"
              stroke="#ECE6DE"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
