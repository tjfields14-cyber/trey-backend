---
# REQUIRED FIELDS (CORE IDENTITY)
type: character                    # always "character"
id: CHARACTER_ID                   # ALL_CAPS_UNDERSCORE, unique
name:
  first: Firstname
  last: Lastname
display_name: Firstname Lastname

aliases: []                        # e.g. ["Val", "The Split One"]

role: supporting                   # protagonist | antagonist | supporting | cameo
status: alive                      # alive | dead | missing | unknown

age: null                          # number or null if unknown
gender: unknown                    # female | male | nonbinary | etc.
pronouns: they/them              

species: Human                     # e.g. Human | Shapeshifter | Nephilim | etc.
subtype: null                      # optional sub-classification
home_realm: Earth Realm            # e.g. Earth Realm | Fracture | Bordertown
current_location: null             # e.g. "Indianapolis, IN"

# FACTIONS & TAGS
faction: null                      # primary group, if any
affiliations: []                   # list of { group, role }
# example:
# affiliations:
#   - group: Fringe Shifters
#     role: unaligned asset

archetype: null                    # e.g. "Reluctant Hero", "Trickster", etc.
alignment: neutral                 # or your custom system: "Chaotic Good", etc.

tags: []                           # free-form labels: ["main_cast", "dual_soul"]

# RELATIONSHIPS (CROSS-LINKED BY id)
relationships: []
# example:
# relationships:
#   - target_id: KADAIR
#     label: husband
#     status: separated
#   - target_id: VALENTINE_RAYFIELD
#     label: wife
#     status: estranged

# POWER / STATS (CUSTOMIZABLE)
power_level: null                  # numeric (1–10 or whatever)
combat_style: null                 # short string, e.g. "close-quarters, blades"
magic_type: null                   # e.g. "Essence-based", "Shadow", etc.

# CONTINUITY / APPEARANCES
first_appearance: null             # e.g. BOOK1_CH1, or scene ID
last_known_appearance: null

created_at: 2025-12-10             # ISO date string
updated_at: 2025-12-10             # update when you edit
---

# [Character Name Here]

## Logline
(A one-sentence hook for who they are and what their core problem is.)

## Physical Description
- Height:
- Build:
- Hair:
- Eyes:
- Distinguishing marks / features:
- Usual clothing / vibe:

## Personality
- Core traits:
- Flaws:
- Fears:
- Secret desires:
- Baseline emotional climate (how they *feel* most days):

## Backstory
(Their key history, in prose. Childhood, turning points, trauma, victories.)

## Abilities
- Primary abilities:
- Secondary abilities:
- Limitations / weaknesses:
- Triggers (when powers go wrong or spike):

## Key Events
1. [Age / Time] — [Event]
2. [Age / Time] — [Event]
3. ...

## Relationships (Narrative Notes)
(Details/nuance that go beyond the simple YAML relationships above.)

## Arc Notes
- Starting point:
- Midpoint transformation:
- Ending point:
- Open questions for future books:

## Notes for Trey
(Anything you want the widget/engine to prioritize or “remember” about this character.)
