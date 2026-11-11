/* All the words, images and colours of the site. Edit with editor.html, or by hand. */
window.CONTENT = {
  "site": {
    "name": "Hemesh Kanth",
    "role": "Creative technologist",
    "roles": [
      "affective computing",
      "human–AI relationships",
      "social robotics",
      "product & interaction design"
    ],
    "place": "Gandhinagar / Chennai",
    "email": "hemesh_k@nid.edu",
    "linkedin": "https://www.linkedin.com/in/hemesh-kanth-920a9a251",
    "github": "https://github.com/hemeshkanth",
    "font": "archivo",
    "tagline": "Exploring the human side of AI and emotions.",
    "subline": "affective computing · creative technology · new media design, NID",
    "readFont": "IBM Plex Mono",
    "imgFilter": "film",
    "musicDefault": "on",
    "defaultTime": "auto"
  },
  "home": {
    "myth": "They say a goldfish forgets everything in three seconds.",
    "truth": "It isn’t true. Goldfish remember for months. We just stopped watching long enough to notice.",
    "intro": "I design how people live with things that are not people: robots, AI agents, objects that answer back. I’m interested in the moment someone starts to feel something for a machine, and what we owe them when they do.",
    "bowl": "I grew up looking at the world through a window grill in Chennai. A bowl shows you the world and keeps you from it at the same time. I learned to design by pressing against glass. Now I study New Media Design at the National Institute of Design.",
    "keenTitle": "What I keep coming back to",
    "keen": [
      {
        "h": "We read minds into anything that moves",
        "p": "Two triangles on a screen are enough. In 1944 Heider and Simmel showed people a short film of shapes and almost everyone described a story: a bully, a chase, a rescue."
      },
      {
        "h": "Machines are social whether we design them to be or not",
        "p": "People are polite to computers, name their robot vacuums and feel guilty switching them off. The question is not if people relate to AI, but how we shape that relationship."
      },
      {
        "h": "Feelings need their own words",
        "p": "Most emotion models are built on English words. A worried mother in Chennai says kavalai, and means something wider than anxious. Affect is cultural before it is computational."
      },
      {
        "h": "Care is a design material",
        "p": "Attention, pace, distance, silence. Small choices decide whether a machine feels like a tool, a pet, a judge or a friend."
      }
    ],
    "quotes": [
      {
        "q": "Individuals’ interactions with computers, television, and new media are fundamentally social and natural, just like interactions in real life.",
        "a": "Byron Reeves & Clifford Nass",
        "s": "The Media Equation, 1996"
      },
      {
        "q": "We expect more from technology and less from each other.",
        "a": "Sherry Turkle",
        "s": "Alone Together, 2011"
      },
      {
        "q": "If we want computers to be genuinely intelligent and to interact naturally with us, we must give computers the ability to recognize, understand, even to have and express emotions.",
        "a": "Rosalind Picard",
        "s": "Affective Computing, 1997"
      },
      {
        "q": "We are all chimeras, theorized and fabricated hybrids of machine and organism; in short, we are cyborgs.",
        "a": "Donna Haraway",
        "s": "A Cyborg Manifesto, 1985"
      }
    ],
    "surface": "Every interface is a bowl, and someone lives inside it. I want to design the glass: robots and AI that notice how people move and feel, and change how they behave because of it.",
    "return": "I’m looking for innovation labs and teams building robots, devices and AI for real people.",
    "deepBowl": "Before design school I studied animation and made posters and identities for film people. Timing, staging and the small gesture that tells you everything: I still use those every day, only now the actors are robots.",
    "deepWork": "Each project here started as a question about a relationship: between a visitor and a flock, a parent and a child, a fisher and the news, an old institution and a young country.",
    "deepSurface": "I don’t think machines need to have feelings for this to matter. People will feel things around them anyway. The design question is whether those feelings are respected or exploited.",
    "reefTitle": "Small things, watched closely",
    "reef": [
      {
        "t": "Water on a wire",
        "k": "WS2812B · FastLED",
        "p": "A droplet falling through a one-pixel-tall world, steered by a hand in front of a laptop camera."
      },
      {
        "t": "Two faces, sixteen by eight",
        "k": "ESP32 · NeoPixel matrix",
        "p": "A smile and a grin in 128 pixels, now being tested as heads for the flock."
      },
      {
        "t": "Sim to real",
        "k": "Reinforcement learning",
        "p": "A navigation policy trained only in simulation, then asked to drive a cheap two-wheel robot in a real room."
      },
      {
        "t": "Sideways is a direction",
        "k": "Mecanum robot",
        "p": "Four omni wheels on one ESP32. It moves anywhere without turning."
      },
      {
        "t": "The robot that changes its mind",
        "k": "Line follower",
        "p": "Follows the black line until a trigger tells it to take the brown one."
      },
      {
        "t": "One hundred robots",
        "k": "Aluminium · fabrication",
        "p": "Cheap, light and many. My first time working with aluminium."
      }
    ],
    "about": {
      "lead": "I am a creative technologist and designer. I build robots, interactive objects and stories about how people and machines learn to live together.",
      "sections": [
        {
          "h": "What I do",
          "p": "I design the relationship between people and the non-human things around them: robots that react, AI agents that talk back, objects that remember. My work sits between affective computing, interaction design and making things by hand."
        },
        {
          "h": "How I work",
          "p": "I am comfortable with ambiguity. I start from a question, not a tool, and the tools follow what the project needs. I sketch, build rough prototypes, wire the electronics, write the code and put it in front of people early."
        },
        {
          "h": "What I care about",
          "p": "Affective empathy: how people come to feel something for a machine, and what designers owe them when they do. I want technology to feel warm, honest and rooted in the place it lives, especially in Indian homes and streets."
        },
        {
          "h": "Making",
          "p": "Fabrication is part of how I think: laser cutting, 3D printing, CNC, metal and wood, casting. Electronics with ESP32 and Arduino, motors, sensors and lots of LEDs."
        }
      ],
      "keenTitle": "What I believe",
      "tools": "Figma · Blender · Unity · TouchDesigner · p5.js · Processing · Python · PyTorch · OpenCV · JavaScript · ESP32 / Arduino",
      "languages": "English · Tamil · Hindi · some Malayalam and Telugu"
    }
  },
  "projects": [
    {
      "id": "flock",
      "title": "The Flock Remembers",
      "kind": "Installation · social robotics",
      "year": "2026",
      "status": "in progress",
      "line": "A flock of small rovers that reads how fast you walk, and answers with a face.",
      "cover": {
        "src": "",
        "cap": "The first rovers, laser-cut black acrylic"
      },
      "facts": [
        [
          "Type",
          "Interactive installation"
        ],
        [
          "Rovers",
          "10 being built, 16 planned"
        ],
        [
          "Senses",
          "Ceiling camera, IR LED on each rover"
        ],
        [
          "Talks",
          "ESP-NOW radio, one base station"
        ],
        [
          "Body",
          "Octagonal acrylic shell, servo-turned head"
        ],
        [
          "Role",
          "Concept, electronics, code, fabrication"
        ]
      ],
      "blocks": [
        {
          "t": "text",
          "h": "The question",
          "p": "Machines are learning us all the time: our clicks, our faces, our pace. This piece asks what it feels like to be learned by a group of machines, and whether we start learning them back.",
          "d": "I started with a simple observation: on social media, every like is a tiny reward and every silence a tiny punishment. I wanted to make that loop physical, slow and visible, so people could feel it with their whole body."
        },
        {
          "t": "image",
          "src": "",
          "cap": "Two faces: a smile and a grim look"
        },
        {
          "t": "text",
          "h": "Speed is the only language",
          "p": "Each rover carries a head with two faces. A camera above tracks visitors. Walk fast and the nearest rovers turn grim and move away. Walk slowly and they turn to smile and gather. Nobody explains the rule. After a few minutes, most people slow down on their own.",
          "d": "Speed is the one signal everyone gives off without choosing to. It’s honest. It also maps to how animals read each other: sudden movement is a threat, slow movement is an invitation."
        },
        {
          "t": "demo",
          "h": "Try it",
          "p": "Move your cursor through the flock. Fast feels different from slow."
        },
        {
          "t": "text",
          "h": "Conditioning, in both directions",
          "p": "Reward and punishment, smile and frown. It is the simplest kind of social feedback, and it works on people almost immediately. That is the uncomfortable part: the machines are not intelligent, yet the room changes how everyone moves.",
          "d": "In early tests with three rovers, people who arrived fast left fast. People who arrived slowly stayed, crouched down and started talking to the rovers. Nobody had told them anything."
        },
        {
          "t": "gallery",
          "items": [
            {
              "src": "",
              "cap": "Octagon base plate, Illustrator"
            },
            {
              "src": "",
              "cap": "Laser cutting the shells"
            },
            {
              "src": "",
              "cap": "ESP32, motor driver, battery"
            }
          ]
        },
        {
          "t": "text",
          "h": "How it works",
          "p": "Every rover runs on an ESP32 with two DC motors, a motor driver and a battery. An IR LED on top lets the ceiling camera find each rover; OpenCV tracks rovers and visitors in the same frame. A laptop decides each rover’s move and face, and sends it over ESP-NOW through one base ESP32, because a normal Wi-Fi router stops at about ten devices.",
          "d": "Tracking runs at about 30 frames a second. Each rover gets a new target and face about ten times a second over ESP-NOW, which has no router in the middle and stays fast with many devices."
        },
        {
          "t": "text",
          "h": "Two rooms",
          "p": "The first version is a grid: a 5 × 5 flock on a 7 × 7 floor. The second is a loop modelled on my college corridor, where rovers roam in small lines and people pass them every day. I am also testing heads made of LED matrices that show words instead of faces.",
          "d": "The corridor matters because people don’t visit it, they live with it. The question changes from ‘how do I react to a robot’ to ‘what happens when robots become part of my routine’."
        },
        {
          "t": "image",
          "src": "",
          "cap": "Corridor loop, first test"
        },
        {
          "t": "text",
          "h": "What I’m still working out",
          "p": "[Add after testing: what visitors did, what surprised you, what broke, what you would change.]"
        }
      ]
    },
    {
      "media": {
        "type": "deck",
        "label": "the project deck",
        "pages": 30,
        "src": "media/ruhi/s{n}.jpg",
        "pad": 2,
        "ratio": "16/9"
      },
      "id": "ruhi",
      "title": "Ruh-i",
      "kind": "Affective companion · voice",
      "year": "2026",
      "status": "tested with families",
      "line": "A blanket with a voice inside, for Indian parents coming to terms with a grown child’s coming out.",
      "cover": {
        "src": "",
        "cap": "A parent wrapped in the blanket, listening"
      },
      "facts": [
        [
          "Type",
          "Story-based companion"
        ],
        [
          "Research",
          "2 parents, 8 queer individuals, 24 sessions"
        ],
        [
          "Tested",
          "2 families, 10 classmates"
        ],
        [
          "Languages",
          "English, Tamil, Hindi, Malayalam, Telugu"
        ],
        [
          "Course",
          "Problem Solving, NID · Jan–Apr 2026"
        ],
        [
          "Role",
          "Research, conversation design, build"
        ]
      ],
      "blocks": [
        {
          "t": "text",
          "h": "Why this",
          "p": "I wanted to design for people in India whose social group isn’t privileged enough to be heard. Then the conversations made it personal.",
          "d": "It began as a technical problem: can AI bring parents and their grown children to common ground? I looked at it through filter bubbles. Parents and children now live at two extremes, each validated every day by its own feed."
        },
        {
          "t": "list",
          "h": "What happens inside a family after coming out",
          "items": [
            [
              "Two realities",
              "Parents and children live in separate worlds, each validated by its own information."
            ],
            [
              "Category collapse",
              "“My child” no longer fits the picture the parent grew up with."
            ],
            [
              "Cognitive dissonance",
              "Love for the child and inherited beliefs pull in opposite directions."
            ],
            [
              "Emotional overload",
              "Too much to feel at once, so the family settles into “don’t ask, don’t tell”."
            ],
            [
              "A lonely process",
              "Parents have no one to talk to, and no other family to learn from."
            ]
          ]
        },
        {
          "t": "quote",
          "q": "The problem is not a lack of information. It is a lack of readiness to receive it, in emotionally safe conditions."
        },
        {
          "t": "list",
          "h": "Five loops",
          "items": [
            [
              "P2 · Queer facts",
              "Facts read as an argument, so parents argued back."
            ],
            [
              "P3 · Only story",
              "A story lands only when it feels like your own family."
            ],
            [
              "P4 · Affective bot",
              "Reading emotion felt heavy and clinical."
            ],
            [
              "P5 · Ruh-i",
              "Wrapped in a blanket, people kept listening."
            ]
          ]
        },
        {
          "t": "image",
          "src": "",
          "cap": "Testing in winter, with and without a blanket"
        },
        {
          "t": "text",
          "h": "Warmth made people stay",
          "p": "It was winter. During testing I gave some participants a blanket while they listened. With a blanket they kept listening. Without, they grew uneasy and switched off. The warmth asks nothing of the parent, yet it decides whether they keep listening.",
          "d": "So I replaced complex emotion detection with narrative matching: find a real family’s story that fits this feeling, and tell it gently. Grounded in narrative medicine (Charon) and transportation theory (Green & Brock): immersion in a story lowers defensive reasoning."
        },
        {
          "t": "list",
          "h": "From a feeling to the right story",
          "items": [
            [
              "Speaks",
              "The parent wraps the blanket and talks, in their own language."
            ],
            [
              "Senses",
              "It hears the feeling in Indian terms: honour, duty, “log kya kahenge”."
            ],
            [
              "Matches",
              "It finds a real family’s story that fits this feeling and this moment."
            ],
            [
              "Tells",
              "It shares it gently. No advice, no fixing, no pushing."
            ],
            [
              "Waits",
              "It asks what they feel now, and listens."
            ]
          ]
        },
        {
          "t": "text",
          "h": "What it will never do",
          "p": "Advise or fix. Push a parent who isn’t ready. Keep what is said. Ignore a crisis: if distress comes up it stops and shares Tele-MANAS, 14416. Use a story without consent. Replace the real conversation with their child."
        },
        {
          "t": "text",
          "h": "What happened",
          "p": "Tested with two target families, introduced by their adult children, and ten classmates. It felt therapeutic, not pushy. Curated stories felt safer than a feed. The parents were already open; Ruh-i gave them a gentle place to go further.",
          "d": "Still open: how parents find it (an adult child gifting the blanket, or parent communities), a washable textile with the electronics woven in, and whether this can help any hard conversation between generations."
        },
        {
          "t": "gallery",
          "items": [
            {
              "src": "",
              "cap": "Research wall"
            },
            {
              "src": "",
              "cap": "The blanket"
            },
            {
              "src": "",
              "cap": "A conversation"
            }
          ]
        }
      ]
    },
    {
      "media": {
        "type": "game",
        "label": "play it here",
        "src": "ennore/index.html"
      },
      "id": "ennore",
      "title": "Average Ennorian",
      "kind": "Playable news story",
      "year": "2023–26",
      "status": "playable",
      "line": "After the Ennore oil spill, fishers were paid to scoop oil by the bucket. You do the same, and every bucket brings up one real news story.",
      "cover": {
        "src": "",
        "cap": "Scooping oil, bucket by bucket"
      },
      "link": {
        "label": "open the game full screen",
        "url": "ennore/index.html"
      },
      "facts": [
        [
          "Type",
          "Playable news story"
        ],
        [
          "Place",
          "Ennore, Chennai"
        ],
        [
          "Made",
          "Illustration, animation, interaction"
        ],
        [
          "Runs",
          "Any phone browser, no install"
        ],
        [
          "Role",
          "Everything"
        ]
      ],
      "blocks": [
        {
          "t": "text",
          "h": "What happened",
          "p": "After Cyclone Michaung in December 2023, floodwater carried oil from a refinery into Ennore creek. Fishing stopped for weeks. About a hundred boats of fishers were hired to clean it, scooping oil into drums with mugs and buckets, often with bare hands, for about ₹750 a day.",
          "d": "Three weeks later, ammonia leaked from a fertiliser plant nearby. Fishers say their catch had already fallen by about 70% over ten years."
        },
        {
          "t": "image",
          "src": "",
          "cap": "The game, start screen"
        },
        {
          "t": "text",
          "h": "Why a game",
          "p": "News about Ennore reads like statistics. A game asks your hands to do the work, tap after tap, until the number seven means something. Each bucket you fill brings up one real headline.",
          "d": "The idea comes from Carlo Zanni’s Average Shoveler (2004), where you shovel snow while the day’s news falls around you. Here the snow is oil, and the news is about that oil."
        },
        {
          "t": "text",
          "h": "From projection to phone",
          "p": "It started as a projection piece for my entrance exam. I rebuilt it to run in any phone browser, so a newspaper could print a QR code beside a story and let readers play it."
        },
        {
          "t": "gallery",
          "items": [
            {
              "src": "",
              "cap": "Frames of the fisher"
            },
            {
              "src": "",
              "cap": "Inside a bucket"
            },
            {
              "src": "",
              "cap": "End card"
            }
          ]
        }
      ]
    },
    {
      "media": {
        "type": "pdf",
        "label": "the full report (PDF)",
        "pages": 31,
        "src": "media/kottakkal/p-{n}.jpg",
        "pad": 2,
        "ratio": "auto"
      },
      "id": "kottakkal",
      "title": "Kottakkal Arya Vaidya Sala",
      "kind": "Design management · brand strategy",
      "year": "2026",
      "status": "strategy",
      "line": "A 120-year-old Ayurveda institution, trusted when health fails. A strategy to make it chosen while health is still managed.",
      "cover": {
        "src": "",
        "cap": "Everyday Kottakkal"
      },
      "facts": [
        [
          "Type",
          "Strategic marketing plan"
        ],
        [
          "Team",
          "Group 1, led by me"
        ],
        [
          "Course",
          "Design Management, NID"
        ],
        [
          "Frameworks",
          "5C, STP, BCG, 4P, Ansoff"
        ]
      ],
      "blocks": [
        {
          "t": "quote",
          "q": "AVS loses mindshare, not credibility."
        },
        {
          "t": "text",
          "h": "The problem",
          "p": "Kottakkal Arya Vaidya Sala is the most trusted name in Ayurveda, founded in 1902, with 500+ classical formulations. But it is linked to illness and hospitals: serious packs, clinical language. It enters people’s lives only after they get sick, while competitors reach them while they are healthy.",
          "d": "High respect, low everyday recall. Few younger wellness users adopt it. The trust is already earned; the problem is timing and access."
        },
        {
          "t": "text",
          "h": "Everyone else owns access",
          "p": "FMCG and new D2C brands win on simple messages, modern packs and visibility. AVS wins on authenticity and clinical depth. No brand combines clinical credibility with everyday ease. That corner is where AVS should go."
        },
        {
          "t": "text",
          "h": "Segment by intent, not age",
          "p": "We split people by health intent and trust. AVS strongly attracts authority seekers, but loses convenience seekers at the entry stage, the very group driving growth. So we change who leads, not who we serve: urban professionals focused on prevention become the primary audience, and the chronic-care families become the proof."
        },
        {
          "t": "quote",
          "q": "Everyday Kottakkal. Trusted when it matters. Made for every day."
        },
        {
          "t": "list",
          "h": "One masterbrand, three lines",
          "items": [
            [
              "Kottakkal Classical",
              "500+ classical medicines, prescribed and hospital-linked. Protect."
            ],
            [
              "Everyday Kottakkal",
              "Starter kits and daily routines, with a need-first label. Grow."
            ],
            [
              "Kottakkal Care",
              "Hospitals, Panchakarma and tele-consults, with doctors as the face. Prove."
            ]
          ]
        },
        {
          "t": "text",
          "h": "Same formula, easier to understand",
          "p": "No change to any formulation. Packs get a clear order: need, product, how to use. Trial sizes lower the commitment, and every starter kit comes with a free vaidya consultation. The tone moves from prescribing to guiding: “Not sure where to start? Scan and talk to our vaidya. It’s free.”"
        },
        {
          "t": "gallery",
          "items": [
            {
              "src": "",
              "cap": "Perceptual map"
            },
            {
              "src": "",
              "cap": "Identity system"
            },
            {
              "src": "",
              "cap": "Before and after packs"
            }
          ]
        }
      ]
    },
    {
      "id": "museum",
      "title": "Rooms That Remember",
      "kind": "Exhibition & experience design",
      "year": "2026",
      "status": "ongoing",
      "line": "A new media installation proposal for the Prime Ministers’ Museum, New Delhi, made in a small team.",
      "cover": {
        "src": "",
        "cap": ""
      },
      "facts": [
        [
          "Type",
          "Installation proposal"
        ],
        [
          "Team",
          "Small NID proposal team"
        ],
        [
          "Status",
          "Presented, revised, ongoing"
        ]
      ],
      "blocks": [
        {
          "t": "text",
          "h": "The idea",
          "p": "Archives are full of things people walk past. We wanted visitors to discover stories with their bodies, not read them off a wall.",
          "d": "[Add: your role, the concept, the spatial layout, what the panel asked you to change.]"
        },
        {
          "t": "image",
          "src": "",
          "cap": "Proposal drawing"
        }
      ]
    }
  ],
  "captions": [
    "One day, the bowl felt small.",
    "So I jumped, and grew legs on the way down.",
    "Outside: a city, a road, and work to do.",
    "I explore the human side of AI and emotions.",
    "Robots, agents, objects that answer back.",
    "Then a car pulled up. Legs out, hands in.",
    "Faster.",
    "Every project is a road to the same question:",
    "what happens when people feel something for a machine?",
    "The road ran into the sea.",
    "So I walked.",
    "Then I caught a wave.",
    "And jumped again.",
    "In the ocean, I play. Small experiments, watched closely.",
    "Deeper.",
    "Then I looked up.",
    "And kept going.",
    "The ocean was never the edge. It was the world.",
    "Every interface is a bowl, and someone lives inside it."
  ],
  "themes": {},
  "ui": {
    "nav": {
      "work": "work",
      "exploration": "exploration",
      "about": "about",
      "contact": "contact"
    },
    "hint": "scroll ↓",
    "openCase": "open case study",
    "game": "play the game",
    "deck": "view the deck",
    "report": "read the report",
    "email": "copy email",
    "copied": "copied ✓",
    "aboutTitle": "about",
    "contactTitle": "Send a signal",
    "exploreTitle": "exploration"
  }
};
