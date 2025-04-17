// Game Data

// Survivor Database
const survivorDatabase = {
    survivors: [
        {
            name: "Alex",
            description: "A former athlete who excels in physical challenges.",
            physicalStat: 85,
            mentalStat: 60,
            personalityStat: 70,
            isPlayer: false
        },
        {
            name: "Jordan",
            description: "A strategic thinker with a quick wit.",
            physicalStat: 65,
            mentalStat: 90,
            personalityStat: 75,
            isPlayer: false
        },
        {
            name: "Morgan",
            description: "A social butterfly who forms strong alliances.",
            physicalStat: 60,
            mentalStat: 70,
            personalityStat: 90,
            isPlayer: false
        },
        {
            name: "Casey",
            description: "A wilderness expert with survival skills.",
            physicalStat: 80,
            mentalStat: 75,
            personalityStat: 65,
            isPlayer: false
        },
        {
            name: "Taylor",
            description: "A cunning player who plays behind the scenes.",
            physicalStat: 70,
            mentalStat: 85,
            personalityStat: 65,
            isPlayer: false
        },
        {
            name: "Riley",
            description: "A tough competitor with a strong work ethic.",
            physicalStat: 75,
            mentalStat: 65,
            personalityStat: 80,
            isPlayer: false
        },
        {
            name: "Avery",
            description: "A brilliant puzzle solver with a quiet demeanor.",
            physicalStat: 55,
            mentalStat: 95,
            personalityStat: 60,
            isPlayer: false
        },
        {
            name: "Cameron",
            description: "A charming diplomat who mediates conflicts.",
            physicalStat: 65,
            mentalStat: 75,
            personalityStat: 85,
            isPlayer: false
        },
        {
            name: "Jamie",
            description: "An endurance specialist with a never-give-up attitude.",
            physicalStat: 90,
            mentalStat: 60,
            personalityStat: 70,
            isPlayer: false
        },
        {
            name: "Quinn",
            description: "A balanced player with a keen awareness of the game.",
            physicalStat: 75,
            mentalStat: 75,
            personalityStat: 75,
            isPlayer: false
        },
        {
            name: "Skyler",
            description: "A resourceful competitor who adapts to any situation.",
            physicalStat: 70,
            mentalStat: 80,
            personalityStat: 75,
            isPlayer: false
        },
        {
            name: "Blake",
            description: "A competitive powerhouse with a bold personality.",
            physicalStat: 85,
            mentalStat: 65,
            personalityStat: 70,
            isPlayer: false
        }
    ]
};

// Tribe Colors
const tribeColors = [
    "#e74c3c", // Red
    "#3498db", // Blue
    "#f1c40f", // Yellow
    "#2ecc71", // Green
    "#9b59b6", // Purple
    "#e67e22"  // Orange
];

// Tribe Names
const tribeNames = [
    "Moto", 
    "Tagi", 
    "Fang", 
    "Kota", 
    "Ravu", 
    "Dabu"
];

// Challenge Database
const challengeDatabase = [
    {
        title: "Obstacle Course",
        description: "Navigate a challenging obstacle course to earn immunity.",
        type: "tribe",
        primaryStat: "physical",
        difficulty: 1
    },
    {
        title: "Memory Challenge",
        description: "Memorize a sequence of symbols and recreate it.",
        type: "tribe",
        primaryStat: "mental",
        difficulty: 1
    },
    {
        title: "Blindfolded Maze",
        description: "Work as a tribe to guide your blindfolded members through a maze.",
        type: "tribe",
        primaryStat: "personality",
        difficulty: 1.2
    },
    {
        title: "Endurance Challenge",
        description: "Hold your position longer than anyone else to win immunity.",
        type: "individual",
        primaryStat: "physical",
        difficulty: 1
    },
    {
        title: "Puzzle Race",
        description: "Solve a series of increasingly difficult puzzles faster than your opponents.",
        type: "individual",
        primaryStat: "mental",
        difficulty: 1
    },
    {
        title: "Auction Challenge",
        description: "Bid on advantages and food items in the Survivor auction.",
        type: "individual",
        primaryStat: "personality",
        difficulty: 0.8
    },
    {
        title: "Water Carry",
        description: "Transport water across a series of obstacles without spilling.",
        type: "tribe",
        primaryStat: "physical",
        difficulty: 1.1
    },
    {
        title: "Balance Beam",
        description: "Balance on a narrow beam longer than your opponents.",
        type: "individual",
        primaryStat: "physical",
        difficulty: 0.9
    },
    {
        title: "Tribal Knowledge",
        description: "Answer questions about the island and your fellow survivors.",
        type: "individual",
        primaryStat: "mental",
        difficulty: 0.9
    },
    {
        title: "Social Challenge",
        description: "Win votes from eliminated players by answering questions about them.",
        type: "individual",
        primaryStat: "personality",
        difficulty: 1.2
    }
];

// Camp Locations
const campLocations = [
    {
        name: "Beach",
        description: "The sandy shore around your camp where you can collect water and fish.",
        actions: [
            {
                name: "Collect Water",
                description: "Gather water for your tribe.",
                type: "collectWater",
                energyCost: 1
            },
            {
                name: "Fish",
                description: "Try to catch fish for food.",
                type: "findFood",
                energyCost: 1
            },
            {
                name: "Social Time",
                description: "Spend time socializing with your tribe mates.",
                type: "socialize",
                energyCost: 1
            }
        ]
    },
    {
        name: "Jungle",
        description: "The dense forest surrounding your camp where resources and hidden idols can be found.",
        actions: [
            {
                name: "Gather Firewood",
                description: "Collect firewood to keep your camp fire going.",
                type: "gatherFirewood",
                energyCost: 1
            },
            {
                name: "Forage for Food",
                description: "Search for fruits, plants, and small animals to eat.",
                type: "findFood",
                energyCost: 1
            },
            {
                name: "Look for Idol",
                description: "Search for a hidden immunity idol.",
                type: "searchForIdol",
                energyCost: 2
            }
        ]
    },
    {
        name: "Camp",
        description: "Your tribe's main living area with shelter and fire.",
        actions: [
            {
                name: "Rest",
                description: "Recover some energy by resting.",
                type: "rest",
                energyCost: 0
            },
            {
                name: "Maintain Fire",
                description: "Work on keeping the fire strong.",
                type: "gatherFirewood",
                energyCost: 1
            },
            {
                name: "Strategy Talk",
                description: "Discuss game strategy with tribe mates.",
                type: "strategic",
                energyCost: 1
            }
        ]
    },
    {
        name: "Private Area",
        description: "A secluded spot away from camp where you can think or have private conversations.",
        actions: [
            {
                name: "Strategic Planning",
                description: "Plan your moves in the game.",
                type: "strategic",
                energyCost: 1
            },
            {
                name: "Physical Training",
                description: "Work on your physical abilities for challenges.",
                type: "trainPhysical",
                energyCost: 1
            },
            {
                name: "Mental Exercises",
                description: "Practice puzzles and mental challenges.",
                type: "trainMental",
                energyCost: 1
            }
        ]
    }
];