"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, ChevronDown, Check } from 'lucide-react';
import { Topic, DispenserStatus } from '../types/dispenser';
import { TOPICS } from '../data/topics';
import { Ticket } from './Ticket';

interface RetroSelectOption {
  value: string;
  label: string;
}

interface RetroSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: RetroSelectOption[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  disabled?: boolean;
  className?: string;
}

const RetroSelect: React.FC<RetroSelectProps> = ({
  value,
  onChange,
  options,
  isOpen,
  onToggle,
  onClose,
  disabled = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"} ${className}`}>
      {/* Pill Trigger Button - Matches Reference Design */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle();
        }}
        className={`w-full h-8 px-3 rounded-full bg-white border text-left text-xs font-semibold flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 cursor-pointer select-none ${
          isOpen
            ? "border-[#FF4A57] ring-2 ring-[#FF4A57]/20 bg-[#FFFDFB] text-[#FF4A57]"
            : "border-[#DDD5C7] text-[#2D2A26] hover:border-[#FF4A57]/60"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="truncate pr-1">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#FF4A57]" : "text-[#9C9286]"
          }`}
        />
      </button>

      {/* Popover Menu - Cute Retro Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 p-1 bg-[#FFFDFB] rounded-2xl border-2 border-[#E7DFC0] shadow-[0_12px_28px_-4px_rgba(60,40,20,0.2),0_4px_10px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.value);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all duration-150 text-left select-none cursor-pointer ${
                      isSelected
                        ? "bg-[#FFE8EC] text-[#FF4A57] font-extrabold shadow-2xs"
                        : "text-[#3D3730] font-semibold hover:bg-[#FFF0F3] hover:text-[#FF4A57]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#FF4A57] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


function getTimeToSpeak(category: string, difficulty: string, moduleType: string): number {
  if (moduleType === 'interview_preparation') return 120;
  const base: Record<string, number> = {
    warmup: 60,
    impromptu: 90,
    persuasive: 120,
    debate: 120,
    storytelling: 120
  };
  const scale: Record<string, number> = { easy: 0.8, medium: 1.0, hard: 1.2 };
  return Math.round((base[category] || 90) * (scale[difficulty] || 1.0));
}

// Module-level deduplication — tracks recently dispensed topic IDs
const recentlyDispensedIds = new Set<string>();
const DEDUP_WINDOW = 8;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface FallbackParams {
  moduleType: string;
  category: string;
  difficulty: string;
  customTopic: string;
}

export function generateTrainedTopicFallback({
  moduleType,
  category,
  difficulty,
  customTopic,
}: FallbackParams): Topic {
  const trimmed = customTopic.trim();
  const cat = (category || (moduleType === 'interview_preparation' ? 'cat_gdpi' : 'impromptu')).toLowerCase();

  if (trimmed.length > 0) {
    if (moduleType === 'interview_preparation') {
      const interviewTemplates: Record<string, { prompt: string; points: string[] }> = {
        cat_gdpi: {
          prompt: `Evaluate the socio-economic and strategic implications of ${trimmed} in emerging markets.`,
          points: [
            `Market Disruption: Analyze how ${trimmed} shifts consumer behavior, competition, and business models.`,
            `Stakeholder Tension: Address regulatory friction, ethical concerns, or societal trade-offs involved.`,
            `Strategic Outlook: Propose a balanced corporate and policy roadmap to maximize sustainable upside.`
          ]
        },
        hr_interview: {
          prompt: `Describe a scenario where you applied principles of ${trimmed} or overcame a complex challenge related to it in your team.`,
          points: [
            `Situation & Stakes: Describe the high-stakes context where ${trimmed} or that core challenge surfaced.`,
            `Personal Initiative: Highlight your specific communication, empathy, and ownership to solve it.`,
            `Long-term Impact: The tangible result achieved and the lasting professional lesson learned.`
          ]
        },
        software_engineering: {
          prompt: `How would you architect a system or evaluate trade-offs when integrating or scaling ${trimmed}?`,
          points: [
            `Architectural Constraints: Define latency, fault tolerance, and security boundaries for ${trimmed}.`,
            `Trade-off Defense: Defend your chosen design pattern against alternatives like speed vs maintainability.`,
            `Reliability & Scale: Explain how you monitor bottlenecks and ensure zero-downtime resilience.`
          ]
        },
        mba_admissions: {
          prompt: `How has your exposure to ${trimmed} shaped your strategic leadership philosophy and long-term career ambition?`,
          points: [
            `Inflection Point: The pivotal project or insight around ${trimmed} that revealed your growth areas.`,
            `Leadership Under Ambiguity: Leading diverse teams when navigating unfamiliar complexities like ${trimmed}.`,
            `Future Vision: How an MBA bridges this domain knowledge into scalable executive leadership.`
          ]
        },
        campus_placement: {
          prompt: `Walk me through a project, concept, or practical scenario where you engaged deeply with ${trimmed}.`,
          points: [
            `Core Curiosity: What initially drew you to explore ${trimmed} and how you defined the scope.`,
            `Technical Rigor: The specific tools, problem-solving methods, and hurdles you navigated.`,
            `Readiness to Contribute: How this hands-on learning translates into immediate value for our team.`
          ]
        },
        leadership: {
          prompt: `Describe how you would steer an organization facing turbulent change or ethical questions around ${trimmed}.`,
          points: [
            `Vision Alignment: Fostering organizational clarity amidst the ambiguities of ${trimmed}.`,
            `Decisive Governance: Making the hard ethical call while protecting long-term employee trust.`,
            `Cultural Resilience: Building an adaptable culture capable of thriving through this paradigm.`
          ]
        },
        upsc_interview: {
          prompt: `How should civil administration balance constitutional rights and public welfare when addressing issues around ${trimmed}?`,
          points: [
            `Constitutional Principles: Grounding the administrative stance in constitutional values, rule of law, and equity.`,
            `Stakeholder Realities: Navigating ground-level social tensions, economic trade-offs, and administrative feasibility.`,
            `Pragmatic Policy Solution: Formulating a balanced, transparent governance roadmap with public accountability.`
          ]
        }
      };

      const matched = interviewTemplates[cat] || interviewTemplates.cat_gdpi;
      return {
        id: `custom-interview-${Date.now()}`,
        text: matched.prompt,
        category: cat,
        categoryLabel: cat.toUpperCase().replace(/_/g, ' '),
        timeToSpeak: 120,
        talkingPoints: matched.points
      };
    }

    // Public Speaking custom topic templates — MULTIPLE variants per category
    const publicSpeakingTemplates: Record<string, (theme: string) => { prompt: string; points: string[] }> = {
      impromptu: (theme) => pick([
        {
          prompt: `How our relationship with ${theme} reveals what we truly value in modern life.`,
          points: [
            `The Hook & Opening Insight: An unexpected personal moment where ${theme} caught you off guard.`,
            `The Core Tension: The hidden trade-off most people ignore when engaging with ${theme}.`,
            `The Takeaway: A rule of thumb you'd offer a friend navigating ${theme} for the first time.`
          ]
        },
        {
          prompt: `If ${theme} disappeared overnight, what would we miss — and what would we secretly be relieved to lose?`,
          points: [
            `The Hook: The first thing that would change in your daily routine without ${theme}.`,
            `The Core Tension: What we claim to need vs. what we actually depend on.`,
            `The Takeaway: What this thought experiment reveals about our real priorities.`
          ]
        },
        {
          prompt: `What does ${theme} teach us about the difference between comfort and growth?`,
          points: [
            `The Hook: A specific moment where ${theme} pushed you outside your comfort zone.`,
            `The Core Tension: Why we resist the very things that expand us — through the lens of ${theme}.`,
            `The Takeaway: A principle about growth that ${theme} illustrates better than any textbook.`
          ]
        },
        {
          prompt: `Is our obsession with ${theme} a symptom of something deeper we're avoiding?`,
          points: [
            `The Hook: A provocative observation about how people talk about ${theme} vs. how they actually engage with it.`,
            `The Core Tension: The gap between what ${theme} promises and what it actually delivers emotionally.`,
            `The Takeaway: An honest reflection on what healthy engagement with ${theme} looks like.`
          ]
        },
        {
          prompt: `You have 60 seconds to change a stranger's mind about ${theme}. What's your opening hook?`,
          points: [
            `The Hook: The single most surprising fact or angle about ${theme} that stops people mid-sentence.`,
            `The Core Tension: Why conventional wisdom about ${theme} is incomplete or outdated.`,
            `The Takeaway: The one mental model that transforms how someone sees ${theme}.`
          ]
        }
      ]),

      persuasive: (theme) => pick([
        {
          prompt: `Why we need a radical shift in how modern society approaches ${theme}.`,
          points: [
            `The Thesis: State a bold, uncompromising position on the real stakes of ${theme}.`,
            `Dismantling Objections: Directly answer the strongest counterargument with logic, evidence, and conviction.`,
            `The Call to Action: Urge the audience with an inspiring, actionable challenge to change their habits or beliefs.`
          ]
        },
        {
          prompt: `The status quo on ${theme} is quietly failing millions of people — and almost nobody is talking about it.`,
          points: [
            `The Urgent Problem: Name the specific population harmed by inaction on ${theme} and quantify the damage.`,
            `Refuting Complacency: Why "it's always been this way" is the weakest defense against reform.`,
            `The Demand: One concrete policy, habit, or investment the audience should champion starting today.`
          ]
        },
        {
          prompt: `If you're not angry about the current state of ${theme}, you haven't been paying attention.`,
          points: [
            `The Wake-Up Call: The data point or story about ${theme} that should alarm every informed citizen.`,
            `The Rebuttal: Dismantling the most popular excuse for ignoring this issue.`,
            `The Rallying Cry: What collective action on ${theme} looks like — and why it starts with individual choices.`
          ]
        },
        {
          prompt: `${theme} is the defining test of whether this generation has the courage to act on its values.`,
          points: [
            `The Stakes: What future generations will judge us for if we continue to ignore ${theme}.`,
            `The Counter-Narrative: Why the mainstream position on ${theme} serves powerful interests, not people.`,
            `The Call to Action: A specific, measurable step every person in this room can take within 30 days.`
          ]
        }
      ]),

      debate: (theme) => pick([
        {
          prompt: `Motion: This House Believes that the rapid expansion of ${theme} does more harm than good.`,
          points: [
            `Proposition (Affirmative): The strongest systemic, ethical, or economic case supporting the motion.`,
            `Opposition (Negative): The indispensable benefits, human liberties, or competitive upside of opposing the motion.`,
            `The Key Clash Point: The pivotal philosophical or practical trade-off that decides this debate.`
          ]
        },
        {
          prompt: `Motion: This House Would ban ${theme} in public institutions until comprehensive regulation exists.`,
          points: [
            `Proposition (Affirmative): Precautionary governance protects vulnerable populations from unregulated ${theme} harms.`,
            `Opposition (Negative): Blanket bans stifle innovation, push ${theme} underground, and punish responsible actors.`,
            `The Key Clash Point: Whether precaution or permissionless innovation better serves the public interest.`
          ]
        },
        {
          prompt: `Motion: This House Believes that governments should subsidize ${theme} as a universal public good.`,
          points: [
            `Proposition (Affirmative): ${theme} produces positive externalities that markets under-provide — subsidies correct this failure.`,
            `Opposition (Negative): Government subsidies distort competition, create dependency, and crowd out private innovation in ${theme}.`,
            `The Key Clash Point: Whether ${theme} is a merit good deserving public funding or a competitive market best left to private capital.`
          ]
        },
        {
          prompt: `Motion: This House Believes that the benefits of ${theme} are distributed so unequally that it deepens systemic inequality.`,
          points: [
            `Proposition (Affirmative): Access to ${theme} tracks existing wealth, education, and geography — amplifying privilege rather than leveling it.`,
            `Opposition (Negative): ${theme} has historically democratized access (lower costs, wider reach) and will continue to do so at scale.`,
            `The Key Clash Point: Whether technological or social progress in ${theme} is inherently equalizing or inherently concentrating.`
          ]
        },
        {
          prompt: `Motion: This House Would require mandatory transparency and public auditing of all ${theme} systems.`,
          points: [
            `Proposition (Affirmative): Public accountability prevents abuse, builds trust, and protects citizens from opaque ${theme} practices.`,
            `Opposition (Negative): Forced transparency exposes trade secrets, chills innovation, and creates compliance burdens that favor large incumbents.`,
            `The Key Clash Point: Whether the public's right to understand ${theme} outweighs the private sector's right to competitive secrecy.`
          ]
        }
      ]),

      warmup: (theme) => pick([
        {
          prompt: `If you were declared the world’s foremost authority on ${theme} for just 24 hours, what would you do?`,
          points: [
            `The Gut Reaction: An entertaining, humorous reaction to suddenly holding ultimate authority over ${theme}.`,
            `The Playful Decree: A hilarious new rule or quirky custom you would immediately institute.`,
            `The Lighthearted Conclusion: A fun takeaway reflecting on what makes ${theme} entertaining in real life.`
          ]
        },
        {
          prompt: `Pitch ${theme} to a five-year-old using only words a five-year-old would understand.`,
          points: [
            `The Opening Attempt: Your first, probably hilarious, analogy to explain ${theme} to a child.`,
            `The Follow-Up Question: The inevitable "but why?" a kid would ask — and your scrambled answer.`,
            `The Verdict: Whether the five-year-old would be excited, confused, or bored — and what that says about ${theme}.`
          ]
        },
        {
          prompt: `You're a tour guide giving a dramatically over-the-top guided tour of ${theme}. Go!`,
          points: [
            `The Grand Welcome: An absurdly theatrical introduction as if ${theme} were the eighth wonder of the world.`,
            `The Highlight Reel: The "must-see attractions" of ${theme}, narrated with maximum enthusiasm.`,
            `The Gift Shop Exit: Your parting recommendation — what souvenir or takeaway should visitors bring home?`
          ]
        },
        {
          prompt: `Defend ${theme} in a fake courtroom trial where it's been accused of being overrated.`,
          points: [
            `Opening Statement: Your passionate defense of ${theme} against the charges of being overrated.`,
            `Key Evidence: The one irrefutable piece of evidence that proves ${theme} deserves its reputation.`,
            `Closing Argument: Your dramatic final plea to the jury — why ${theme} must be acquitted.`
          ]
        },
        {
          prompt: `Create a 30-second movie trailer for a blockbuster film about ${theme}. Narrate it live!`,
          points: [
            `The Hook Shot: The dramatic opening scene — explosions, whispers, or a slow zoom on ${theme}.`,
            `The Plot Twist: The moment in the trailer where the audience gasps — what unexpected angle does ${theme} take?`,
            `The Tagline: The one-liner that appears on screen before the title drops. Make it iconic.`
          ]
        }
      ]),

      storytelling: (theme) => pick([
        {
          prompt: `Recount a vivid moment when ${theme} or an experience connected to it taught you an unforgettable lesson.`,
          points: [
            `Setting the Scene: Establish the physical atmosphere, initial expectations, and emotional stakes before things unfolded.`,
            `The Turning Point: The critical moment plans fell apart, an unexpected truth surfaced, or friction peaked.`,
            `The Transformation: How walking through that experience permanently reshaped your character and perspective.`
          ]
        },
        {
          prompt: `Tell the story of the worst advice you ever received about ${theme} — and what following it taught you.`,
          points: [
            `The Setup: Who gave you the advice, why you trusted them, and why it sounded reasonable at the time.`,
            `The Disaster: What happened when you followed it — the specific moment you realized it was wrong.`,
            `The Real Lesson: What you actually learned, which was more valuable than any "good" advice could have been.`
          ]
        },
        {
          prompt: `Describe a moment when ${theme} made you feel like an absolute beginner again — and why that was transformative.`,
          points: [
            `The Confidence Before: What you thought you knew, and why you felt competent or experienced.`,
            `The Humbling Moment: The specific event that shattered your expertise and left you starting from scratch.`,
            `The Growth: How embracing beginner's mind through ${theme} unlocked abilities you didn't know you had.`
          ]
        },
        {
          prompt: `Tell the story of a conversation about ${theme} that you replay in your head to this day.`,
          points: [
            `The Context: Where you were, who you were with, and what made this conversation different from the hundreds before it.`,
            `The Line That Landed: The exact sentence or question that hit you differently — and the silence or reaction that followed.`,
            `The Echo: How that conversation quietly shaped decisions you've made since, even years later.`
          ]
        }
      ])
    };

    const generator = publicSpeakingTemplates[cat] || publicSpeakingTemplates.impromptu;
    const generated = generator(trimmed);
    return {
      id: `custom-speech-${Date.now()}`,
      text: generated.prompt,
      category: cat,
      categoryLabel: cat.toUpperCase().replace(/_/g, ' '),
      timeToSpeak: getTimeToSpeak(cat, difficulty, moduleType),
      talkingPoints: generated.points
    };
  }

  // Normal topic selection: filtered strictly by category with deduplication
  const matching = TOPICS.filter((t) => t.category.toLowerCase() === cat);
  const fresh = matching.filter((t) => !recentlyDispensedIds.has(t.id));
  const pool = fresh.length > 0 ? fresh : (matching.length > 0 ? matching : TOPICS);
  const picked = pool[Math.floor(Math.random() * pool.length)];

  // Track and cap the sliding window
  recentlyDispensedIds.add(picked.id);
  if (recentlyDispensedIds.size > DEDUP_WINDOW) {
    const oldest = recentlyDispensedIds.values().next().value;
    if (oldest) recentlyDispensedIds.delete(oldest);
  }

  return {
    ...picked,
    timeToSpeak: getTimeToSpeak(cat, difficulty, moduleType),
    id: `dispensed-${Date.now()}`
  };
}

interface TopicDispenserProps {
  initialTopic?: Topic;
  onTopicChange?: (topic: Topic) => void;
  countdown?: number | null;
  onCancelCountdown?: () => void;
  moduleType?: string;
  onModuleTypeChange?: (val: "public_speaking" | "interview_preparation") => void;
  category?: string;
  onCategoryChange?: (val: string) => void;
  difficulty?: string;
  onDifficultyChange?: (val: string) => void;
  customTopic?: string;
  onCustomTopicChange?: (val: string) => void;
  onRequestNewTopic?: (params: {
    moduleType: string;
    category: string;
    difficulty: string;
    customTopic: string;
  }) => Promise<Topic | null>;
}

export const TopicDispenser: React.FC<TopicDispenserProps> = ({
  initialTopic,
  onTopicChange,
  countdown = null,
  onCancelCountdown,
  moduleType = "public_speaking",
  onModuleTypeChange,
  category = "impromptu",
  onCategoryChange,
  difficulty = "medium",
  onDifficultyChange,
  customTopic = "",
  onCustomTopicChange,
  onRequestNewTopic,
}) => {
  // Topics queue / selection - Defaults to IDLE so machine starts waiting for user to pop topic!
  const [currentTopic, setCurrentTopic] = useState<Topic>(initialTopic || TOPICS[0]);
  const [dispenserStatus, setDispenserStatus] = useState<DispenserStatus>(initialTopic ? 'ready' : 'idle');
  const [dispenseCount, setDispenseCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'module' | 'category' | 'difficulty' | null>(null);

  const isDispensingRef = useRef(false);

  const MODULE_OPTIONS: RetroSelectOption[] = [
    { value: 'public_speaking', label: 'Public Speaking' },
    { value: 'interview_preparation', label: 'Interview Preparation' },
  ];

  const PUBLIC_SPEAKING_CATEGORIES: RetroSelectOption[] = [
    { value: 'impromptu', label: 'Impromptu' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'debate', label: 'Debate' },
    { value: 'warmup', label: 'Warmup' },
    { value: 'storytelling', label: 'Storytelling' },
  ];

  const INTERVIEW_CATEGORIES: RetroSelectOption[] = [
    { value: 'cat_gdpi', label: 'CAT GDPI' },
    { value: 'hr_interview', label: 'HR Interview' },
    { value: 'software_engineering', label: 'Tech Behavioral' },
    { value: 'mba_admissions', label: 'MBA Admissions' },
    { value: 'campus_placement', label: 'Campus Placement' },
    { value: 'upsc_interview', label: 'UPSC Interview' },
    { value: 'leadership', label: 'Leadership' },
  ];

  const currentCategoryOptions = moduleType === 'interview_preparation'
    ? INTERVIEW_CATEGORIES
    : PUBLIC_SPEAKING_CATEGORIES;

  const DIFFICULTY_OPTIONS: RetroSelectOption[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const handleModuleChange = (newModule: "public_speaking" | "interview_preparation") => {
    onModuleTypeChange?.(newModule);
    if (newModule === 'interview_preparation') {
      onCategoryChange?.('cat_gdpi');
    } else {
      onCategoryChange?.('impromptu');
    }
  };

  // Sync if external initialTopic changes (e.g. from tab selection or initial load)
  useEffect(() => {
    if (isDispensingRef.current) return;
    if (initialTopic && initialTopic.id !== currentTopic.id) {
      setCurrentTopic(initialTopic);
      setDispenserStatus('ready');
    }
  }, [initialTopic, currentTopic.id]);

  const dispenseNewTopic = async () => {
    if (isDispensingRef.current || dispenserStatus === 'dispensing' || dispenserStatus === 'retracting') return;
    setOpenDropdown(null);
    isDispensingRef.current = true;
    setIsGenerating(true);

    try {
      // 1. Kick off new topic generation concurrently right now
      const fetchPromise = (async (): Promise<Topic> => {
        let fetched: Topic | null = null;
        if (onRequestNewTopic) {
          try {
            const reqPromise = onRequestNewTopic({
              moduleType,
              category,
              difficulty,
              customTopic,
            });
            const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 4000));
            fetched = await Promise.race([reqPromise, timeoutPromise]);
          } catch (err) {
            console.warn("Async topic request error:", err);
          }
        }
        if (!fetched) {
          fetched = generateTrainedTopicFallback({
            moduleType,
            category,
            difficulty,
            customTopic,
          });
        }
        return fetched;
      })();

      // 2. If ticket is currently out, retract it smoothly into slot
      if (dispenserStatus === 'ready') {
        setDispenserStatus('retracting');
        await new Promise((r) => setTimeout(r, 240));
      }

      // 3. Await topic resolution (fetching was started concurrently above)
      const nextTopic = await fetchPromise;

      // 4. Update the topic BEFORE extrusion begins!
      // This guarantees the ticket emerges ALREADY containing the new topic from frame 1
      setCurrentTopic(nextTopic);
      onTopicChange?.(nextTopic);

      // 5. Start motorized downward feed extrusion with the new topic already in place
      setDispenseCount((prev) => prev + 1);
      setDispenserStatus('dispensing');
      setIsGenerating(false);

      // 6. Complete extrusion cycle
      await new Promise((r) => setTimeout(r, 2300));
      setDispenserStatus('ready');
    } catch (err) {
      console.error("Dispenser error:", err);
      setDispenserStatus('ready');
    } finally {
      setIsGenerating(false);
      isDispensingRef.current = false;
    }
  };

  // Tear off ticket
  const handleTearTicket = () => {
    if (dispenserStatus !== 'ready') return;
    setDispenserStatus('torn');
    setTimeout(() => {
      setDispenserStatus('idle');
    }, 400);
  };

  const isBusy = isGenerating || dispenserStatus === 'dispensing' || dispenserStatus === 'retracting';

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto px-0 select-none relative">
      {/* Top hint with arrow: "Press [ ||| ] to get your topic ↓" */}
      <div className="flex flex-col items-center mb-2">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-[#FF4A57] font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 font-sans">
            Press [ ||| ] to get your topic
          </span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[#FF4A57] text-base font-bold leading-none mt-0.5"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>

      {/* THE TOPIC DISPENSER MACHINE PROTOTYPE */}
      <div className="relative flex flex-col items-center w-full">
        {/* Machine Body with Realistic 3D Skeuomorphic Styling */}
        <motion.div
          id="topic-machine"
          animate={
            isBusy
              ? {
                  x: [-0.7, 0.7, -0.5, 0.5, 0],
                  y: [-0.4, 0.4, 0],
                  transition: { duration: 0.12, repeat: Infinity, ease: 'linear' },
                }
              : { x: 0, y: 0 }
          }
          className="group relative w-full max-w-[320px] sm:max-w-[340px] rounded-[30px] sm:rounded-[34px] bg-[#F6F2EB] border-2 border-[#E7DFC0] cursor-default transition-all duration-200"
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
          <div className="relative pt-5 sm:pt-6 pb-2 px-5 sm:px-6 flex flex-col items-center bg-[#F6F2EB] rounded-t-[28px] sm:rounded-t-[32px] z-[40]">
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
              className="relative w-[90%] sm:w-[92%] h-8 sm:h-9 rounded-lg sm:rounded-xl bg-[#18171D] border-2 border-[#282631] shadow-[inset_0_3px_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.12)] flex items-center justify-center overflow-visible"
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
                {dispenserStatus !== 'idle' ? (
                  <Ticket
                    key={dispenseCount}
                    topic={currentTopic}
                    status={dispenserStatus}
                    onTear={handleTearTicket}
                  />
                ) : (
                  /* A neat white paper slip edge peeking out of the slit, waiting to feed */
                  <div className="w-[220px] sm:w-[240px] h-3 bg-gradient-to-b from-[#FFFDF9] to-[#F5EFE6] border-b border-x border-[#DDD5C7] rounded-b-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center pointer-events-none -mt-0.5">
                    <span className="text-[8px] font-bold tracking-widest text-[#FF4A57]/80 uppercase font-mono">
                      ✦ READY TO DISPENSE ✦
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LOWER MACHINE FRONT FACE STAGE */}
          <div className="relative w-full min-h-[210px] sm:min-h-[225px] z-40 flex flex-col justify-between overflow-visible">
            {dispenserStatus === 'idle' ? (
              <div className="w-full px-5 py-2 flex flex-col gap-2 pointer-events-auto text-left relative z-40 overflow-visible">
                {/* Module */}
                <div className="flex flex-col gap-0.5 relative z-30">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#A0988E] font-mono select-none">
                    Module
                  </label>
                  <RetroSelect
                    value={moduleType}
                    onChange={(val) => handleModuleChange(val as any)}
                    options={MODULE_OPTIONS}
                    isOpen={openDropdown === 'module'}
                    onToggle={() => setOpenDropdown(prev => prev === 'module' ? null : 'module')}
                    onClose={() => setOpenDropdown(null)}
                    disabled={isBusy}
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-2 gap-2 relative z-20">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#A0988E] font-mono select-none">
                      Category
                    </label>
                    <RetroSelect
                      value={category}
                      onChange={(val) => onCategoryChange?.(val)}
                      options={currentCategoryOptions}
                      isOpen={openDropdown === 'category'}
                      onToggle={() => setOpenDropdown(prev => prev === 'category' ? null : 'category')}
                      onClose={() => setOpenDropdown(null)}
                      disabled={isBusy}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#A0988E] font-mono select-none">
                      Difficulty
                    </label>
                    <RetroSelect
                      value={difficulty}
                      onChange={(val) => onDifficultyChange?.(val)}
                      options={DIFFICULTY_OPTIONS}
                      isOpen={openDropdown === 'difficulty'}
                      onToggle={() => setOpenDropdown(prev => prev === 'difficulty' ? null : 'difficulty')}
                      onClose={() => setOpenDropdown(null)}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                {/* Custom Topic (Optional) */}
                <div className="flex flex-col gap-0.5 relative z-10">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#A0988E] font-mono select-none">
                    Custom Topic (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => onCustomTopicChange?.(e.target.value)}
                    placeholder="e.g. why remote work is the future..."
                    className="w-full h-8 text-[11px] font-medium bg-white border border-[#DDD5C7] rounded-full px-3.5 text-[#2D2A26] placeholder:text-[#B5AAA0] shadow-xs focus:outline-hidden focus:border-[#FF4A57] focus:ring-2 focus:ring-[#FF4A57]/20 transition-all"
                  />
                </div>

                {/* Big Action Button */}
                <button
                  type="button"
                  id="machine-pop-topic-btn"
                  onClick={dispenseNewTopic}
                  disabled={isBusy}
                  className="w-full h-9 mt-0.5 rounded-2xl bg-gradient-to-r from-[#FF4A57] via-[#FA5276] to-[#FF4A57] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-extrabold text-xs tracking-wider uppercase font-sans shadow-md shadow-[#FF4A57]/25 hover:shadow-lg hover:shadow-[#FF4A57]/35 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none relative z-10"
                >
                  <span>✦</span>
                  <span>{isBusy ? "PRINTING TOPIC..." : "POP YOUR TOPIC"}</span>
                  <span>✦</span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full pointer-events-none" />
            )}
          </div>

          {/* BOTTOM MACHINE CONTROL PANEL */}
          <div className="w-full px-6 sm:px-8 pb-5 pt-2 z-30 flex flex-col gap-2.5 select-none">
            {/* Top Row: "🖨 Dispense Another Topic" / "🖨 Pop Your Topic" */}
            <div className="flex items-center justify-start w-full">
              <button
                type="button"
                onClick={dispenseNewTopic}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 text-[#FF4A57] font-bold text-xs sm:text-[13px] tracking-wide select-none hover:underline cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#FF4A57]" />
                <span>
                  {isBusy
                    ? 'Printing Topic...'
                    : dispenserStatus === 'idle'
                    ? 'Pop Your Topic'
                    : 'Dispense Another Topic'}
                </span>
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
                title={dispenserStatus === 'idle' ? 'Pop your topic' : 'Dispense another topic'}
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
                        : dispenserStatus === 'ready'
                        ? {
                            backgroundColor: '#10B981',
                            scale: 1,
                            boxShadow:
                              '0 0 10px rgba(16, 185, 129, 0.85), 0 0 3px #10B981, inset 0 1px 2px rgba(255, 255, 255, 0.6)',
                          }
                        : {
                            backgroundColor: '#FF4A57',
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 8px rgba(255, 74, 87, 0.8), 0 0 2px #FF4A57',
                              '0 0 4px rgba(255, 74, 87, 0.4)',
                              '0 0 8px rgba(255, 74, 87, 0.8), 0 0 2px #FF4A57',
                            ],
                          }
                    }
                    transition={
                      isBusy
                        ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
                        : dispenserStatus === 'idle'
                        ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.3 }
                    }
                    className="w-2.5 h-2.5 rounded-full bg-[#FF4A57]"
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
