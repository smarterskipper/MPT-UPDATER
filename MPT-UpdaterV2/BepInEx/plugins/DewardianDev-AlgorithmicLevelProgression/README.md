# **DewardianDev's AlgorithmicLevelProgression**

=== INSTALL STEPS ===

1. Drag and drop this folder into the user/mods folder.
2. Update your mods/order.json so that this is last on the list.
3. Optionally change your configuration (see below configuration options).

4. ???????

5. Profit!!!!

Example order.json with recommended mods:
{
"order": [
"ServerValueModifier",
"zPOOP",
"Lua-CustomSpawnPoints",
"DewardianDev-XXXX-1.x.x",
"DewardianDev-AlgorithmicLevelProgression-1.x.x"
]
}

==== Configuration Options ====

    // Turn on and off the pmc bot adjusted equipment
    "enableProgressionChanges": true,

    // Turn on and off the pmc bot adjusted levels
    "enableLevelChanges": true,

    // PMCS will wear level appropriate clothing (IE level 34 will wear plaid)
    "leveledClothing": true,

    // These two "shift" items that would be unlocked at a certain loyalty level to a later level
    // For example if you needed to finish a quest at tier 2 traders to unlock some ammo, it would be shifted to tier 3

    "questUnlockedItemsShifted": true,

    // This is much the same as the above, this shifts traded items
    // For example if you could trade for some armor at tier 2, it would be shifted to tier 3
    // In general, turning this on can make pmcs better equiped sooner.
    "tradedItemsShifted": true,

    // Allows bots to use items from custom traders like Priscillu
    "addCustomTraderItems": false,

    // If the above item is selected, you can write the name of the trader to exclude before.
    // A note, the console will print the name of traders when addCustomTraderItems, is on.
    // Use the name in the console exactly, or the trader will not be excluded.
    "customTradersToExclude": [
        "insertTheTraderNameToIgnoreTheirItems",
        "CustomTradersNamesWillPrintToConsoleIfFoundAndaddCustomTraderItemsIsSetToTrue"
    ],

    // Add Id's of things you don't want any pmc to use.
    "customBlacklist": [
        "get id's from here https://db.sp-tarkov.com/search/",
        "5example3208of34not8f83real8a1id"
    ],

    // This dictates at what level bots obtain trader tiers.
    // 1 - 14 for example are for tier 1 traders
    // NOTE: These cannot overlap or have gaps: 1-14, 15-24, 25-39, 40-100

    "levelRange": {
        "1": {
            "min": 1,
            "max": 14
        },
        "2": {
            "min": 15,
            "max": 24
        },
        "3": {
            "min": 25,
            "max": 39
        },
        "4": {
            "min": 40,
            "max": 100
        }
    },

    // This is the ratioed weighting of bot tiers per your level.
    // For example, if you were level 5, as per above, between 1 - 14, would put you at tier "1"
    // therefor you would have a weighting of pmcs of:10,5,2,1
    // In this example, it is far more likely to have low tier 1 bots (10x) then tier 4 for example
    // THE BELOW SETTINGS ARE TO SIMULATE AN EARLY WIPE EXPERIENCE
    // AS YOU LEVEL, THE WIPE AND PLAYER DISTRIBUTION PROGRESSES

    "botRangeAtLevel": {
        "1": [
            10,
            5,
            2,
            1
        ],
        "2": [
            10,
            13,
            7,
            4
        ],
        "3": [
            8,
            10,
            11,
            4
        ],
        "4": [
            8,
            10,
            10,
            7
        ]
    },

    // This makes the tiering more strict
    // IE makes it so there is no chance a pmc will use gear beyond their level
    "strictEquipmentTiering": false,


    //This controls the chance of pmcs using higher tier ammo 0.1 > 1
    "higherTierAmmoChance": 0.3,

    // The below is how one can adjust equipment weightings for each category.
    // 0 is meta, 1 is completely random, 2 will make pmcs prioritize the worst gear.
    // Imagine a pmc can wear a usec hat, or a Ulach helmet, the weighting may look like this:
    // weight > 5, Ulach  > 150,
    // A setting of 0 below would result in a much greater chance for a pmc to choose the ulach.
    // At 0.5, the top and bottom chances are smoothed around a median, like so:
    // weight > 35, Ulach  > 100,
    // And at 1, all items within that category will have equal chances:
    // weight > 54, Ulach  > 54,

    "randomness": {
        "Holster": 0.3,
        "Headwear": 0.3,
        "FirstPrimaryWeapon": 0.4,
        "Earpiece": 0.4,
        "Backpack": 0.4,
        "Eyewear": 0.5,
        "TacticalVest": 0.4,
        "ArmorVest": 0.3,
        "FaceCover": 0.3
    },

    // Just keep this off
    "debug": false



  // This is the configuration for nonPmcBots
  "nonPmcBots": [
     {
      // Name of the bot, or bot group (see below for bot group explanation)
      "name": "assault",  

      // These are this bots tiers
      "tiers": [
        [1, 14],
        [15, 30],
        [31, 45],
        [46, 100]
      ],

      // These values add equipment to bots, this can be best explained like so. 
      // There is a "Constants" folder with lists of items, prioritized from worst > best
      // The numbers below specify how much and which portion of that list is added to a bot.
      // 0,3 > would result in the bottom 30% of that equipment type being added to that bot.
      // 0.5,1 > the same but the top 50% of that equipment type.
      // 0,1 > All of that equipment type that exists (largely) will be added to that bots spawn pool.
      "Headwear": [0, 0.3],
      "ArmorVest": [0, 0.3],
      "TacticalVest": [0, 0.3],
      "Backpack": [0, 0.3],
      "Ammo": [0, 0.5]
    },
    ]

    Bot groups are lists of bots that can have the same nonPmcBot configurations.
    If you understand JSON than the examples are quite obvious. 
    allBossFollowers is under nonPmcBots, and is comprised of a list of that type. 

    TO PREVENT WIERDNESS, ONLY ADD EACH BOTTYPE TO EITHER A GROUP OR THE "nonPMCBots" LIST, not both.
   
    EXAMPLE: 
    IF you wanted to add a custom setting for "bosssanitar", you would first remove him from the
    "allBosses" list, then add him to the "nonPmcBots" list, with his own custom config.

    Creating your own groups is easy, create a new list similar to "allBosses" but named "whatever"
    Then move the bottype names over that you want your new configuration to effect.
    When done add your "whatever" config to the "nonPmcBots" list. 

    Do not ask for help in the forums, the answers you seek 
    are above for those with the aptitude to understand them.

    If you have feedback, ping me on discord