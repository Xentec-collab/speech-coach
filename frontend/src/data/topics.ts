import { Topic } from '../types/dispenser';

export const TOPICS: Topic[] = [
  // ── IMPROMPTU (Spontaneous, Philosophical & Metaphorical) ─────────────────
  {
    id: 'imp-1',
    text: 'Why boredom is the fertile soil of human creativity.',
    category: 'impromptu',
    categoryLabel: 'Impromptu',
    timeToSpeak: 90,
    talkingPoints: [
      'The Hook: The modern fear of an unoccupied 30 seconds and our reflexive screen check.',
      'The Core Tension: How constant digital stimulation suffocates original thoughts before they form.',
      'The Takeaway: Why scheduling 15 minutes of deliberate stillness unlocks your best ideas.',
    ],
  },
  {
    id: 'imp-2',
    text: 'The hidden price of perfectionism: Why done is better than perfect.',
    category: 'impromptu',
    categoryLabel: 'Impromptu',
    timeToSpeak: 90,
    talkingPoints: [
      'The Analogy: How over-polishing a sculpture can rub away its soul.',
      'The Core Friction: Distinguishing high standards from the paralyzing fear of judgment.',
      'The Takeaway: Why releasing imperfect work into the real world is the only way to grow.',
    ],
  },
  {
    id: 'imp-3',
    text: 'If you had to teach a 1-hour masterclass right now with zero preparation...',
    category: 'impromptu',
    categoryLabel: 'Impromptu',
    timeToSpeak: 90,
    talkingPoints: [
      'The Opening Hook: The unexpected skill or quirky life obsession you would pick.',
      'The Three Foundational Rules: The immediate mental models you would pass to beginners.',
      'The Rookie Pitfall: The single biggest trap to warn them against from day one.',
    ],
  },
  {
    id: 'imp-4',
    text: 'What is something simple that never fails to spark your curiosity?',
    category: 'impromptu',
    categoryLabel: 'Impromptu',
    timeToSpeak: 90,
    talkingPoints: [
      'The Observation: An everyday object, natural pattern, or overlooked human habit.',
      'The Underlying Wonder: What hidden physics, biology, or social psychology captivates you.',
      'The Reflection: How maintaining childlike curiosity shields you from cynicism.',
    ],
  },

  // ── DEBATE (Motions, Proposition vs Opposition & Sparring) ────────────────
  {
    id: 'deb-1',
    text: 'Motion: Artificial intelligence should not be granted creative copyright protections.',
    category: 'debate',
    categoryLabel: 'Debate',
    timeToSpeak: 90,
    talkingPoints: [
      'Proposition: Copyright exists to reward human labor; synthetic outputs merely remix scraped human creative sweat.',
      'Opposition: Advanced prompting requires design ingenuity; withholding copyright disincentivizes private capital into tools.',
      'Clash Point: Whether copyright protects conscious human expression or the commercial utility of the final artifact.',
    ],
  },
  {
    id: 'deb-2',
    text: 'Motion: Companies should be prohibited from monitoring remote workers’ keystrokes and screens.',
    category: 'debate',
    categoryLabel: 'Debate',
    timeToSpeak: 90,
    talkingPoints: [
      'Proposition: Surveillance destroys psychological safety, breeds paranoia, and rewards frantic busywork over outcomes.',
      'Opposition: Employers hold fiduciary and security responsibilities to protect client IP, prevent leaks, and ensure paid compliance.',
      'Clash Point: Where a firm’s legal security perimeter ends and a worker’s digital privacy begins.',
    ],
  },
  {
    id: 'deb-3',
    text: 'Motion: Standardized entrance examinations do more harm than good in higher education admissions.',
    category: 'debate',
    categoryLabel: 'Debate',
    timeToSpeak: 90,
    talkingPoints: [
      'Proposition: Standardized tests measure access to expensive coaching institutes rather than genuine intellectual grit.',
      'Opposition: Standardized testing provides an objective, meritocratic equalizer against subjective essay favoritism.',
      'Clash Point: Whether holistic admissions reduces systemic bias or simply hides opaque institutional preferences.',
    ],
  },
  {
    id: 'deb-4',
    text: 'Motion: Social media platforms should eliminate all public follower and like counts.',
    category: 'debate',
    categoryLabel: 'Debate',
    timeToSpeak: 90,
    talkingPoints: [
      'Proposition: Public vanity metrics gamify human validation, fuel algorithmic outrage, and harm mental health.',
      'Opposition: Transparent metrics are decentralized credentials that democratize creator reach without corporate gatekeepers.',
      'Clash Point: Whether public social metrics cause societal harm or democratize cultural influence.',
    ],
  },

  // ── WARMUP (Playful Icebreakers & Vocal Loosening) ────────────────────────
  {
    id: 'warm-1',
    text: 'If you had a personal warning label tattooed on your arm, what would it say?',
    category: 'warmup',
    categoryLabel: 'Warmup',
    timeToSpeak: 90,
    talkingPoints: [
      'The Initial Reaction: The humorous, quirky trait or habit your closest friends would instantly recognize.',
      'The Anecdote: A funny, relatable scenario where someone failed to heed that warning.',
      'The Fun Conclusion: How learning to laugh at your own quirks makes you more resilient and approachable.',
    ],
  },
  {
    id: 'warm-2',
    text: 'Describe your morning routine as if it were a high-stakes Hollywood action movie trailer.',
    category: 'warmup',
    categoryLabel: 'Warmup',
    timeToSpeak: 90,
    talkingPoints: [
      'The Opening Hook: Dramatic cinematic narration of the heroic battle against the morning alarm clock.',
      'The Crisis: The high-stakes struggle for hot water, clean socks, and the vital brewing of caffeine.',
      'The Triumphant Ending: Stepping out the front door ready to conquer the universe against all odds.',
    ],
  },
  {
    id: 'warm-3',
    text: 'What is the most bizarre or unusual food you have ever eaten?',
    category: 'warmup',
    categoryLabel: 'Warmup',
    timeToSpeak: 90,
    talkingPoints: [
      'Setting the Scene: Where you were, what the dish looked like, and who dared you to try it.',
      'The Sensory Shock: The aroma, texture, and your unfiltered physical reaction upon the first bite.',
      'The Verdict: Whether you would ever touch it again, and your rules for culinary courage.',
    ],
  },
  {
    id: 'warm-4',
    text: 'If you were forced to live inside one video game or cartoon universe for a week, which one and why?',
    category: 'warmup',
    categoryLabel: 'Warmup',
    timeToSpeak: 90,
    talkingPoints: [
      'The Selection: The fictional world you picked and why it sounds delightfully cozy or wildly chaotic.',
      'Your Survival Strategy: How you would navigate the physics, peculiar NPCs, and daily routines there.',
      'The Return: What that imaginary getaway reveals about what you crave in your actual daily life.',
    ],
  },

  // ── PERSUASIVE (Thesis, Rhetoric & Call to Action) ────────────────────────
  {
    id: 'pers-1',
    text: 'Why social media algorithms should be legally required to be open source.',
    category: 'persuasive',
    categoryLabel: 'Persuasive',
    timeToSpeak: 90,
    talkingPoints: [
      'The Urgent Problem: How opaque recommendation engines hijack civil discourse and attention.',
      'Dismantling Trade-Secret Excuses: Why public accountability overrides corporate IP claims.',
      'The Call to Action: Demanding user agency over the feeds that shape our democracy.',
    ],
  },
  {
    id: 'pers-2',
    text: 'Remote work is not a perk—it is an economic and environmental necessity.',
    category: 'persuasive',
    categoryLabel: 'Persuasive',
    timeToSpeak: 90,
    talkingPoints: [
      'The Thesis: Millions of wasted commuting hours and ecological pollution are preventable.',
      'Refuting Traditional Objections: Addressing collaboration and trust concerns with clear metrics.',
      'The Future Workplace: Urging leaders to judge outcomes rather than office presence.',
    ],
  },
  {
    id: 'pers-3',
    text: 'An unpopular opinion you will defend until your dying breath...',
    category: 'persuasive',
    categoryLabel: 'Persuasive',
    timeToSpeak: 90,
    talkingPoints: [
      'The Bold Stance: Stating your controversial position clearly without apologetic qualifiers.',
      'The Core Evidence: The most compelling firsthand proof or logical principle in its favor.',
      'Challenging Consensus: Asking the audience to reconsider their reflexive assumptions.',
    ],
  },

  // ── STORYTELLING (Narrative Arc & Vulnerability) ──────────────────────────
  {
    id: 'story-1',
    text: 'The worst advice I ever received with the best intentions...',
    category: 'storytelling',
    categoryLabel: 'Storytelling',
    timeToSpeak: 90,
    talkingPoints: [
      'Setting the Scene: Who offered the counsel and why they genuinely believed in it.',
      'The Turning Point: The moment you followed it and watched plans collapse.',
      'The Transformation: The counter-lesson and quiet wisdom you carry forward today.',
    ],
  },
  {
    id: 'story-2',
    text: 'The moment you realized you had officially become an adult...',
    category: 'storytelling',
    categoryLabel: 'Storytelling',
    timeToSpeak: 90,
    talkingPoints: [
      'Setting the Scene: The mundane, unglamorous scenario where the realization hit you.',
      'The Climax: The sharp contrast between childhood expectations and reality.',
      'The Transformation: The quiet pride in taking full accountability for your life.',
    ],
  },
  {
    id: 'story-3',
    text: 'A time you took a calculated gamble and failed spectacularly...',
    category: 'storytelling',
    categoryLabel: 'Storytelling',
    timeToSpeak: 90,
    talkingPoints: [
      'The Stakes & Excitement: What drove you to take the plunge and the initial hype.',
      'The Crash: The exact moment reality intervened and the dust settled.',
      'The Lasting Resilience: Why you would take the leap again without hesitation.',
    ],
  },

  // ── INTERVIEW PREPARATION TRACKS ─────────────────────────────────────────
  {
    id: 'int-1',
    text: 'Should AI development be regulated globally or left to market competition?',
    category: 'cat_gdpi',
    categoryLabel: 'CAT GDPI',
    timeToSpeak: 120,
    talkingPoints: [
      'Economic & Feasibility: Balancing existential safety against the danger of falling behind in innovation.',
      'Geopolitical Realities: Why unenforced international treaties fail without aligned economic incentives.',
      'Actionable Synthesis: Proposing tiered regulation focusing on compute clusters and deployment safety.',
    ],
  },
  {
    id: 'int-2',
    text: 'Describe a significant professional failure and what you took from it.',
    category: 'hr_interview',
    categoryLabel: 'HR Interview',
    timeToSpeak: 120,
    talkingPoints: [
      'Situation & Stakes: The project context, ambitious goals, and root cause of the breakdown.',
      'Individual Accountability: The immediate steps you took to own the issue and protect the team.',
      'Lasting Transformation: The systemic process change or communication habit you instituted afterward.',
    ],
  },
  {
    id: 'int-3',
    text: 'How do you defend technical debt refactoring to commercial stakeholders?',
    category: 'software_engineering',
    categoryLabel: 'Tech Behavioral',
    timeToSpeak: 120,
    talkingPoints: [
      'Translating Risk: Framing codebase fragility into business impact: latency, downtime, and developer turnover.',
      'Incremental Strategy: Proposing an agile refactor roadmap that avoids halting new feature delivery.',
      'Quantified Velocity: Proving with metrics how the cleanup restored deployment cadence.',
    ],
  },
  {
    id: 'int-4',
    text: 'Why do you believe an MBA is essential for your long-term roadmap now?',
    category: 'mba_admissions',
    categoryLabel: 'MBA Admissions',
    timeToSpeak: 120,
    talkingPoints: [
      'The Inflection Point: The gap between your technical competence and broader executive strategy.',
      'Cohort & Curriculum Value: The specific peer network and case study environment you seek.',
      '10-Year Trajectory: How this bridge positions you to lead transformation in your target industry.',
    ],
  },
  {
    id: 'int-5',
    text: 'Walk me through your most challenging collaborative engineering project.',
    category: 'campus_placement',
    categoryLabel: 'Campus Placement',
    timeToSpeak: 120,
    talkingPoints: [
      'Project Scope & Tech Stack: The core problem you solved and your individual responsibility.',
      'Resolving Friction: Navigating differing opinions or technical bottlenecks under tight deadlines.',
      'Measurable Outcome: The demo feedback, performance benchmarks, and readiness to deliver.',
    ],
  },
  {
    id: 'int-6',
    text: 'How should the district administration balance grassroots tribal welfare with urgent infrastructure projects?',
    category: 'upsc_interview',
    categoryLabel: 'UPSC Interview',
    timeToSpeak: 120,
    talkingPoints: [
      'Constitutional Bedrock: Grounding rights in Schedule V/VI provisions and the Forest Rights Act alongside public interest.',
      'Multi-Dimensional Analysis: Assessing long-term displacement costs versus the economic connectivity of roads and dams.',
      'Pragmatic Roadmap: Instituting transparent Gram Sabha consent, dignified rehabilitation, and community benefit-sharing.',
    ],
  },
  {
    id: 'int-7',
    text: 'How do you maintain team alignment during high-stakes corporate uncertainty?',
    category: 'leadership',
    categoryLabel: 'Leadership',
    timeToSpeak: 120,
    talkingPoints: [
      'Transparent Communication: Establishing honest, transparent updates without inducing panic.',
      'Empowering Sub-goals: Giving team leads autonomous ownership over immediate deliverables.',
      'Long-Term Trust: How your steady calm and vulnerability solidified cultural loyalty.',
    ],
  },
];
