export interface Topic {
  id: string;
  text: string;
  category: 'icebreaker' | 'what-if' | 'deep' | 'story' | 'creative' | string;
  categoryLabel: string;
  timeToSpeak?: number; // default 90 seconds
  talkingPoints: [string, string, string] | string[]; // 3 points to talk about
}

export type DispenserStatus = 'idle' | 'retracting' | 'dispensing' | 'ready' | 'torn';
