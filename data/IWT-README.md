Interval Walking in Nature (IWT) — `iwt-01`

Overview

- id: `iwt-01`
- name: "Interval Walking in Nature (IWT)"
- categories: Movement, Mindfulness, Light
- duration: 20-40 minutes

Description

A structured outdoor interval walking protocol combining brisk walking bursts with slow, mindful recovery while maintaining nasal breathing. Optimized for morning sunlight exposure to anchor circadian rhythm and boost mood.

Where it appears in the app

- Explore -> Protocols (search for "Interval Walking" or filter by Movement/Mindfulness/Light)
- Community Stacks (the sample stack `stack-iwt-01` is included in `data/communityStacks.ts` and references `iwt-01`)
- Users can add it to their stack from protocol details or when browsing stacks. Once added, it will show in `My Stack` and may be scheduled by Kai.

Usage notes

- Recommended: perform in morning sunlight when safe and practical.
- Nasal breathing is a key instruction: if breathing becomes difficult, ease the pace until nasal breathing is comfortable.
- Typical structure: 5 min warmup, 6-10 cycles of 60-90s brisk / 90-120s slow mindful recovery, 5 min cool-down.

Developer notes

- Protocol definition lives in `data/protocols.ts` (id: `iwt-01`).
- Community stack mock in `data/communityStacks.ts` (id: `stack-iwt-01`) references `iwt-01` along with `21` (Morning Sunlight) and `7` (Grounding).
