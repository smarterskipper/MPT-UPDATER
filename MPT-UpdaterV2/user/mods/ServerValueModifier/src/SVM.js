"use strict";

class MainSVM
{
	preAkiLoad(container)
	{

		const Logger = container.resolve("WinstonLogger");
		try { //Checking for loader.json, if doesn't exist - throw a message, disable the mod.
			const PresetLoader = require('../Loader/loader.json');
			if( PresetLoader.CurrentlySelectedPreset == null  || PresetLoader.CurrentlySelectedPreset == "null")
				{
					Logger.warning("SVM: Null Preset detected, SVM is disabled, Most likely you're running this mod for the first time, head to the SVM mod folder and run the Greed.exe");
					return
				}
			const Config = require('../Presets/' + PresetLoader.CurrentlySelectedPreset + '.json');
		}
		catch (e)
		{	
				const Logger = container.resolve("WinstonLogger");
				Logger.warning("\nSVM: SVM is lacking loader file or there is an error, mod is disabled");
				Logger.warning("Most likely you're running this mod for the first time, head to the SVM mod folder and run the Greed.exe")
				Logger.warning("Don't forget to apply your changes...Really, hit that Apply button, it will create loader file\n")
				Logger.warning("SVM: If it's Syntax error, edit it manually in loader.json or/and edit values with UIs properly");
				Logger.warning("Exception message below may help you distinguish what went wrong:\n");
				Logger.error(e.message+"\n");
				return
		}
		
		const PresetLoader = require('../Loader/loader.json');
		const Config = require('../Presets/' + PresetLoader.CurrentlySelectedPreset + '.json');
		const StaticRouterModService = container.resolve("StaticRouterModService");
		const HttpResponse = container.resolve("HttpResponseUtil");
		const repeatableQuestController = container.resolve("RepeatableQuestController");
		//PRE LOAD - QUESTS SECTION
		if (Config.Quests.EnableQuests && Config.Quests.EnableQuestsMisc)//Horrible, as usual
			{
			container.afterResolution("QuestCallbacks", (_t, result) => 
			{
				result.activityPeriods = (url, info, sessionID) => 
				{			
					let Edited = repeatableQuestController.getClientRepeatableQuests(info, sessionID);
					for (let quests in Edited)
						{	
							for(let act in Edited[quests].activeQuests )
								{
								if(Edited[quests].activeQuests[act].changeCost[0].count !== undefined)
									{
										Edited[quests].activeQuests[act].changeCost[0].count = 5000 * Config.Quests.QuestCostMult;
									}
								if(Config.Quests.QuestRepToZero)
									{
										Edited[quests].activeQuests[act].changeStandingCost = 0;
									}
								}
								for(let inact in Edited[quests].inactiveQuests )
								{
								if(Edited[quests].inactiveQuests[inact].changeCost[0].count !== undefined)
									{
										Edited[quests].inactiveQuests[inact].changeCost[0].count = 5000 * Config.Quests.QuestCostMult;
									}
								if(Config.Quests.QuestRepToZero)
									{
										Edited[quests].inactiveQuests[inact].changeStandingCost = 0;
									}
									}
								for(let req in Edited[quests].changeRequirement)
									{
										Edited[quests].changeRequirement[req].changeCost[0].count = 5000 * Config.Quests.QuestCostMult;
									if(Config.Quests.QuestRepToZero)
										{
											Edited[quests].changeRequirement[req].changeStandingCost = 0;
										}
									}
							}
						return HttpResponse.getBody(Edited);
					}
				},{frequency: "Always"});

				container.afterResolution("QuestCallbacks", (_t, result) => 
					{
						result.changeRepeatableQuest = (pmcData, body, sessionID) => 
						{					
							//const repeatableQuestController = container.resolve("RepeatableQuestController");
							let Edited = repeatableQuestController.changeRepeatableQuest(pmcData, body, sessionID);
							for (let quests in Edited.profileChanges)
								{
									for (let test in Edited.profileChanges[quests].repeatableQuests[0].changeRequirement)
									{
										Edited.profileChanges[quests].repeatableQuests[0].changeRequirement[test].changeCost[0].count = 5000 * Config.Quests.QuestCostMult;
										if(Config.Quests.QuestRepToZero)
										{
											Edited.profileChanges[quests].repeatableQuests[0].changeRequirement[test].changeStandingCost = 0;
										}
									}
								}
							return Edited;
						}
					},{frequency: "Always"});
			}
		//PRE LOAD - RAIDS SECTION
		if (Config.Hideout.EnableHideout)
			{
				if(Config.Hideout.Regeneration.OfflineRegen)
				{
			container.afterResolution("GameController", (_t, result) => 
				{
					result.updateProfileHealthValues = (url, info, sessionID) => 
					{
					}
				},{frequency: "Always"});
			}
		}
		if (Config.Raids.SafeExit)
		{
		container.afterResolution("InraidCallbacks", (_t, result) => 
			{
				result.saveProgress = (url, info, sessionID) => 
				{
				if(info.exit == "left" && !info.isPlayerScav)
					{
						info.exit = "runner"
					}
					const InraidController = container.resolve("InraidController");
					InraidController.savePostRaidProgress(info, sessionID);
				return HttpResponse.nullResponse();
				}
			},{frequency: "Always"});
		}
		if (Config.Raids.SaveGearAfterDeath)
		{
		container.afterResolution("InraidCallbacks", (_t, result) => 
			{
				result.saveProgress = (url, info, sessionID) => 
				{
				if(info.exit !== "survived" && !info.isPlayerScav)
					{
						info.exit = "runner"
					}
					const InraidController = container.resolve("InraidController");
					InraidController.savePostRaidProgress(info, sessionID);
				return HttpResponse.nullResponse();
				}
			},{frequency: "Always"});
		}
		if (Config.Raids.EnableRaids || Config.Custom.DebugAI) //Connected all 3 functions into one, 2 events and AI debug tool. Double IFs are cringe, but i didn't came up with a better solution.
		{
			container.afterResolution("BotCallbacks", (_t, result) => 
				{
					result.generateBots = (url, info, sessionID) => 
					{
						const BotController = container.resolve("BotController");
						for (let type in info.conditions)
							{
								if(Config.Raids.RaidEvents.RaidersEverywhere)
								{
								let roles = info.conditions[type]
								roles.Role = "pmcBot"
								}
								if(Config.Raids.RaidEvents.CultistsEverywhere)
								{
								let roles = info.conditions[type]
								roles.Role = "sectantWarrior"
								}
								if(Config.Custom.DebugAI)
								{
									Logger.info("/client/game/bot/generate data was: " + JSON.stringify(info.conditions))
								}
							}
						return HttpResponse.getBody(BotController.generate(sessionID,info));
					}
				},{frequency: "Always"});
		}
		//PRE LOAD - CSM SECTION
		if (Config.CSM.Pockets.DefaultPocket)
		{
			StaticRouterModService.registerStaticRouter("DefaultPockets",
				[
				{
					url: "/client/game/version/validate",
					action: (url, info, sessionID) =>
					{
						let Pocketscheck = 0;
						let pmcData = container.resolve("ProfileHelper").getPmcProfile(sessionID);
						try
						{
							pmcData.Inventory.items.forEach((item) =>
							{
								if (item.slotId == "Pockets")
								{
									Pocketscheck++;
									item._tpl = "627a4e6b255f7527fb05a0f6";
								}
							})
							if(Pocketscheck == 0)
							{
								pmcData.Inventory.items.push(
									{"_id": "SVMRevivedPockets",
									"_tpl": "627a4e6b255f7527fb05a0f6",
									"parentId": pmcData.Inventory.equipment,
									"slotId": "Pockets"}
								)
							}
							return HttpResponse.nullResponse();
						}
						catch (e)
						{
							Logger.error("Default Pockets: New profile detected, Cancelling function" + e)
							return HttpResponse.nullResponse();
						}
					}
				}], "aki");
		}
		if (Config.CSM.CustomPocket && !Config.CSM.Pockets.DefaultPocket)
		{		
				StaticRouterModService.registerStaticRouter("CustomPocket",
					[
					{
						url: "/client/game/version/validate",
						action: (url, info, sessionID) =>
						{
							let Pocketscheck = 0;
							let pmcData = container.resolve("ProfileHelper").getPmcProfile(sessionID);
							try
							{
								pmcData.Inventory.items.forEach((item) =>
								{
									if (item.slotId == "Pockets")
									{
										Pocketscheck++;
										item._tpl = "CustomPocket";
									}
								})
								if(Pocketscheck == 0)
								{
									pmcData.Inventory.items.push(
										{"_id": "SVMRevivedPockets",
										"_tpl": "627a4e6b255f7527fb05a0f6",
										"parentId": pmcData.Inventory.equipment,
										"slotId": "Pockets"}
									)
								}
								return HttpResponse.nullResponse();
							}
							catch (e)
							{
								Logger.error("Bigger Pockets: New profile detected, Cancelling function" + e)
								return HttpResponse.nullResponse();
							}
						}
					}], "aki");
		}
		//HEALTH FUNCTIONS
		if (Config.Player.EnableHealth || Config.Scav.EnableScavHealth || Config.Scav.ScavCustomPockets || Config.Player.EnableStats) //TO OVERRIDE HEALTH + CURRENT SCAV HEALTH AND POCKETS BEFORE RAID
		{
			StaticRouterModService.registerStaticRouter("EditHealth",
				[
				{
					url: "/client/game/version/validate",
					action: (url, info, sessionID) =>
					{
						try
						{
							let pmcData = container.resolve("ProfileHelper").getPmcProfile(sessionID);
							let scavData = container.resolve("ProfileHelper").getScavProfile(sessionID);
							if(Config.Player.EnableStats)
							{
								pmcData.Health.Energy.Maximum = Config.Player.MaxEnergy;
								pmcData.Health.Hydration.Maximum = Config.Player.MaxHydration;
							}
							if (Config.Player.EnableHealth)
							{
							pmcData.Health.BodyParts["Head"].Health.Maximum = Config.Player.Health.Head
							pmcData.Health.BodyParts["Chest"].Health.Maximum = Config.Player.Health.Chest
							pmcData.Health.BodyParts["Stomach"].Health.Maximum = Config.Player.Health.Stomach
							pmcData.Health.BodyParts["LeftArm"].Health.Maximum = Config.Player.Health.LeftArm
							pmcData.Health.BodyParts["LeftLeg"].Health.Maximum = Config.Player.Health.LeftLeg
							pmcData.Health.BodyParts["RightArm"].Health.Maximum = Config.Player.Health.RightArm
							pmcData.Health.BodyParts["RightLeg"].Health.Maximum = Config.Player.Health.RightLeg
							}
							if (Config.Scav.EnableScavHealth)
							{
							scavData.Health.BodyParts["Head"].Health.Maximum = Config.Scav.Health.Head
							scavData.Health.BodyParts["Chest"].Health.Maximum = Config.Scav.Health.Chest
							scavData.Health.BodyParts["Stomach"].Health.Maximum = Config.Scav.Health.Stomach
							scavData.Health.BodyParts["LeftArm"].Health.Maximum = Config.Scav.Health.LeftArm
							scavData.Health.BodyParts["LeftLeg"].Health.Maximum = Config.Scav.Health.LeftLeg
							scavData.Health.BodyParts["RightArm"].Health.Maximum = Config.Scav.Health.RightArm
							scavData.Health.BodyParts["RightLeg"].Health.Maximum = Config.Scav.Health.RightLeg
							//Because default health will not be increased
							scavData.Health.BodyParts["Head"].Health.Current = Config.Scav.Health.Head
							scavData.Health.BodyParts["Chest"].Health.Current = Config.Scav.Health.Chest
							scavData.Health.BodyParts["Stomach"].Health.Current = Config.Scav.Health.Stomach
							scavData.Health.BodyParts["LeftArm"].Health.Current = Config.Scav.Health.LeftArm
							scavData.Health.BodyParts["LeftLeg"].Health.Current = Config.Scav.Health.LeftLeg
							scavData.Health.BodyParts["RightArm"].Health.Current = Config.Scav.Health.RightArm
							scavData.Health.BodyParts["RightLeg"].Health.Current = Config.Scav.Health.RightLeg
							}
							if(Config.Scav.ScavCustomPockets)
							{
								scavData.Inventory.items.forEach((item) =>
								{
									if (item.slotId == "Pockets")
									{
										item._tpl = "ScavCustomPocket";
									}
								})
							}
							return HttpResponse.nullResponse();
						}
						catch (e)
						{
							Logger.error("SVM:Edit health - Unknown error occured" + e)
							return HttpResponse.nullResponse();
						}
					}
				}], "aki");
		}
	if (Config.Scav.EnableScavHealth || Config.Scav.ScavCustomPockets)
	{ // TO OVERRIDE NEXT SCAVS HEALTH + POCKETS 
		//May Omnissiah save our souls, have to use both because register affects deaths and resolution affects extracts. Don't ask
		StaticRouterModService.registerStaticRouter("EditHealthv2",
		[
		{
			url: "/raid/profile/save",
			action: (url, info, sessionID) =>
			{
				const saveServer = container.resolve("SaveServer");
				const playerScavGenerator = container.resolve("PlayerScavGenerator");
				const scavData = playerScavGenerator.generate(sessionID);
				ScavChanges(scavData);
				saveServer.getProfile(sessionID).characters.scav = scavData;
				return HttpResponse.nullResponse();
			}
		}], "aki");

		container.afterResolution("ProfileController", (_t, result) => {
			result.generatePlayerScav = (sessionID) => {
			  const playerScavGenerator = container.resolve("PlayerScavGenerator");
			  const scavData = playerScavGenerator.generate(sessionID);
			  ScavChanges(scavData);
			  return scavData;
			}
		  }, { frequency: "Always" });
	}
	function ScavChanges(scavData)
	{
		try
		{
			if (Config.Scav.EnableScavHealth)
			{
				scavData.Health.BodyParts["Head"].Health.Maximum = Config.Scav.Health.Head
				scavData.Health.BodyParts["Chest"].Health.Maximum = Config.Scav.Health.Chest
				scavData.Health.BodyParts["Stomach"].Health.Maximum = Config.Scav.Health.Stomach
				scavData.Health.BodyParts["LeftArm"].Health.Maximum = Config.Scav.Health.LeftArm
				scavData.Health.BodyParts["LeftLeg"].Health.Maximum = Config.Scav.Health.LeftLeg
				scavData.Health.BodyParts["RightArm"].Health.Maximum = Config.Scav.Health.RightArm
				scavData.Health.BodyParts["RightLeg"].Health.Maximum = Config.Scav.Health.RightLeg
				//Because default health will not be increased
				scavData.Health.BodyParts["Head"].Health.Current = Config.Scav.Health.Head
				scavData.Health.BodyParts["Chest"].Health.Current = Config.Scav.Health.Chest
				scavData.Health.BodyParts["Stomach"].Health.Current = Config.Scav.Health.Stomach
				scavData.Health.BodyParts["LeftArm"].Health.Current = Config.Scav.Health.LeftArm
				scavData.Health.BodyParts["LeftLeg"].Health.Current = Config.Scav.Health.LeftLeg
				scavData.Health.BodyParts["RightArm"].Health.Current = Config.Scav.Health.RightArm
				scavData.Health.BodyParts["RightLeg"].Health.Current = Config.Scav.Health.RightLeg
			}
			if(Config.Scav.ScavCustomPockets)
			{
				scavData.Inventory.items.forEach((item) =>
				{
					if (item.slotId == "Pockets")
					{
						item._tpl = "ScavCustomPocket";
					}
				})
			}
		}
		catch (e)
		{
			Logger.error("Unknown error occured" + e)
		}
	}
	}
	 postDBLoad(container)
	{
		const Logger = container.resolve("WinstonLogger");
		try {
		const PresetLoader = require('../Loader/loader.json');
		const Config = require('../Presets/' + PresetLoader.CurrentlySelectedPreset + '.json');
		}
		catch (e)
		{
		return
		}
		//Config variables to asset for funcs.
		const PresetLoader = require('../Loader/loader.json');
		const Config = require('../Presets/' + PresetLoader.CurrentlySelectedPreset + '.json');
		//DB redirects
		const DB = container.resolve("DatabaseServer").getTables();
		const hideout = DB.hideout;
		const locations = DB.locations;
		const traders = DB.traders;
		const Quests = DB.templates.quests;
		const suits = DB.templates.customization;
		const items = DB.templates.items;
		const globals = DB.globals.config;
		//DEBUG CONFIGS
		/*const Inraid = require('G:/Games/EFTOFF/Aki_Data/Server/configs/inraid.json');
		const Repair = require('G:/Games/EFTOFF/Aki_Data/Server/configs/repair.json');
		const locs = require('G:/Games/EFTOFF/Aki_Data/Server/configs/location.json');
		const Airdrop = require('G:/Games/EFTOFF/Aki_Data/Server/configs/airdrop.json');
		const Ragfair = require('G:/Games/EFTOFF/Aki_Data/Server/configs/ragfair.json');
		const Insurance = require('G:/Games/EFTOFF/Aki_Data/Server/configs/insurance.json');
		const Health = require('G:/Games/EFTOFF/Aki_Data/Server/configs/health.json');
		const Bots = require('G:/Games/EFTOFF/Aki_Data/Server/configs/bot.json');
		const Quest = require('G:/Games/EFTOFF/Aki_Data/Server/configs/quest.json');
		const WeatherValues = require('G:/Games/EFTOFF/Aki_Data/Server/configs/weather.json');
		const trader = require('G:/Games/EFTOFF/Aki_Data/Server/configs/trader.json');
		const PMC = require('G:/Games/EFTOFF/Aki_Data/Server/configs/pmc.json');
		*/
		// Redirects to server internal configs.
		const configServer = container.resolve("ConfigServer");
		//const Seasons = configServer.getConfig("aki-seasonalevents")
		const Inraid = configServer.getConfig("aki-inraid"); 
		const Repair = configServer.getConfig("aki-repair");
		const locs = configServer.getConfig("aki-location");
		const Airdrop = configServer.getConfig("aki-airdrop");
		const Ragfair = configServer.getConfig("aki-ragfair");
		const Insurance = configServer.getConfig("aki-insurance");
		const Health = configServer.getConfig("aki-health");
		const Bots = configServer.getConfig("aki-bot");
		const Quest = configServer.getConfig("aki-quest");
		//const hideoutC = configServer.getConfig("aki-hideout");
		const WeatherValues = configServer.getConfig("aki-weather");
		const trader = configServer.getConfig("aki-trader");
		//const Inventory = configServer.getConfig("aki-inventory");
		//const BlackItems = configServer.getConfig("aki-item");
		const PMC = configServer.getConfig("aki-pmc")
		const Bot = DB.bots.types
		//First initialising loggers
		const funni = 
		[
		"So, how's Helld...Ah, right, Sony.",
		"Have you tried Minecraft though?","I hope Nikita is proud of me",
		"This release provides you 16x time the details according to Todd Howard",
		"Bears are based but cringe, Usecs are cringe but based",
		"85.499% of the update time were wasted for this specific line you're reading",
		"Still not enough tooltips added, slight chance to get stuck in a toaster",
		"Kept ya waiting huh?", "You're finally awake, you were trying to play like a chad, right?",
		"It's here, lurking in the shadows","Chomp goes Caw Caw","Goose goes Honk Honk","GhostFenixx goes 'Not again'","No more KMC ;-;",
		"Hello, how's your day? :]","I hope you have enough RAM to play this","Wipe at Thursday",
		"Tagilla locked me up in the basement to write mods for Tarkov, send help",
		"If you're reading this, you're capable of reading!","Who wrote this stuff anyway?",
		"Hot single SCAVs in you area!","These lines are such a waste of space","I know you are reading this",
		"Do you like hurting other people?","Don't play Gaijin games, such a cash grab, good source of classified data tho",
		"YOU, YES YOU, YOU ARE AWESOME, NOW LIVE WITH THAT!","Did you wash your dishes?",
		"Sanitar did nothing wrong","I actually played tarkov, finally","rat attac",
		"Don't worry, I won't judge your preferences, you're my favorite casual <3",
		"Me (Head-Eyes) You","HE DID THE WIGGLE!","Are you sure you enabled sections?",
		"Did you know? If you kill guys with guns, there will be no one to kill you!",
		"The all consuming gluttony is approaching","I swear if I forgot some logger somewhere i'll choke someone",
		"Go on, tell me you're trying to run EFT with 8GB of ram","Are you seriously playing SPT by yourself?",
		"No, Putting 16x Scope onto TOZ is not a great idea","Don't dissapoint the Glock Daddy","Still can't play streets, right? I feel ya",
		"Go on, take SVD into factory, see if I care","RFB AND VPO FOR THE WIN!","Makes your experience better since 2021!",
		"Dead diary, today I died with LEDX not in the secure container",
		"ALL SCREWS, NO NUTS, WHY?","One does not simply launch flare properly",
		"Noooo, don't go that corridor, there is a mine in the room!","No more Autumn in Tarkov",
		"The Holy Fox is gone","Don't play MMO's, those are unhealthy","I swear, stop putting those lines on Reddit",
		"I really hope you do not restart the server to read those","There will be Up. Date. A creator on website nodes his head.",
		"Stay Hydrated","Have you tried Gray Zone Warfare? :D","Still filled with bugs, don't worry",
		"Pls leave a like an subscribe, don't forget to click a bell button","Google Clearly doesn't like me ;-;",
		"Name of your PMC is disgusting, please revaluate your life choises","Why do you want to carry 2000 rouns in one slot?",
		"Really? 20x2 cell sized pockets?","Extremis malis extrema remedia, effugere non potes","You're a PMC, Harry!","Join the Dark side, we have Igolniks",
		"Imagine how many people died stepping on mines in Woods because they can't read the signs",
		"Each new line added in message of the day is increasing the load on your CPU, let that sink in",
		"Totally against Nikita(tm) vision(tm).","3 HEAVY BLEEDS IN ONE SHOT, THANKS SCAV!",
		"You better not forget to take splint with you this time", "You cannot Escape From -REDACTED BY LICENSE VIOLATION-","Releases like 1.8.0 will give me PTSD"]

		Logger.log(`SVM 1.8.3 has initialized, ` + funni[Math.floor(Math.random() * funni.length)],"blue");
		if (PresetLoader.CurrentlySelectedPreset != "" && PresetLoader.CurrentlySelectedPreset != undefined)
		{
			Logger.log("SVM Preset - " + PresetLoader.CurrentlySelectedPreset + " - successfully loaded", "blue");
		}
		if(Config.LimitsRemoved)
		{
			Logger.warning("SVM: WARNING - VALUES OVERRIDE DETECTED, NO SUPPORT WILL BE GIVEN USING THAT OPTION")
		}
		//############## FLEAMARKET SECTION ###########
		if(Config.Fleamarket.EnableFleamarket)
			{
				globals.RagFair.minUserLevel = Config.Fleamarket.FleaMarketLevel;
				Ragfair.dynamic.purchasesAreFoundInRaid = Config.Fleamarket.FleaFIR;
				globals.RagFair.isOnlyFoundInRaidAllowed = !Config.Fleamarket.FleaNoFIRSell;
				Ragfair.dynamic.blacklist.enableBsgList = !Config.Fleamarket.DisableBSGList;
				// Ragfair.dynamic.blacklist.custom = Config.Fleamarket.FleaBlacklist;
				//Ragfair.dynamic.removeSeasonalItemsWhenNotInEvent = !Config.Fleamarket.EventOffers
				//BlackItems.blacklist = Config.Fleamarket.FleaBlacklist;
				Ragfair.sell.fees = Config.Fleamarket.EnableFees;
				Ragfair.sell.chance.base = Config.Fleamarket.Sell_chance;
				Ragfair.sell.chance.sellMultiplier = Config.Fleamarket.Sell_mult;
				Ragfair.sell.time.base = Config.Fleamarket.Tradeoffer_avg;
				Ragfair.sell.time.max = Config.Fleamarket.Tradeoffer_max;
				Ragfair.sell.time.min = Config.Fleamarket.Tradeoffer_min;
				globals.RagFair.ratingIncreaseCount = Config.Fleamarket.Rep_gain;
				globals.RagFair.ratingDecreaseCount = Config.Fleamarket.Rep_loss;
				// Ragfair.sell.reputation.loss = Config.Fleamarket.Rep_loss;
				//Dynamic offers
				Ragfair.dynamic.expiredOfferThreshold = Config.Fleamarket.DynamicOffers.ExpireThreshold;
				//Min-Max
				Ragfair.dynamic.offerItemCount.min = Config.Fleamarket.DynamicOffers.PerOffer_min;
				Ragfair.dynamic.offerItemCount.max = Config.Fleamarket.DynamicOffers.PerOffer_max;

				//Unifying the multiplier, not the best case scenario, but it is rather simple to comprehend and modify for common user, they'll never know >_>
				Ragfair.dynamic.priceRanges.default.min = Config.Fleamarket.DynamicOffers.Price_min;
				Ragfair.dynamic.priceRanges.default.max = Config.Fleamarket.DynamicOffers.Price_max;
				Ragfair.dynamic.priceRanges.pack.min = Config.Fleamarket.DynamicOffers.Price_min;
				Ragfair.dynamic.priceRanges.pack.max = Config.Fleamarket.DynamicOffers.Price_max;
				Ragfair.dynamic.priceRanges.preset.min = Config.Fleamarket.DynamicOffers.Price_min;
				Ragfair.dynamic.priceRanges.preset.max = Config.Fleamarket.DynamicOffers.Price_max;
				Ragfair.dynamic.endTimeSeconds.min = Config.Fleamarket.DynamicOffers.Time_min*60;
				Ragfair.dynamic.endTimeSeconds.max = Config.Fleamarket.DynamicOffers.Time_max*60;				
				Ragfair.dynamic.nonStackableCount.min = Config.Fleamarket.DynamicOffers.NonStack_min;
				Ragfair.dynamic.nonStackableCount.max = Config.Fleamarket.DynamicOffers.NonStack_max;
				Ragfair.dynamic.stackablePercent.min = Config.Fleamarket.DynamicOffers.Stack_min;
				Ragfair.dynamic.stackablePercent.max = Config.Fleamarket.DynamicOffers.Stack_max;
				//Currencies
				Ragfair.dynamic.currencies["5449016a4bdc2d6f028b456f"] = Config.Fleamarket.DynamicOffers.Roubleoffers;
				Ragfair.dynamic.currencies["5696686a4bdc2da3298b456a"] = Config.Fleamarket.DynamicOffers.Dollaroffers;
				Ragfair.dynamic.currencies["569668774bdc2da2298b4568"] = Config.Fleamarket.DynamicOffers.Eurooffers;
				//Wear condition in offers
				Ragfair.dynamic.condition["5422acb9af1c889c16000029"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaWeapons_Min /100).toFixed(2))
				Ragfair.dynamic.condition["543be5664bdc2dd4348b4569"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaMedical_Min /100).toFixed(2))
				Ragfair.dynamic.condition["5447e0e74bdc2d3c308b4567"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaSpec_Min /100).toFixed(2))
				Ragfair.dynamic.condition["543be5e94bdc2df1348b4568"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaKeys_Min /100).toFixed(2))
				Ragfair.dynamic.condition["5448e5284bdc2dcb718b4567"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaVests_Min /100).toFixed(2))
				Ragfair.dynamic.condition["57bef4c42459772e8d35a53b"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaArmor_Min /100).toFixed(2))
				Ragfair.dynamic.condition["543be6674bdc2df1348b4569"].max.min = parseFloat((Config.Fleamarket.FleaConditions.FleaFood_Min /100).toFixed(2))

				Ragfair.dynamic.condition["5422acb9af1c889c16000029"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaWeapons_Max /100).toFixed(2))
				Ragfair.dynamic.condition["543be5664bdc2dd4348b4569"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaMedical_Max /100).toFixed(2))
				Ragfair.dynamic.condition["5447e0e74bdc2d3c308b4567"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaSpec_Max /100).toFixed(2))
				Ragfair.dynamic.condition["543be5e94bdc2df1348b4568"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaKeys_Max /100).toFixed(2))
				Ragfair.dynamic.condition["5448e5284bdc2dcb718b4567"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaVests_Max /100).toFixed(2))
				Ragfair.dynamic.condition["57bef4c42459772e8d35a53b"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaArmor_Max /100).toFixed(2))
				Ragfair.dynamic.condition["543be6674bdc2df1348b4569"].max.max = parseFloat((Config.Fleamarket.FleaConditions.FleaFood_Max /100).toFixed(2))

				if(Config.Fleamarket.OverrideOffers)
				{
					const offer = {
						"from": -100000,
						"to": 100000,
						"count": Config.Fleamarket.SellOffersAmount
					}
					globals.RagFair.maxActiveOfferCount = []
					globals.RagFair.maxActiveOfferCount.push(offer)
				}

		}
		//############## LOOT SECTION #################
		if (Config.Loot.EnableLoot)
		{
			//loose loot mults
			locs.looseLootMultiplier.bigmap = Config.Loot.Locations.Streets.Loose;
			locs.looseLootMultiplier.factory4_day = Config.Loot.Locations.FactoryDay.Loose;
			locs.looseLootMultiplier.factory4_night = Config.Loot.Locations.FactoryNight.Loose;
			locs.looseLootMultiplier.interchange = Config.Loot.Locations.Interchange.Loose;
			locs.looseLootMultiplier.laboratory = Config.Loot.Locations.Laboratory.Loose;
			locs.looseLootMultiplier.rezervbase = Config.Loot.Locations.Reserve.Loose;
			locs.looseLootMultiplier.shoreline = Config.Loot.Locations.Shoreline.Loose;
			locs.looseLootMultiplier.woods = Config.Loot.Locations.Woods.Loose;
			locs.looseLootMultiplier.lighthouse = Config.Loot.Locations.Lighthouse.Loose;
			locs.looseLootMultiplier.tarkovstreets = Config.Loot.Locations.Streets.Loose;
			locs.looseLootMultiplier.sandbox = Config.Loot.Locations.Sandbox.Loose;
			//container loot mults
			locs.staticLootMultiplier.bigmap = Config.Loot.Locations.Bigmap.Container;
			locs.staticLootMultiplier.factory4_day = Config.Loot.Locations.FactoryDay.Container;
			locs.staticLootMultiplier.factory4_night = Config.Loot.Locations.FactoryNight.Container;
			locs.staticLootMultiplier.interchange = Config.Loot.Locations.Interchange.Container;
			locs.staticLootMultiplier.laboratory = Config.Loot.Locations.Laboratory.Container;
			locs.staticLootMultiplier.rezervbase = Config.Loot.Locations.Reserve.Container;
			locs.staticLootMultiplier.shoreline = Config.Loot.Locations.Shoreline.Container;
			locs.staticLootMultiplier.woods = Config.Loot.Locations.Woods.Container;
			locs.staticLootMultiplier.lighthouse = Config.Loot.Locations.Lighthouse.Container;
			locs.staticLootMultiplier.tarkovstreets = Config.Loot.Locations.Streets.Container;
			locs.staticLootMultiplier.sandbox = Config.Loot.Locations.Sandbox.Container;
			locs.containerRandomisationSettings.enabled = !Config.Loot.Locations.AllContainers
			//############## AIRDROPS SECTION ##################
			//Logger.info(Airdrop.loot)
			Airdrop.airdropMinStartTimeSeconds = Config.Loot.Airdrops.AirtimeMin*60;
			Airdrop.airdropMaxStartTimeSeconds = Config.Loot.Airdrops.AirtimeMax*60;
			Airdrop.airdropChancePercent.reserve = Config.Loot.Airdrops.Reserve_air;
			Airdrop.airdropChancePercent.shoreline = Config.Loot.Airdrops.Shoreline_air;
			Airdrop.airdropChancePercent.woods = Config.Loot.Airdrops.Woods_air;
			Airdrop.airdropChancePercent.lighthouse = Config.Loot.Airdrops.Lighthouse_air;
			Airdrop.airdropChancePercent.bigmap = Config.Loot.Airdrops.Bigmap_air;
			Airdrop.airdropChancePercent.interchange = Config.Loot.Airdrops.Interchange_air;
			Airdrop.airdropChancePercent.tarkovStreets = Config.Loot.Airdrops.Streets_air;
			if(Airdrop.loot.mixed != undefined)
			{
			Airdrop.loot.mixed.itemCount.min = Config.Loot.Airdrops.Mixed.BarterMin
			Airdrop.loot.mixed.itemCount.max = Config.Loot.Airdrops.Mixed.BarterMax
			Airdrop.loot.mixed.weaponPresetCount.min = Config.Loot.Airdrops.Mixed.PresetMin
			Airdrop.loot.mixed.weaponPresetCount.max = Config.Loot.Airdrops.Mixed.PresetMax
			Airdrop.loot.mixed.armorPresetCount.min = Config.Loot.Airdrops.Mixed.ArmorMin
			Airdrop.loot.mixed.armorPresetCount.max = Config.Loot.Airdrops.Mixed.ArmorMax
			Airdrop.loot.mixed.weaponCrateCount.min = Config.Loot.Airdrops.Mixed.CratesMin
			Airdrop.loot.mixed.weaponCrateCount.max = Config.Loot.Airdrops.Mixed.CratesMax
			}
			if(Airdrop.loot.weaponArmor != undefined)
			{
			Airdrop.loot.weaponArmor.itemCount.min = Config.Loot.Airdrops.Weapon.BarterMin
			Airdrop.loot.weaponArmor.itemCount.max = Config.Loot.Airdrops.Weapon.BarterMax
			Airdrop.loot.weaponArmor.weaponPresetCount.min = Config.Loot.Airdrops.Weapon.PresetMin
			Airdrop.loot.weaponArmor.weaponPresetCount.max = Config.Loot.Airdrops.Weapon.PresetMax
			Airdrop.loot.weaponArmor.armorPresetCount.min = Config.Loot.Airdrops.Weapon.ArmorMin
			Airdrop.loot.weaponArmor.armorPresetCount.max = Config.Loot.Airdrops.Weapon.ArmorMax
			Airdrop.loot.weaponArmor.weaponCrateCount.min = Config.Loot.Airdrops.Weapon.CratesMin
			Airdrop.loot.weaponArmor.weaponCrateCount.max = Config.Loot.Airdrops.Weapon.CratesMax
			}
			if(Airdrop.loot.barter != undefined)
			{
			Airdrop.loot.barter.itemCount.min = Config.Loot.Airdrops.Barter.BarterMin	
			Airdrop.loot.barter.itemCount.max = Config.Loot.Airdrops.Barter.BarterMax
			Airdrop.loot.barter.weaponPresetCount.min = Config.Loot.Airdrops.Barter.PresetMin
			Airdrop.loot.barter.weaponPresetCount.max = Config.Loot.Airdrops.Barter.PresetMax
			Airdrop.loot.barter.armorPresetCount.min = Config.Loot.Airdrops.Barter.ArmorMin
			Airdrop.loot.barter.armorPresetCount.max = Config.Loot.Airdrops.Barter.ArmorMax
			Airdrop.loot.barter.weaponCrateCount.min = Config.Loot.Airdrops.Barter.CratesMin
			Airdrop.loot.barter.weaponCrateCount.max = Config.Loot.Airdrops.Barter.CratesMax
			}
			if(Airdrop.loot.foodMedical != undefined)
			{
			Airdrop.loot.foodMedical.itemCount.min = Config.Loot.Airdrops.Medical.BarterMin
			Airdrop.loot.foodMedical.itemCount.max = Config.Loot.Airdrops.Medical.BarterMax
			Airdrop.loot.foodMedical.weaponPresetCount.min = Config.Loot.Airdrops.Medical.PresetMin
			Airdrop.loot.foodMedical.weaponPresetCount.max = Config.Loot.Airdrops.Medical.PresetMax
			Airdrop.loot.foodMedical.armorPresetCount.min = Config.Loot.Airdrops.Medical.ArmorMin
			Airdrop.loot.foodMedical.armorPresetCount.max = Config.Loot.Airdrops.Medical.ArmorMax
			Airdrop.loot.foodMedical.weaponCrateCount.min = Config.Loot.Airdrops.Medical.CratesMin
			Airdrop.loot.foodMedical.weaponCrateCount.max = Config.Loot.Airdrops.Medical.CratesMax
			}

		}
		//############## BOTS SECTION #################
		if (Config.Bots.EnableBots)
		{
				for (let i in locations)
				{
					if (i !== "base" && locations[i].base.BossLocationSpawn)
					{
						for (let x in locations[i].base.BossLocationSpawn)
						{
							switch (locations[i].base.BossLocationSpawn[x].BossName)
							{
								case "bossBoar":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Kaban
								break;
								case "bossKolontay":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Kolontay
								break;
								case "bossBully":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Reshala
								break;
								case "bossSanitar":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Sanitar
								break;
								case "bossKilla":
									if (i == "interchange")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Killa
									}
									// if (i == "tarkovstreets") Not actual
									// {
									// 	locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.KillaStreets
									// }
								break;
								case "bossTagilla":
									if (i == "factory4_day")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Tagilla
									}
									if (i == "factory4_night")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.TagillaNight
									}
								break;
								case "bossGluhar":
									if (i == "rezervbase")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Glukhar
									}
								break;
								case "bossKojaniy":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Shturman
								break;
								case "bossZryachiy":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Zryachiy
								break;
								case "exUsec":
									locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Rogue
								break;
								case "bossKnight":
									if  (i == "woods")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.TrioWoods
									}
									if  (i == "shoreline")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.TrioShoreline
									}
									if  (i == "bigmap")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.Trio
									}
									if  (i == "lighthouse")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.TrioLighthouse
									}
								break;
								case "pmcBot":
									if (i == "laboratory")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.RaiderLab
									}
									if  (i == "rezervbase")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.RaiderReserve
									}
								break;
								case "sectantPriest":
									if (i == "factory4_night")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.CultistFactory
									}
									if  (i == "woods")
									{

										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.CultistWoods
									}
									if (i == "bigmap")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.CultistCustoms
									}
									if  (i == "shoreline")
									{
										locations[i].base.BossLocationSpawn[x].BossChance = Config.Bots.AIChance.CultistShoreline
									}
								break;
							}
						}
					}
				}
		    const WepDur = Config.Bots.WeaponDurab;
			const ArmorDur = Config.Bots.ArmorDurab;
			const BotWepMinID = [WepDur.ScavMin, WepDur.MarksmanMin, WepDur.RaiderMin, WepDur.RogueMin, WepDur.PMCMin, WepDur.BossMin, WepDur.FollowerMin];
			const BotWepMaxID = [WepDur.ScavMax, WepDur.MarksmanMax, WepDur.RaiderMax, WepDur.RogueMax, WepDur.PMCMax, WepDur.BossMax, WepDur.FollowerMax];
			const BotArmorMinID = [ArmorDur.ScavMin, ArmorDur.MarksmanMin, ArmorDur.RaiderMin, ArmorDur.RogueMin, ArmorDur.PMCMin, ArmorDur.BossMin, ArmorDur.FollowerMin];
			const BotArmorMaxID = [ArmorDur.ScavMax, ArmorDur.MarksmanMax, ArmorDur.RaiderMax, ArmorDur.RogueMax, ArmorDur.PMCMax, ArmorDur.BossMax, ArmorDur.FollowerMax];

			const BotTypeID = ["assault","marksman","pmcbot","exusec","pmc","boss","follower"]
			for ( let durab in BotTypeID)
			{
			Bots.durability[BotTypeID[durab]].weapon.lowestMax = BotWepMinID[durab];
			Bots.durability[BotTypeID[durab]].weapon.highestMax = BotWepMaxID[durab];
			Bots.durability[BotTypeID[durab]].armor.maxDelta = 100 - BotArmorMinID[durab];
			Bots.durability[BotTypeID[durab]].armor.minDelta = 100 -BotArmorMaxID[durab];
				switch (BotTypeID[durab])
				{
					case "assault":
						Bots.durability["cursedassault"].weapon.lowestMax = BotWepMinID[durab]
						Bots.durability["cursedassault"].weapon.highestMax = BotWepMaxID[durab]
						Bots.durability["cursedassault"].armor.maxDelta = 100 - BotArmorMinID[durab];
						Bots.durability["cursedassault"].armor.minDelta = 100 - BotArmorMaxID[durab];

						Bots.durability["crazyassaultevent"].weapon.lowestMax = BotWepMinID[durab]
						Bots.durability["crazyassaultevent"].weapon.highestMax = BotWepMaxID[durab]
						Bots.durability["crazyassaultevent"].armor.maxDelta = 100 - BotArmorMinID[durab];
						Bots.durability["crazyassaultevent"].armor.minDelta = 100 - BotArmorMaxID[durab];
						break;
					case "pmcbot":
						Bots.durability["arenafighterevent"].weapon.lowestMax = BotWepMinID[durab]
						Bots.durability["arenafighterevent"].weapon.highestMax = BotWepMaxID[durab]
						Bots.durability["arenafighterevent"].armor.maxDelta = 100 - BotArmorMinID[durab];
						Bots.durability["arenafighterevent"].armor.minDelta = 100 - BotArmorMaxID[durab];
					break
					case "boss":
						Bots.durability["sectantpriest"].weapon.lowestMax = BotWepMinID[durab];
						Bots.durability["sectantpriest"].weapon.highestMax = BotWepMaxID[durab];
						Bots.durability["sectantpriest"].armor.maxDelta = 100 - BotArmorMinID[durab];
						Bots.durability["sectantpriest"].armor.minDelta = 100 - BotArmorMaxID[durab];
						break;
					case "follower":
						Bots.durability["sectantwarrior"].weapon.lowestMax = BotWepMinID[durab];
						Bots.durability["sectantwarrior"].weapon.highestMax = BotWepMaxID[durab];
						Bots.durability["sectantwarrior"].armor.maxDelta = 100 - BotArmorMinID[durab];
						Bots.durability["sectantwarrior"].armor.minDelta = 100 - BotArmorMaxID[durab];
						break;
				}
			}
		}
		//############## INSURANCE/REPAIR SECTION ############
		if (Config.Services.EnableServices)
		{
			//Repair.priceMultiplier = Config.Insurance.RepairBox.RepairMult; Disabled due to visual bug - it doesn't show converted number, the function itself is working tho
			Repair.armorKitSkillPointGainPerRepairPointMultiplier = Config.Services.RepairBox.ArmorSkillMult;
			Repair.weaponTreatment.pointGainMultiplier = Config.Services.RepairBox.WeaponMaintenanceSkillMult;
			Repair.repairKitIntellectGainMultiplier.weapon =  Config.Services.RepairBox.IntellectSkillMultWeaponKit;
			Repair.repairKitIntellectGainMultiplier.armor =  Config.Services.RepairBox.IntellectSkillMultArmorKit;
			Repair.maxIntellectGainPerRepair.kit = Config.Services.RepairBox.IntellectSkillLimitKit;
			Repair.maxIntellectGainPerRepair.trader = Config.Services.RepairBox.IntellectSkillLimitTraders;
			Repair.applyRandomizeDurabilityLoss = !Config.Services.RepairBox.NoRandomRepair;
			Insurance.insuranceMultiplier["54cb50c76803fa8b248b4571"] = Config.Services.InsuranceMultPrapor;
			Insurance.insuranceMultiplier["54cb57776803fa99248b456e"] = Config.Services.InsuranceMultTherapist;
			Insurance.returnChancePercent["54cb50c76803fa8b248b4571"] = Config.Services.ReturnChancePrapor;
			Insurance.returnChancePercent["54cb57776803fa99248b456e"] = Config.Services.ReturnChanceTherapist;

			// globals.Insurance.MaxStorageTimeInHour = Config.Services.InsuranceStorageTime;
			for(let trader in traders)
			{
				if(traders[trader].base.insurance.availability)
					{
						traders[trader].base.insurance.max_storage_time = Config.Services.InsuranceStorageTime;
					}
			}
			traders["54cb50c76803fa8b248b4571"].base.insurance.min_return_hour = Config.Services.Prapor_Min;
			traders["54cb50c76803fa8b248b4571"].base.insurance.max_return_hour = Config.Services.Prapor_Max;
			traders["54cb57776803fa99248b456e"].base.insurance.min_return_hour = Config.Services.Therapist_Min;
			traders["54cb57776803fa99248b456e"].base.insurance.max_return_hour = Config.Services.Therapist_Max;
						//Enable all clothes available for both side
						if (Config.Services.ClothesAnySide)
						{
							for (let suit in suits)
							{
								let suitData = suits[suit]
								if (suitData._parent === "5cd944ca1388ce03a44dc2a4" || suitData._parent === "5cd944d01388ce000a659df9")
								{
									suitData._props.Side = ["Bear", "Usec"];
								}
							}
						}
						if (Config.Services.ClothesFree || Config.Services.ClothesLevelUnlock)
						{
							for (let tradercloth in traders)
							{
								if (traders[tradercloth].suits)
								{
									for (let file in traders[tradercloth].suits)
									{
										let fileData = traders[tradercloth].suits[file]
										if (Config.Services.ClothesLevelUnlock)
										{
										fileData.requirements.loyaltyLevel = 1;
										fileData.requirements.profileLevel = 1;
										fileData.requirements.standing = 0;
										fileData.requirements.questRequirements = [];//Only adik hits this
										}
										//fileData.requirements.skillRequirements = [];//This is useless, it always stands for empty
										if (Config.Services.ClothesFree)
										{
										fileData.requirements.itemRequirements = [];
										}
									}
								}
							}
						}
			if (Config.Services.EnableHealMarkup)
			{
				let TherapistLevels = [ Config.Services.TherapistLvl1,Config.Services.TherapistLvl2,Config.Services.TherapistLvl3,Config.Services.TherapistLvl4]
				for (let level in traders["54cb57776803fa99248b456e"].base.loyaltyLevels)
				{
					traders["54cb57776803fa99248b456e"].base.loyaltyLevels[level].heal_price_coef = TherapistLevels[level]
				}
				globals.Health.HealPrice.TrialLevels = Config.Services.FreeHealLvl
				globals.Health.HealPrice.TrialRaids = Config.Services.FreeHealRaids
			}
			for (let CurTrader in traders)
			{
				if (CurTrader !== "ragfair" && (CurTrader == "5a7c2eca46aef81a7ca2145d" || CurTrader == "5ac3b934156ae10c4430e83c" || CurTrader == "5c0647fdd443bc2504c2d371" || CurTrader == "54cb50c76803fa8b248b4571" || CurTrader == "54cb57776803fa99248b456e" || CurTrader == "579dc571d53a0658a154fbec" || CurTrader == "5935c25fb3acc3127c3d8cd9" || CurTrader == "58330581ace78e27b8b10cee"))
				{
					for (let level in traders[CurTrader].base.loyaltyLevels)
					{
						traders[CurTrader].base.loyaltyLevels[level].repair_price_coef *= Config.Services.RepairBox.RepairMult;
					}
				}
			}
			if(Config.Services.RepairBox.OpArmorRepair)
			{
				for(let armormats in globals.ArmorMaterials)
				{
					globals.ArmorMaterials[armormats].MaxRepairDegradation = 0
					globals.ArmorMaterials[armormats].MinRepairDegradation = 0
					globals.ArmorMaterials[armormats].MaxRepairKitDegradation = 0
					globals.ArmorMaterials[armormats].MinRepairKitDegradation = 0
				}
			}
			if(Config.Services.RepairBox.OpGunRepair)
			{
				for(let stuff in items)
				{
					if(items[stuff]._props.MaxRepairDegradation !== undefined && items[stuff]._props.MaxRepairKitDegradation !== undefined)
					{
					EditSimpleItemData(stuff, "MinRepairDegradation", 0);
					EditSimpleItemData(stuff, "MaxRepairDegradation", 0);
					EditSimpleItemData(stuff, "MinRepairKitDegradation", 0);
					EditSimpleItemData(stuff, "MaxRepairKitDegradation",  0);
					}
				}
			}
		}
		//############## CSM SECTION ##################
		if (Config.CSM.EnableCSM)
		{
			if (Config.CSM.CustomPocket)
			{
				const JsonUtil = container.resolve("JsonUtil");
				let CustomPocketItem = JsonUtil.clone(items["627a4e6b255f7527fb05a0f6"])
				let PocketSize = Config.CSM.Pockets
				CustomPocketItem._id = "CustomPocket"
				CustomPocketItem._props.Grids[0]._id = "SVMPocket1"
				CustomPocketItem._props.Grids[0]._parent = "CustomPocket"
				CustomPocketItem._props.Grids[0]._props.cellsH = PocketSize.FirstH
				CustomPocketItem._props.Grids[0]._props.cellsV = PocketSize.FirstV
				CustomPocketItem._props.Grids[1]._id = "SVMPocket2"
				CustomPocketItem._props.Grids[1]._parent = "CustomPocket"
				CustomPocketItem._props.Grids[1]._props.cellsH = PocketSize.SecondH
				CustomPocketItem._props.Grids[1]._props.cellsV = PocketSize.SecondV
				CustomPocketItem._props.Grids[2]._id = "SVMPocket3"
				CustomPocketItem._props.Grids[2]._parent = "CustomPocket"
				CustomPocketItem._props.Grids[2]._props.cellsH = PocketSize.ThirdH
				CustomPocketItem._props.Grids[2]._props.cellsV = PocketSize.ThirdV
				CustomPocketItem._props.Grids[3]._id = "SVMPocket4"
				CustomPocketItem._props.Grids[3]._parent = "CustomPocket"
				CustomPocketItem._props.Grids[3]._props.cellsH = PocketSize.FourthH
				CustomPocketItem._props.Grids[3]._props.cellsV = PocketSize.FourthV
				CustomPocketItem._props.Slots[0]._id = "SVMSPEC1"
				CustomPocketItem._props.Slots[1]._id = "SVMSPEC2"
				CustomPocketItem._props.Slots[2]._id = "SVMSPEC3"
				CustomPocketItem._props.Slots[0]._parent = "CustomPocket"
				CustomPocketItem._props.Slots[1]._parent = "CustomPocket"
				CustomPocketItem._props.Slots[2]._parent = "CustomPocket"
				//CustomPocketItem._props.Slots[2] = undefined;
				//CustomPocketItem._props.Slots.splice(1,2);
				if (PocketSize.FourthH == 0 || PocketSize.FourthV == 0)
				{
					CustomPocketItem._props.Grids.splice(3,1);
				}
				if (PocketSize.ThirdH == 0 || PocketSize.ThirdV == 0)
				{
					CustomPocketItem._props.Grids.splice(2,1);
				}
				if (PocketSize.SecondH == 0 || PocketSize.SecondV == 0)
				{
					CustomPocketItem._props.Grids.splice(1,1);
				}
				if (PocketSize.FirstH == 0 || PocketSize.FirstV == 0)
				{
					CustomPocketItem._props.Grids.splice(0,1);
				}

				switch (Config.CSM.Pockets.SpecSlots)
				{
				case 0:
					CustomPocketItem._props.Slots.splice(0,3);
					break;
				case 1:
					CustomPocketItem._props.Slots.splice(1,2);
					break;
				case 2:
					CustomPocketItem._props.Slots.splice(2,1);
					break;
				case 3:
					break;
					case 4://This need to be fixed, i need to make it gradual for each additional pocket rather using break, will be fixed in future.
						//Logger.info(AddSpecPocket)
						CustomPocketItem._props.Slots[3] = JsonUtil.clone(CustomPocketItem._props.Slots[2])
						//CustomPocketItem_props.Slots[3]
						CustomPocketItem._props.Slots[3]._id = "SVMSPEC4"
						CustomPocketItem._props.Slots[3]._name = "SpecialSlot4"
						CustomPocketItem._props.Slots[3]._parent = "CustomPocket"
					break;
				case 5:
					CustomPocketItem._props.Slots[3] = JsonUtil.clone(CustomPocketItem._props.Slots[2])
					CustomPocketItem._props.Slots[4] = JsonUtil.clone(CustomPocketItem._props.Slots[2])
					CustomPocketItem._props.Slots[3]._id = "SVMSPEC4"
					CustomPocketItem._props.Slots[3]._name = "SpecialSlot4"
					CustomPocketItem._props.Slots[3]._parent = "CustomPocket"
					CustomPocketItem._props.Slots[4]._id = "SVMSPEC5"
					CustomPocketItem._props.Slots[4]._name = "SpecialSlot5"
					CustomPocketItem._props.Slots[4]._parent = "CustomPocket"
				break;
				}
				CustomPocketItem._props.HideEntrails = true;
				items["CustomPocket"] = CustomPocketItem;
				let IDsToFilter = ["5783c43d2459774bbe137486", "60b0f6c058e0b0481a09ad11", "619cbf9e0a7c3a1a2731940a","619cbf7d23893217ec30b689", "59fafd4b86f7745ca07e1232", "62a09d3bcf4a99369e262447"];
				let Pockets = Config.CSM.Pockets
				let CasesToFilter = [Pockets.SpecSimpleWallet, Pockets.SpecWZWallet, Pockets.SpecKeycardHolder, Pockets.SpecInjectorCase, Pockets.SpecKeytool, Pockets.SpecGKeychain];
				for (let specialslots in CustomPocketItem._props.Slots)
				{
					for(let element in IDsToFilter)
					{
						if(CasesToFilter[element])
						{
						//Logger.info(CustomPocketItem._props.Slots[specialslots]._props.filters[0].Filter)
						//Logger.error(IDsToFilter[element])
						CustomPocketItem._props.Slots[specialslots]._props.filters[0].Filter.push(IDsToFilter[element])
						//Logger.warning(CustomPocketItem._props.Slots[specialslots]._props.filters[0].Filter)
						}
					}
					//items[IDsToFilter[specialslots]]._props.HideEntrails = true;
				}
				//items["5795f317245977243854e041"]._props.HideEntrails = true;
			}
			const Cases = Config.CSM.Cases
			const SecCon = Config.CSM.SecureContainers
			const SecConID = ["544a11ac4bdc2d470e8b456a", 
										  "5c093ca986f7740a1867ab12", 
										  "5857a8b324597729ab0a0e7d", 
										  "59db794186f77448bc595262", 
										  "5857a8bc2459772bad15db29"
			]
			const CasesID = ["59fb016586f7746d0d4b423a", 
										"5783c43d2459774bbe137486", 
										"60b0f6c058e0b0481a09ad11", 
										"5e2af55f86f7746d4159f07c", 
										"59fb042886f7746c5005a7b2", 
										"59fb023c86f7746d0d4b423c", 
										"5b7c710788a4506dec015957", 
										"5aafbde786f774389d0cbc0f", 
										"5c127c4486f7745625356c13", 
										"5c093e3486f77430cb02e593", 
										"5aafbcd986f7745e590fff23", 
										"5c0a840b86f7742ffa4f2482", 
										"5b6d9ce188a4501afc1b2b25", 
										"5d235bb686f77443f4331278", 
										"59fafd4b86f7745ca07e1232", 
										"590c60fc86f77412b13fddcf", 
										"567143bf4bdc2d1a0f8b4567", 
										"5c093db286f7740a1b2617e3", 
										"619cbf7d23893217ec30b689", 
										"619cbf9e0a7c3a1a2731940a",
										"62a09d3bcf4a99369e262447"
			]
			const Size = [
				Cases.MoneyCase,
				Cases.SimpleWallet,
				Cases.WZWallet,
				Cases.GrenadeCase,
				Cases.ItemsCase,
				Cases.WeaponCase,
				Cases.LuckyScav,
				Cases.AmmunitionCase,
				Cases.MagazineCase,
				Cases.DogtagCase,
				Cases.MedicineCase,
				Cases.ThiccItemsCase,
				Cases.ThiccWeaponCase,
				Cases.SiccCase,
				Cases.Keytool,
				Cases.DocumentsCase,
				Cases.PistolCase,
				Cases.Holodilnick,
				Cases.InjectorCase,
				Cases.KeycardHolderCase,
				Cases.GKeychain
			]
			const SecVsize = [SecCon.AlphaVSize,
				SecCon.KappaVSize,
				SecCon.BetaVSize,
				SecCon.EpsilonVSize,
				SecCon.GammaVSize,
				SecCon.WaistPouchVSize,
				SecCon.DevVSize
			];
			const SecHsize = [SecCon.AlphaHSize,
				SecCon.KappaHSize,
				SecCon.BetaHSize,
				SecCon.EpsilonHSize,
				SecCon.GammaHSize,
				SecCon.WaistPouchHSize,
				SecCon.DevHSize
			];
			const Filts = [
				Cases.MoneyCase.Filter,
				Cases.SimpleWallet.Filter,
				Cases.WZWallet.Filter,
				Cases.GrenadeCase.Filter,
				Cases.ItemsCase.Filter,
				Cases.WeaponCase.Filter,
				Cases.LuckyScav.Filter,
				Cases.AmmunitionCase.Filter,
				Cases.MagazineCase.Filter,
				Cases.DogtagCase.Filter,
				Cases.MedicineCase.Filter,
				Cases.ThiccItemsCase.Filter,
				Cases.ThiccWeaponCase.Filter,
				Cases.SiccCase.Filter,
				Cases.Keytool.Filter,
				Cases.DocumentsCase.Filter,
				Cases.PistolCase.Filter,
				Cases.Holodilnick.Filter,
				Cases.InjectorCase.Filter,
				Cases.KeycardHolderCase.Filter,
				Cases.GKeychain.Filter
			]
			for (let SecConts in SecConID)
			{
				items[SecConID[SecConts]]._props.Grids[0]._props["cellsV"] = SecVsize[SecConts];
				items[SecConID[SecConts]]._props.Grids[0]._props["cellsH"] = SecHsize[SecConts];
			}
			for (let Case in CasesID)
			{
				items[CasesID[Case]]._props.Grids[0]._props["cellsV"] = Size[Case].VSize;
				items[CasesID[Case]]._props.Grids[0]._props["cellsH"] = Size[Case].HSize;
			}
			//Filters
			for (let Filters in Filts)
			{
				if (Filts[Filters]) // To check whether checkmark is true or false
				{
					items[CasesID[Filters]]._props.Grids[0]._props.filters = [];
				}
			}
		}
		//############## ITEMS SECTION ################
		if (Config.Items.EnableItems)
		{
			let PistolRounds = ["9x19","9x18pm","9x21","762x25tt","46x30","57x28","1143x23","9x33r","10MM","40SW","357SIG","9MM","45ACP","50AE","380AUTO"]; //Rounds 
			let ShotgunRounds = ["12x70","20x70","23x75"];
			let RifleRounds = ["762x39", "545x39","556x45","9x39","366","762x35","300blk","ATL15","GRENDEL","50WLF","KURZ"];
			let MarksmanRounds = ["762x51","68x51","762х54R","762x54r","86x70","127x55","277","BMG"];
			//Price Modifier
			for (const item in DB.templates.handbook.Items)
			{
				if (DB.templates.handbook.Items[item].ParentId !== "5b5f78b786f77447ed5636af" && DB.templates.handbook.Items[item].Price != null)
				{
					DB.templates.handbook.Items[item].Price = (DB.templates.handbook.Items[item].Price * Config.Items.ItemPriceMult)
				}
			}
			//Loading-Unloading rounds in a magazine
			globals.BaseUnloadTime = globals.BaseUnloadTime * Config.Items.AmmoLoadSpeed;
			globals.BaseLoadTime = globals.BaseLoadTime * Config.Items.AmmoLoadSpeed;
			//Signal Pistol into Special slots
			if(Config.Items.AddSignalPistolToSpec)
			{						
				if(items["CustomPocket"] !== undefined)
					{
						for (let specialslots in items["CustomPocket"]._props.Slots)
						{
							items["CustomPocket"]._props.Slots[specialslots]._props.filters[0].Filter.push("620109578d82e67e7911abf2")
						}
					}
					else
					{
						for (let specialslots in items["627a4e6b255f7527fb05a0f6"]._props.Slots)
						{
							items["627a4e6b255f7527fb05a0f6"]._props.Slots[specialslots]._props.filters[0].Filter.push("620109578d82e67e7911abf2")
						}
					}
			}
			for (const id in items)
			{
				let base = items[id]
				//Examining time
				if(base._type == "Item" && base._props.ExamineTime !== undefined)
				{
					EditSimpleItemData(id, "ExamineTime", Config.Items.ExamineTime);
				}
				//Heat Factor Multiplier
				if (base._props.HeatFactor !== undefined)
				{
					EditSimpleItemData(id, "HeatFactor",parseFloat(base._props.HeatFactor * Config.Items.HeatFactor).toFixed(3));
				}
				//Dropping items in raid rather deleting them
				if(base._type == "Item" &&  base._props.DiscardLimit !== undefined && Config.Items.RaidDrop)
				{
					EditSimpleItemData(id, "DiscardLimit", -1);
				}
				//Turns off weapon overheat
				if (base._props.AllowOverheat !== undefined && Config.Items.WeaponHeatOff)
				{
					EditSimpleItemData(id, "AllowOverheat", false);
				}
				//Malfunction chance
				if ((base._parent == "5447b5cf4bdc2d65278b4567" || base._parent == "5447b6254bdc2dc3278b4568" || items[id]._parent == "5447b5f14bdc2d61278b4567" || items[id]._parent == "5447bed64bdc2d97278b4568" || items[id]._parent == "5447b6094bdc2dc3278b4567" || items[id]._parent == "5447b5e04bdc2d62278b4567" || items[id]._parent == "5447b6194bdc2d67278b4567") && items[id]._props.BaseMalfunctionChance !== undefined)
				{
					EditSimpleItemData(id,"BaseMalfunctionChance",parseFloat(base._props.BaseMalfunctionChance * Config.Items.MalfunctChanceMult).toFixed(4));
				}
				if (base._parent == "5448bc234bdc2d3c308b4569" && base._props.MalfunctionChance !== undefined)
				{
					EditSimpleItemData(id,"MalfunctionChance", parseFloat(base._props.MalfunctionChance* Config.Items.MalfunctChanceMult).toFixed(3));
				}
				//Misfire chance
				if (base._parent == "5485a8684bdc2da71d8b4567" && base._props.MisfireChance !== undefined)
				{
					EditSimpleItemData(id,"MisfireChance", parseFloat(base._props.MisfireChance * Config.Items.MisfireChance).toFixed(3));
				}
				//Examine all items
				if (Config.Items.AllExaminedItems && Config.Items.ExamineKeys)
				{
					EditSimpleItemData(id, "ExaminedByDefault", true);
				}
				//Examine all items EXCEPT KEYS, checking for parent IDs of mechanical, keycards and keys in general just in case.
				else if(Config.Items.AllExaminedItems && base._parent !== "5c99f98d86f7745c314214b3" && base.parent !== "5c164d2286f774194c5e69fa" && base.parent !== "543be5e94bdc2df1348b4568")
				{
					EditSimpleItemData(id, "ExaminedByDefault", true);
				}
				//Change the weight
				if (base._type !== "Node" && base._type !== undefined && (base.parent !== "557596e64bdc2dc2118b4571" || base._parent !== "55d720f24bdc2d88028b456d"))
				{
					EditSimpleItemData(id, "Weight", parseFloat(Config.Items.WeightChanger * base._props.Weight).toFixed(3));
				}
				if (Config.Items.NoGearPenalty)
				{
					if (base._props.mousePenalty)
					{
						EditSimpleItemData(id, "mousePenalty", 0)
					}
					if (base._props.weaponErgonomicPenalty)
					{
						EditSimpleItemData(id, "weaponErgonomicPenalty", 0)
					}
					if (base._props.speedPenaltyPercent)
					{
						EditSimpleItemData(id, "speedPenaltyPercent", 0)
					}
				}
				//Ammo Stacks
				if (base._parent.includes("5485a8684bdc2da71d8b4567") && Config.Items.AmmoSwitch)
				{
					let str = base._name//.split("_", 2)
					if (AmmoFilter(PistolRounds,str))
					{
						EditSimpleItemData(id, "StackMaxSize", Config.Items.AmmoStacks.PistolRound)
					}
					else if(AmmoFilter(ShotgunRounds,str))
					{
						EditSimpleItemData(id, "StackMaxSize", Config.Items.AmmoStacks.ShotgunRound)
					}
					else if(AmmoFilter(RifleRounds,str))
					{
						EditSimpleItemData(id, "StackMaxSize", Config.Items.AmmoStacks.RifleRound)
					}
					else if(AmmoFilter(MarksmanRounds,str))
					{
						EditSimpleItemData(id, "StackMaxSize", Config.Items.AmmoStacks.MarksmanRound)
					}
				}
				//Change money stacks
				if (base._parent == "543be5dd4bdc2deb348b4569" && base._props.StackMaxSize !== undefined) 
				{
					if(Config.Items.BSGCashStack)
					{
						if( base._id == "569668774bdc2da2298b4568" || base._id == "5696686a4bdc2da3298b456a")
						{
						EditSimpleItemData(id, "StackMaxSize", (Config.Items.RubStack / 10).toFixed()); //If it's Euros or Dollars - make stacks smaller by one digit, to fit live settings to a degree
						}
						else
						{
							EditSimpleItemData(id, "StackMaxSize", Config.Items.RubStack);
						}
					}
					else
					{
						switch(base._id)
						{
							case "569668774bdc2da2298b4568":
								EditSimpleItemData(id, "StackMaxSize", Config.Items.EuroStack);
								break;
							case "5696686a4bdc2da3298b456a":
								EditSimpleItemData(id, "StackMaxSize", Config.Items.DollarStack);
								break;
							default:
								EditSimpleItemData(id, "StackMaxSize", Config.Items.RubStack);
								break;
						}
					}
				}
				//Allow armored rigs with armors
				if (Config.Items.EquipRigsWithArmors && base._props.BlocksArmorVest !== undefined)
				{
					EditSimpleItemData(id, "BlocksArmorVest", false);
				}
				//Remove filters
				if (Config.Items.RemoveSecureContainerFilters && base._parent == "5448bf274bdc2dfc2f8b456a" && base._props.Grids[0]._props.filters !== undefined)
				{
					base._props.Grids[0]._props.filters = [];
				}
				if (Config.Items.RemoveBackpacksRestrictions && base._parent == "5448e53e4bdc2d60728b4567" && base._props.Grids[0]._props.filters !== undefined)
				{
					base._props.Grids[0]._props.filters = [];
				}
				//Change items experience gain
				if (base._props.LootExperience !== undefined)
				{
					let calculation = Math.round(base._props.LootExperience * Config.Items.LootExp);
					EditSimpleItemData(id, "LootExperience", calculation);
				}
				if (base._props.ExamineExperience !== undefined)
				{
					let calculation = Math.round(base._props.ExamineExperience * Config.Items.ExamineExp);
					EditSimpleItemData(id, "ExamineExperience", calculation);
				}
				let MarkedKeys = ["5780cf7f2459777de4559322", "5d80c60f86f77440373c4ece", "5d80c62a86f7744036212b3f", "5ede7a8229445733cb4c18e2","63a3a93f8a56922e82001f5d", "64ccc25f95763a1ae376e447","62987dfc402c7f69bf010923"];
				//Remove the keys usage - God i hate how i wrote it
				if (Config.Items.RemoveKeysUsageNumber && (base._parent == "5c99f98d86f7745c314214b3" || base._parent == "5c164d2286f774194c5e69fa") && base._props.MaximumNumberOfUsage !== undefined)
				{
					if(base._props.MaximumNumberOfUsage == 1 && !Config.Items.AvoidSingleKeys)
					{
						base._props.MaximumNumberOfUsage = 0
					}
					if(MarkedKeys.includes(base._id) && !Config.Items.AvoidMarkedKeys)
					{
						base._props.MaximumNumberOfUsage = 0
					}
					if(!(MarkedKeys.includes(base._id)) && base._props.MaximumNumberOfUsage !== 1)
					{
						base._props.MaximumNumberOfUsage = 0
					}
				} 
				if(base._parent == "5c99f98d86f7745c314214b3" && base._props.MaximumNumberOfUsage != 0)
				{
					base._props.MaximumNumberOfUsage *= Config.Items.KeyUseMult
					if(base._props.MaximumNumberOfUsage > Config.Items.KeyDurabilityThreshold)
					{
						base._props.MaximumNumberOfUsage = Config.Items.KeyDurabilityThreshold
					}
				}
				if(base._parent == "5c164d2286f774194c5e69fa" && base._props.MaximumNumberOfUsage != 0)
				{
					base._props.MaximumNumberOfUsage *= Config.Items.KeycardUseMult
					if(base._props.MaximumNumberOfUsage > Config.Items.KeyDurabilityThreshold)
					{
						base._props.MaximumNumberOfUsage = Config.Items.KeyDurabilityThreshold
					}
				}
			}
			if (Config.Items.SMGToHolster)
			{
			items["55d7217a4bdc2d86028b456d"]._props.Slots[2]._props.filters[0].Filter.push("5447b5e04bdc2d62278b4567");
			}
			if (Config.Items.PistolToMain)
			{
			items["55d7217a4bdc2d86028b456d"]._props.Slots[0]._props.filters[0].Filter.push("5447b5cf4bdc2d65278b4567","617f1ef5e8b54b0998387733");
			items["55d7217a4bdc2d86028b456d"]._props.Slots[1]._props.filters[0].Filter.push("5447b5cf4bdc2d65278b4567","617f1ef5e8b54b0998387733");
			}
			if (Config.Items.RemoveRaidRestr)
			{
				globals.RestrictionsInRaid = []
			}
			if (Config.Items.IDChanger)
			{
				//Edit item properties, i know it looks stupid, but hey - it works and i like it.
				//Second revision, i've created a monster. now you can literally alter any field/filter/grid with it.
				//Third revision...I feel sad looking at this, this time is probably final, 10 fields including filters, less funcs this time
				// switch make it slightly effective in use comparing to previous version
				if (Config.Items.IDBox.length > 0)
				{
					Logger.info("SVM: Custom Properties enabled")
					try
					{
						let Array = Config.Items.IDBox.split("\r\n")
						for (let k in Array)
						{
							let fin = Array[k].split(":")
							Logger.info(fin)
							switch (fin.length)
							{
							case 3:
								if(fin[2].includes(",") || fin[2].includes("["))
								{
									items[fin[0]]._props[fin[1]] = Filter(fin[2])
								}
								else if (isNaN(fin[2]) && fin[2] !== 'true' && fin[2] !== 'false')
								{
									items[fin[0]]._props[fin[1]] = fin[2]
								}
								else
								{
									items[fin[0]]._props[fin[1]] = JSON.parse(fin[2])
								}
								break;
							case 4:
								if(fin[3].includes(",") || fin[3].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]] = Filter(fin[3])
								}
								else if (isNaN(fin[3]) && fin[3] !== 'true' && fin[3] !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]] = fin[3]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]] = JSON.parse(fin[3])
								}
								break;
							case 5:
								if(fin[4].includes(",") || fin[4].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]] = Filter(fin[4])
								}
								else if (isNaN(fin[4]) && fin[4] !== 'true' && fin[4] !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]] = fin[4]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]] = JSON.parse(fin[4])
								}
								break;
							case 6:
								if(fin[5].includes(",") || fin[5].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]] = Filter(fin[5])
								}
								else if (isNaN((fin[5])) && (fin[5]) !== 'true' && (fin[5]) !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]] = fin[5]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]] = JSON.parse(fin[5])
								}
								break;
							case 7:
								if(fin[6].includes(",") || fin[6].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]] = Filter(fin[6])
								}
								else if (isNaN(fin[6]) && fin[6] !== 'true' && fin[6] !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]] = fin[6]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]] = JSON.parse(fin[6])
								}
								break;
							case 8:
								if(fin[7].includes(",") || fin[7].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]] = Filter(fin[7])
								}
								else if (isNaN(fin[7]) && fin[7] !== 'true' && fin[7] !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]] = fin[7]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]]  = JSON.parse(fin[7])
								}
								break;
							case 9:
								if(fin[8].includes(",") || fin[8].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]] = Filter(fin[8])
								}
								else if (isNaN(fin[8]) && fin[8] !== 'true' && fin[8] !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]] = fin[8]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]] = JSON.parse(fin[8])
								}
								break;
							case 10:
								if(fin[8].includes(",") || fin[8].includes("["))
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]][fin[8]] = Filter(fin[9])
								}
								else if (isNaN(fin(9)) && fin(9) !== 'true' && fin(9) !== 'false')
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]][fin[8]]= fin[9]
								}
								else
								{
									items[fin[0]]._props[fin[1]][fin[2]][fin[3]][fin[4]][fin[5]][fin[6]][fin[7]][fin[8]] = JSON.parse(fin[9])
								}
								break;
						 	default:
							break;
							}
							//items[id]._props[extstructure][array][intstructure][data] = JSON.parse(value)
						}
						Logger.success("SVM: Custom properties successfully loaded")
					}
					catch (e)
					{
						Logger.error("SVM: Custom properties failed to load, error of the code:" + e)
					}
				}
			}
		}
		//############## PLAYER SECTION ###############
		if (Config.Player.EnablePlayer)
		{
			//Skill box
			globals.SkillsSettings.SkillProgressRate = Config.Player.SkillProgMult;
			globals.SkillsSettings.WeaponSkillProgressRate = Config.Player.WeaponSkillMult;
			//health after raid box
			Health.healthMultipliers.death = Config.Player.DiedHealth.Health_death;
			Health.healthMultipliers.blacked = Config.Player.DiedHealth.Health_blacked;
			Health.save.health = Config.Player.DiedHealth.Savehealth;
			Health.save.effects = Config.Player.DiedHealth.Saveeffects;
			// skill eff box
			globals.SkillMinEffectiveness = Config.Player.Skills.SkillMinEffect;
			globals.SkillFatiguePerPoint = Config.Player.Skills.SkillFatiguePerPoint;
			globals.SkillFreshEffectiveness = Config.Player.Skills.SkillFreshEffect;
			globals.SkillFreshPoints = Config.Player.Skills.SkillFPoints;
			globals.SkillPointsBeforeFatigue = Config.Player.Skills.SkillPointsBeforeFatigue;
			globals.SkillFatigueReset = Config.Player.Skills.SkillFatigueReset;
			//############## Player level XP box ############## 
			globals.exp.kill.victimBotLevelExp = Config.Player.CharXP.ScavKill;
			globals.exp.kill.victimLevelExp = Config.Player.CharXP.PMCKill;
			globals.exp.kill.botHeadShotMult = Config.Player.CharXP.ScavHMult;
			globals.exp.kill.pmcHeadShotMult = Config.Player.CharXP.PMCHMult
			//############## END OF RAID Box ############## 
			globals.exp.match_end.runnerMult = Config.Player.RaidMult.Runner
			globals.exp.match_end.miaMult = Config.Player.RaidMult.MIA
			globals.exp.match_end.survivedMult = Config.Player.RaidMult.Survived
			globals.exp.match_end.killedMult = Config.Player.RaidMult.Killed
			//Remove fall damage
			if (Config.Player.FallDamage)
			{
				globals.Health.Falling.SafeHeight = 200
				globals.Health.Falling.DamagePerMeter = 0
			}
			//Change stamina (unlimited or no)
			if (Config.Player.MaxStamina !== 100 && !Config.Player.UnlimitedStamina)
			{
				globals.Stamina.Capacity = Config.Player.MaxStamina;
			}
			else if (Config.Player.UnlimitedStamina)
			{
				globals.Stamina.Capacity = 500;
				globals.Stamina.BaseRestorationRate = 500;
				globals.Stamina.StaminaExhaustionCausesJiggle = false;
				globals.Stamina.StaminaExhaustionStartsBreathSound = false;
				globals.Stamina.StaminaExhaustionRocksCamera = false;
				globals.Stamina.SprintDrainRate = 0;
				globals.Stamina.JumpConsumption = 0;
				globals.Stamina.AimDrainRate = 0;
				globals.Stamina.SitToStandConsumption = 0;
			}
			globals.Health.Effects.Existence.HydrationLoopTime = (globals.Health.Effects.Existence.HydrationLoopTime / Config.Player.HydrationLoss)
			globals.Health.Effects.Existence.EnergyLoopTime = (globals.Health.Effects.Existence.EnergyLoopTime / Config.Player.EnergyLoss)
			globals.Health.Effects.Existence.DestroyedStomachEnergyTimeFactor = Config.Player.BlackStomach;
			globals.Health.Effects.Existence.DestroyedStomachHydrationTimeFactor = Config.Player.BlackStomach;
		}
		//############## HIDEOUT SECTION ##############
		if (Config.Hideout.EnableHideout)
		{
			//Change hideout fuel consumption
			hideout.settings.generatorFuelFlowRate *= Config.Hideout.FuelConsumptionRate;
			hideout.settings.generatorSpeedWithoutFuel *= Config.Hideout.NoFuelMult;
			//hideoutC.fuelDrainRateMultipler = Config.Hideout.FuelConsumptionRate;
			hideout.settings.airFilterUnitFlowRate *= Config.Hideout.AirFilterRate;
			hideout.settings.gpuBoostRate *= Config.Hideout.GPUBoostRate;
			//hideout.productions
			/*
			566abbc34bdc2d92178b4576:Grids:0:_props:cellsV:98
			5811ce572459770cba1a34ea:Grids:0:_props:cellsV:98
			5811ce662459770f6f490f32:Grids:0:_props:cellsV:98
			5811ce772459770e9e5f9532:Grids:0:_props:cellsV:98
			*/
			if(Config.Hideout.EnableStash)
			{
			items["566abbc34bdc2d92178b4576"]._props.Grids[0]._props.cellsV = Config.Hideout.Stash.StashLvl1
			items["5811ce572459770cba1a34ea"]._props.Grids[0]._props.cellsV = Config.Hideout.Stash.StashLvl2
			items["5811ce662459770f6f490f32"]._props.Grids[0]._props.cellsV = Config.Hideout.Stash.StashLvl3
			items["5811ce772459770e9e5f9532"]._props.Grids[0]._props.cellsV = Config.Hideout.Stash.StashLvl4
			}
			
			//Enable hideout fast constructions
			for (const data in hideout.areas)
			{
				let areaData = hideout.areas[data]
				for (const i in areaData.stages)
				{
					if (areaData.stages[i].constructionTime > 0)
					{
						areaData.stages[i].constructionTime = parseInt(areaData.stages[i].constructionTime * Config.Hideout.HideoutConstMult)
						if( areaData.stages[i].constructionTime < 1)
						{
							areaData.stages[i].constructionTime = 2
						}
					}
				}
			}
			//Enable fast hideout production
			for (const data in hideout.production)
			{
				let productionData = hideout.production[data];
				//Logger.info(productionData, "red")
				
				if (productionData._id == "5d5589c1f934db045e6c5492")
				{
					productionData.productionTime = Config.Hideout.WaterFilterTime * 60
					productionData.requirements[1].resource = Config.Hideout.WaterFilterRate
				}
				if (productionData._id == "5d5c205bd582a50d042a3c0e")
				{
					productionData.productionLimitCount = Config.Hideout.MaxBitcoins;
					productionData.productionTime = Config.Hideout.BitcoinTime * 60;
				}
				if (!productionData.continuous && productionData.productionTime >= 10)
				{
					if(productionData._id == "5d5c205bd582a50d042a3c0e")
					{
						Logger.error("CODE RED");
					}
					productionData.productionTime = parseInt(productionData.productionTime * Config.Hideout.HideoutProdMult)
				if( productionData.productionTime < 1)
					{
					productionData.productionTime = 2
					}
				}
			}
			//Scav cases modifications
				for (const scav in hideout.scavcase)
				{
					let caseData = hideout.scavcase[scav];
					if (caseData.ProductionTime >= 10)
					{
						caseData.ProductionTime = parseInt(caseData.ProductionTime * Config.Hideout.ScavCaseTime);
						if( caseData.ProductionTime < 1)
						{
							caseData.ProductionTime = 2
						}
					}
				}
				for (const scase in hideout.scavcase)
				{
					let caseData = hideout.scavcase[scase];
					if (caseData.Requirements[0].templateId == "5449016a4bdc2d6f028b456f" || caseData.Requirements[0].templateId == "5696686a4bdc2da3298b456a" || caseData.Requirements[0].templateId == "569668774bdc2da2298b4568")
					{
						caseData.Requirements[0].count = parseInt(caseData.Requirements[0].count * Config.Hideout.ScavCasePrice);
					}
				}
			//Remove construction requirements
			if (Config.Hideout.RemoveConstructionsRequirements || Config.Hideout.RemoveSkillRequirements || Config.Hideout.RemoveTraderLevelRequirements)
			{
				for (const data in hideout.areas)
				{
					let areaData = hideout.areas[data]
					//Logger.info(areaData.stages[1].requirements[1])
					for (const stage in areaData.stages)
					{
						
					if (areaData.stages[stage].requirements !== undefined && areaData.stages[stage].requirements !== "[]")
					{
						let rewriter = [];
						for(let req in areaData.stages[stage].requirements)//This is horrible
						{
								if (areaData.stages[stage].requirements[req].hasOwnProperty("templateId")  && !Config.Hideout.RemoveConstructionsRequirements)
								{
									rewriter.push(areaData.stages[stage].requirements[req])
								}
								else if (areaData.stages[stage].requirements[req].hasOwnProperty("skillName") && !Config.Hideout.RemoveSkillRequirements)
								{	
									rewriter.push(areaData.stages[stage].requirements[req])
								}
								else if (areaData.stages[stage].requirements[req].hasOwnProperty("traderId") && !Config.Hideout.RemoveTraderLevelRequirements)
								{
									rewriter.push(areaData.stages[stage].requirements[req])
								}
								else if (areaData.stages[stage].requirements[req].hasOwnProperty("areaType"))//Just for sanity check to avoid certain errors like building bitcoin farm while there is no generator.
								{
									rewriter.push(areaData.stages[stage].requirements[req])
								}

						}
						areaData.stages[stage].requirements = rewriter

					}
				}
				}
			}
		//Hideout regen menu
		globals.Health.Effects.Regeneration.BodyHealth.Head.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.Chest.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.Stomach.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.LeftArm.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.LeftLeg.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.RightArm.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.BodyHealth.RightLeg.Value *= Config.Hideout.Regeneration.HealthRegen
		globals.Health.Effects.Regeneration.Energy = Config.Hideout.Regeneration.EnergyRegen
		globals.Health.Effects.Regeneration.Hydration = Config.Hideout.Regeneration.HydrationRegen

		for (const data in hideout.areas)
		{
			let areaData = hideout.areas[data]
			for (const i in areaData.stages)
			{
				for (const x in areaData.stages[i].bonuses)
				{
					if (Config.Hideout.Regeneration.HideoutHydration && areaData.stages[i].bonuses[x].type == "HydrationRegeneration")
					{
						areaData.stages[i].bonuses[x].value = 0;
					}
					if (Config.Hideout.Regeneration.HideoutEnergy && areaData.stages[i].bonuses[x].type == "EnergyRegeneration")
					{
						areaData.stages[i].bonuses[x].value = 0;
					}
					if (Config.Hideout.Regeneration.HideoutHealth && areaData.stages[i].bonuses[x].type == "HealthRegeneration")
					{
						areaData.stages[i].bonuses[x].value = 0;
					}
				}
			}
		}
		}
		//############## RAIDS SECTION ################
		if (Config.Raids.EnableRaids)
		{
			//############## INRAID SECTION ##################
			Inraid.MIAOnRaidEnd = Config.Raids.RaidStartup.MIAEndofRaid;
			Inraid.raidMenuSettings.aiAmount = Config.Raids.RaidStartup.AIAmount;
			Inraid.raidMenuSettings.aiDifficulty = Config.Raids.RaidStartup.AIDifficulty;
			Inraid.raidMenuSettings.bossEnabled = Config.Raids.RaidStartup.EnableBosses;
			Inraid.raidMenuSettings.scavWars = Config.Raids.RaidStartup.ScavWars;
			Inraid.raidMenuSettings.taggedAndCursed = Config.Raids.RaidStartup.TaggedAndCursed;
			Inraid.save.loot = Config.Raids.RaidStartup.SaveLoot;
			Inraid.save.durability = Config.Raids.RaidStartup.SaveDurability;
			trader.fence.coopExtractGift.sendGift = !Config.Raids.Exfils.FenceGift;
			const Midcore = configServer.getConfig("aki-lostondeath");
			if(Config.Raids.SaveQuestItems)
			{
				Midcore.questItems = false;
			}
			if(Config.Raids.SandboxRemoveLevel)
			{
				locations["sandbox"].base.RequiredPlayerLevelMax = 20;
			}
			//Time acceleration
			WeatherValues.acceleration = Config.Raids.Timeacceleration
			//Deploy Window time
			globals.TimeBeforeDeployLocal = Config.Raids.RaidStartup.TimeBeforeDeployLocal
			//Always survived
			if (Config.Raids.NoRunThrough)
			{
				globals.exp.match_end.survived_exp_requirement = 0;
				globals.exp.match_end.survived_seconds_requirement = 0;
			}
			DB.locations["laboratory"].base.Insurance = Config.Raids.LabInsurance;
			//Remove labs entry keycard
			if (Config.Raids.Removelabkey)
			{
				locations["laboratory"].base.AccessKeys = []
			}
			
			if(Config.Raids.Exfils.ArmorExtract)
			{
				globals.RequirementReferences.Alpinist.splice(2,1)
			}
			if(Config.Raids.Exfils.GearExtract)
			{
				globals.RequirementReferences.Alpinist.splice(0,2)
			}
			//Remove extracts restrictions
				for (let i in locations)
				{
					if (i !== "base")
					{
						for (let x in locations[i].base.exits)
						{
							if (locations[i].base.exits[x].Name !== "EXFIL_Train" && (!locations[i].base.exits[x].Name.includes("lab") || locations[i].base.exits[x].Name == "lab_Vent") && locations[i].base.exits[x].Name !== "Saferoom Exfil")
							{//Ok, i feel dumb again, but i was in a rush ok?

								if(Config.Raids.Exfils.GearExtract && Config.Raids.Exfils.ArmorExtract && locations[i].base.exits[x].PassageRequirement == "Reference" )
								{
									FreeExit(locations[i].base.exits[x])
								}
								if(Config.Raids.Exfils.NoBackpack && locations[i].base.exits[x].PassageRequirement == "Empty")
								{
									FreeExit(locations[i].base.exits[x])
								}

								if (locations[i].base.exits[x].PassageRequirement == "TransferItem")
								{
									locations[i].base.exits[x].ExfiltrationTime = Config.Raids.Exfils.CarExtractTime;
									switch (i)
									{
										case "woods":
											if(Config.Raids.Exfils.CarWoods !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CarWoods;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "interchange":
											if(Config.Raids.Exfils.CarInterchange !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CarInterchange;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "bigmap":
											if(Config.Raids.Exfils.CarCustoms !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CarCustoms;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "tarkovstreets":
											if(Config.Raids.Exfils.CarStreets !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CarStreets;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "lighthouse":
											if(Config.Raids.Exfils.CarLighthouse !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CarLighthouse;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "shoreline":
												if(Config.Raids.Exfils.CarShoreline !== 0)
												{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CarShoreline;
												}
												else
												{
													FreeExit(locations[i].base.exits[x])
												}
												break;
										case "sandbox":
											if(Config.Raids.Exfils.CarSandbox !== 0)
											{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CarSandbox;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
											default:
											break;
									}
								}
								if(Config.Raids.Exfils.CoopPaid && locations[i].base.exits[x].PassageRequirement == "ScavCooperation")
								{
									locations[i].base.exits[x].PassageRequirement = "TransferItem";
									locations[i].base.exits[x].ExfiltrationType = "SharedTimer";
									locations[i].base.exits[x].Id = "5449016a4bdc2d6f028b456f";
									locations[i].base.exits[x].PlayersCount = 0;
									locations[i].base.exits[x].RequirementTip = "EXFIL_Item";
									switch (i)
									{
										case "woods":
											if(Config.Raids.Exfils.CoopPaidWoods !== 0)
											{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidWoods;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "tarkovstreets":
											if(Config.Raids.Exfils.CoopPaidStreets !== 0)
											{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidStreets;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "interchange":
											if(Config.Raids.Exfils.CoopPaidInterchange !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidInterchange;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "lighthouse":
											if(Config.Raids.Exfils.CoopPaidLighthouse !== 0)
											{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidLighthouse;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "rezervbase":
											if(Config.Raids.Exfils.CoopPaidReserve !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidReserve;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
										case "shoreline":
											if(Config.Raids.Exfils.CoopPaidShoreline !== 0)
											{
											locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidShoreline;
											}
											else
											{
												FreeExit(locations[i].base.exits[x])
											}
											break;
											case "sandbox":
												if(Config.Raids.Exfils.CoopPaidSandbox !== 0)
												{
												locations[i].base.exits[x].Count = Config.Raids.Exfils.CoopPaidSandbox;
												}
												else
												{
													FreeExit(locations[i].base.exits[x])
												}
												break;
											default:
												break;
									}
								}

								if(Config.Raids.Exfils.FreeCoop && locations[i].base.exits[x].PassageRequirement == "ScavCooperation")
								{
									FreeExit(locations[i].base.exits[x])
								}

								/*    "EntryPoints": "House,Old Station",
									"ExfiltrationTime": 60,
									"ExfiltrationType": "SharedTimer",
									"PassageRequirement": "TransferItem",
									"RequirementTip": "EXFIL_Item" */	
							}
						}
					}
				}
			//Make all extractions available to extract
			if (Config.Raids.Exfils.ChanceExtracts)
			{
				for (let i in locations)
				{
					if (i !== "base")
					{
						for (let x in locations[i].base.exits)
						{
							if (locations[i].base.exits[x].Name !== "EXFIL_Train")
							{
								locations[i].base.exits[x].Chance = 100;
							}
						}
					}
				}
			}
			//Extend raids time
			if (Config.Raids.RaidTime != 0)
			{
				for (let map in locations)
				{
					if (map !== "base") 
					{
						if (isJSONValueDefined(locations[map].base.exit_access_time)) 
						{
							locations[map].base.exit_access_time += Config.Raids.RaidTime
						}
						if (isJSONValueDefined(locations[map].base.EscapeTimeLimit)) 
						{
							locations[map].base.EscapeTimeLimit += Config.Raids.RaidTime
						}    
					}
				}
			}
			//Make all extractions of the map available regardless of the infill
			if (Config.Raids.Exfils.ExtendedExtracts)
			{
				for (let map in locations)
				{
					switch (map)
					{
						case "base":
							break;
						case "bigmap":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "Customs,Boiler Tanks"
							}
							break;
						case "interchange":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "MallSE,MallNW"
							}
							break;
						case "shoreline":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "Village,Riverside"
							}
							break;
						case "woods":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "House,Old Station"
							}
							break;
						case "lighthouse":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "Tunnel,North"
							}
							break;
						case "tarkovstreets":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "E1_2,E6_1,E2_3,E3_4,E4_5,E5_6,E6_1"
							}
							break;
						case "sandbox":
							for (const extract in locations[map].base.exits)
							{
								locations[map].base.exits[extract].EntryPoints = "west,east"
							}
							break;
								
						default:
							break;
					}
				}
			}
			 if(Config.Raids.RaidEvents.Christmas || Config.Raids.RaidEvents.SnowEvent || Config.Raids.RaidEvents.Halloween)
			 {
			 	globals.EventType = [];
				 globals.EventType = ["None"];
			 }
			if (Config.Raids.RaidEvents.Christmas)//I REALLY, REALLY NEED TO MAKE IT INTO A METHOD
			{
				globals.EventType.push("Christmas");

				// Seasons.events[1].startDay ="1"
				// Seasons.events[1].startMonth ="1"
				// Seasons.events[1].endDay ="29"
				// Seasons.events[1].endMonth ="12"
				// Seasons.events[2].startDay ="1"
				// Seasons.events[2].startMonth ="1"
				// Seasons.events[2].endDay ="29"
				// Seasons.events[2].endMonth ="12"
			}
			 if (Config.Raids.RaidEvents.SnowEvent)
			 {
				WeatherValues.forceWinterEvent = true;
			 	// Seasons.events[3].startDay ="1"
			 	// Seasons.events[3].startMonth ="1"
			 	// Seasons.events[3].endDay ="29"
			 	// Seasons.events[3].endMonth ="12"
			 }
			if (Config.Raids.RaidEvents.Halloween)
			{
				globals.EventType.push("Halloween");
				globals.EventType.push("HalloweenIllumination");
				// Seasons.events[0].startDay ="1"
				// Seasons.events[0].startMonth ="1"
				// Seasons.events[0].endDay ="29"
				// Seasons.events[0].endMonth ="12"
			}
			if (Config.Raids.RaidEvents.KillaFactory)
			{
				const KillaWave = CreateBoss("bossKilla", Config.Raids.RaidEvents.KillaFactoryChance, "followerBully", 0, locations["factory4_day"].base.OpenZones)
				locations["factory4_day"].base.BossLocationSpawn.push(KillaWave)
				locations["factory4_night"].base.BossLocationSpawn.push(KillaWave)
			}
			if (Config.Raids.RaidEvents.BossesOnReserve)
			{
				let BossWave = CreateBoss("bossKilla", 100, "followerBully", 0, locations["rezervbase"].base.OpenZones)
				locations["rezervbase"].base.BossLocationSpawn.push(BossWave)
				BossWave = CreateBoss("bossBully", 100, "followerBully", 4, locations["rezervbase"].base.OpenZones)
				locations["rezervbase"].base.BossLocationSpawn.push(BossWave)
				BossWave = CreateBoss("bossKojaniy", 100, "followerKojaniy", 2, locations["rezervbase"].base.OpenZones)
				locations["rezervbase"].base.BossLocationSpawn.push(BossWave)
				BossWave = CreateBoss("bossSanitar", 100, "followerSanitar", 2, locations["rezervbase"].base.OpenZones)
				locations["rezervbase"].base.BossLocationSpawn.push(BossWave)
				if (Config.Raids.RaidEvents.IncludeTagilla)
				{
					BossWave = CreateBoss("bossTagilla", 100, "followerBully", 0, locations["rezervbase"].base.OpenZones)
					locations["rezervbase"].base.BossLocationSpawn.push(BossWave)
				}
			}	
			if(Config.Raids.RaidEvents.BossesOnCustoms)
			{
				for( let bosses in locations["bigmap"].base.BossLocationSpawn)
				{
					if (locations["bigmap"].base.BossLocationSpawn[bosses].BossName == "bossBully")
					{
						locations["bigmap"].base.BossLocationSpawn[bosses].BossChance = 100;
					}
				}
				let BossWave = CreateBoss("bossKilla", 100, "followerBully", 0, "ZoneOldAZS")
				locations["bigmap"].base.BossLocationSpawn.push(BossWave)

				BossWave = CreateBoss("bossKojaniy", 100, "followerKojaniy", 2, "ZoneFactoryCenter")
				locations["bigmap"].base.BossLocationSpawn.push(BossWave)

				BossWave = CreateBoss("bossSanitar", 100, "followerSanitar", 2,  "ZoneGasStation")
				locations["bigmap"].base.BossLocationSpawn.push(BossWave)

				BossWave = CreateBoss("bossTagilla", 100, "followerBully", 0,  "ZoneOldAZS")
				locations["bigmap"].base.BossLocationSpawn.push(BossWave)

				const Glukhar = {
					"BossName": "bossGluhar",
					"BossChance": 100,
					"BossZone": "ZoneScavBase",
					"BossPlayer": false,
					"BossDifficult": "normal",
					"BossEscortType": "followerGluharAssault",
					"BossEscortDifficult": "normal",
					"BossEscortAmount": "0",
					"Time": -1,
					"TriggerId": "",
					"TriggerName": "",
					"Supports": [
					{
						"BossEscortType": "followerGluharAssault",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					},
					{
						"BossEscortType": "followerGluharSecurity",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					},
					{
						"BossEscortType": "followerGluharScout",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					}]
				}
				locations["bigmap"].base.BossLocationSpawn.push(Glukhar)

			}
			if (Config.Raids.RaidEvents.GoonsFactory)
			{
				const GoonsFac = {
					"BossChance": Config.Raids.RaidEvents.GoonsFactoryChance,
					"BossDifficult": "normal",
					"BossEscortAmount": "2",
					"BossEscortDifficult": "normal",
					"BossEscortType": "exUsec",
					"BossName": "bossKnight",
					"BossPlayer": false,
					"BossZone": "BotZone",
					"RandomTimeSpawn": true,
					"Supports": [
					  {
						"BossEscortAmount": "1",
						"BossEscortDifficult": [
						  "normal"
						],
						"BossEscortType": "followerBigPipe"
					  },
					  {
						"BossEscortAmount": "1",
						"BossEscortDifficult": [
						  "normal"
						],
						"BossEscortType": "followerBirdEye"
					  },
					  {
						"BossEscortAmount": "0",
						"BossEscortDifficult": [
						  "normal"
						],
						"BossEscortType": "followerGluharScout" //Don't ask, took straight from location data, it's the same for Customs and Woods.
					  }
					],
					"Time": -1
				}
				locations["factory4_day"].base.BossLocationSpawn.push(GoonsFac)
				locations["factory4_night"].base.BossLocationSpawn.push(GoonsFac)
			}
			if (Config.Raids.RaidEvents.GlukharLabs)
			{
				const Glukhar = {
					"BossName": "bossGluhar",
					"BossChance": 43,
					"BossZone": "BotZoneFloor1,BotZoneFloor2",
					"BossPlayer": false,
					"BossDifficult": "normal",
					"BossEscortType": "followerGluharAssault",
					"BossEscortDifficult": "normal",
					"BossEscortAmount": "0",
					"Time": -1,
					"TriggerId": "",
					"TriggerName": "",
					"Supports": [
					{
						"BossEscortType": "followerGluharAssault",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					},
					{
						"BossEscortType": "followerGluharSecurity",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					},
					{
						"BossEscortType": "followerGluharScout",
						"BossEscortDifficult": ["normal"],
						"BossEscortAmount": "2"
					}]
				}
				//Glukhar.BossZone = locations["laboratory"].base.OpenZones
				locations["laboratory"].base.BossLocationSpawn.push(Glukhar)
			}
				for (let i in locations)//Bloodhounds events spawn chance - this is bad solution, but i made it on a quick hand, not sure this event lasts either.
				{
					if (i !== "base" && locations[i].base.BossLocationSpawn)
					{
						for (let x in locations[i].base.BossLocationSpawn)
						{

							if(locations[i].base.BossLocationSpawn[x].BossName == "arenaFighterEvent" && i == "bigmap")
							{
								locations[i].base.BossLocationSpawn[x].BossChance = Config.Raids.RaidEvents.HoundsCustoms
							}
							if(locations[i].base.BossLocationSpawn[x].BossName == "arenaFighterEvent" && i == "woods")
							{
								locations[i].base.BossLocationSpawn[x].BossChance = Config.Raids.RaidEvents.HoundsWoods
							}
							if(locations[i].base.BossLocationSpawn[x].BossName == "arenaFighterEvent" && i == "shoreline")
							{
								locations[i].base.BossLocationSpawn[x].BossChance = Config.Raids.RaidEvents.HoundsShoreline
							}
						}
					}
				}

		}
		//############## TRADERS SECTION ##############
		if (Config.Traders.EnableTraders)
		{				
			trader.fence.assortSize = Config.Traders.Fence.AmountOnSale;
			trader.fence.discountOptions.assortSize = Config.Traders.Fence.PremiumAmountOnSale;
			trader.fence.weaponPresetMinMax.min = Config.Traders.Fence.PresetCount;
			trader.fence.weaponPresetMinMax.max = Config.Traders.Fence.PresetCount;

			trader.fence.presetPriceMult = Config.Traders.Fence.PresetMult;
			trader.fence.itemPriceMult = Config.Traders.Fence.PriceMult;
			for (let stock in trader.updateTime)//useless cycle for now, will remove later.
			{
				if (trader.updateTime[stock]._name == "fence" && trader.updateTime[stock].seconds.min != undefined)
				{
					trader.updateTime[stock].seconds.min = Config.Traders.Fence.StockTime_Min*60;
					trader.updateTime[stock].seconds.max = Config.Traders.Fence.StockTime_Max*60;
				}
			}
			trader.fence.weaponDurabilityPercentMinMax.current.min = Config.Traders.Fence.GunDurability_Min
			trader.fence.weaponDurabilityPercentMinMax.current.max = Config.Traders.Fence.GunDurability_Max
			trader.fence.armorMaxDurabilityPercentMinMax.current.min = Config.Traders.Fence.ArmorDurability_Min
			trader.fence.armorMaxDurabilityPercentMinMax.current.max = Config.Traders.Fence.ArmorDurability_Max
			if(Config.Traders.Fence.Blacklist == "")
			{
				Logger.error("SVM: Do not leave Fence blacklist empty, Fence blacklist override is disabled.")
			}
			else if(Config.Traders.Fence.Blacklist.includes("\r\n"))
			{
			let BlacklistArray = Config.Traders.Fence.Blacklist.split("\r\n");
			trader.fence.blacklist = BlacklistArray
			}
			else if(Config.Traders.Fence.Blacklist !== null)
			{
				trader.fence.blacklist = Config.Traders.Fence.Blacklist
			}

			globals.TradingSettings.BuyoutRestrictions.MinDurability =  Config.Traders.MinDurabSell / 100
			Quest.redeemTime = Config.Traders.QuestRedeemTime;
			trader.purchasesAreFoundInRaid = Config.Traders.FIRTrade;
			
			const Mark = Config.Traders.TraderMarkup;
			const MarkArray = [Mark.Prapor,
				Mark.Therapist,
				Mark.Fence,
				Mark.Skier,
				Mark.Peacekeeper,
				Mark.Mechanic,
				Mark.Ragman,
				Mark.Jaeger
			]
			let i = 0;
			for (let CurTrader in traders)
			{
				if (CurTrader !== "ragfair" && (CurTrader == "5a7c2eca46aef81a7ca2145d" || CurTrader == "5ac3b934156ae10c4430e83c" || CurTrader == "5c0647fdd443bc2504c2d371" || CurTrader == "54cb50c76803fa8b248b4571" || CurTrader == "54cb57776803fa99248b456e" || CurTrader == "579dc571d53a0658a154fbec" || CurTrader == "5935c25fb3acc3127c3d8cd9" || CurTrader == "58330581ace78e27b8b10cee"))
				{
					for (let level in traders[CurTrader].base.loyaltyLevels)
					{
						traders[CurTrader].base.loyaltyLevels[level].buy_price_coef = 100 - MarkArray[i]
					}
					i++
				}
			}
			//Enable all the quests
			if (Config.Traders.AllQuestsAvailable)
			{
				for (let id in Quests)
				{
					let QuestData = Quests[id]
					QuestData.conditions.AvailableForStart = [
					{
						"_parent": "Level",
						"_props":
						{
							"compareMethod": ">=",
							"value": "1",
							"index": 0,
							"parentId": "",
							"id": "SVM: AllQuestsAvailable"
						}
					}]
				}
			}
			if (Config.Traders.FIRRestrictsQuests)
			{
				for (const id in Quests)
				{
					let condition = Quests[id].conditions.AvailableForFinish
					for (const requirements in condition)
					{
						if(condition[requirements].onlyFoundInRaid !== undefined)
						{
							condition[requirements].onlyFoundInRaid = false;
						}
					}
				}
			}
			if (Config.Traders.RemoveTimeCondition)
				{
					for (const id in Quests)
					{
						let condition = Quests[id].conditions.AvailableForStart
						for (const requirements in condition)
						{
							if(condition[requirements].availableAfter !== undefined)
							{
								condition[requirements].availableAfter = 0;
							}
						}
					}
				}

			//Enable all traders 4 stars
			if (Config.Traders.TradersLvl4)
			{
				for (let traderID in traders)
				{
					let loyaltyLevels = traders[traderID].base.loyaltyLevels;
					for (let level in loyaltyLevels)
					{
						loyaltyLevels[level].minLevel = 1
						loyaltyLevels[level].minSalesSum = 0
						loyaltyLevels[level].minStanding = 0
					}
				}
			}
			if (Config.Traders.UnlockQuestAssort)
			{
				for (let AssortR in traders)
				{
					if (AssortR !== "ragfair" && AssortR !== "638f541a29ffd1183d187f57" && traders[AssortR].questassort.success !== undefined)
					{
						traders[AssortR].questassort.success = {}
					}
				}
			}
			if (Config.Traders.RemoveTradeLimits)
			{
				for (let AssortR in traders)
				{
					if (AssortR !== "ragfair" && AssortR !==  "638f541a29ffd1183d187f57")
					{
						for (let level in traders[AssortR].assort.items)
						{
							if (traders[AssortR].assort.items[level].upd !== undefined && traders[AssortR].assort.items[level].upd["BuyRestrictionMax"] !== undefined)
							{
								delete traders[AssortR].assort.items[level].upd["BuyRestrictionMax"]
							}
						}
					}
				}
			}
			if (Config.Traders.IncreaseAssort)
				{
					for (let AssortR in traders)
					{
						if (AssortR !== "ragfair" && AssortR !==  "638f541a29ffd1183d187f57")
						{
							for (let level in traders[AssortR].assort.items)
							{
								if (traders[AssortR].assort.items[level].upd !== undefined && traders[AssortR].assort.items[level].upd["StackObjectsCount"] !== undefined)
								{
								 traders[AssortR].assort.items[level].upd["StackObjectsCount"] = 1337420;
								}
							}
						}
					}
				}
				//sell assort
			let traderArray = ["54cb50c76803fa8b248b4571","54cb57776803fa99248b456e","58330581ace78e27b8b10cee","5935c25fb3acc3127c3d8cd9","5a7c2eca46aef81a7ca2145d","5ac3b934156ae10c4430e83c","5c0647fdd443bc2504c2d371"]
			const Sell = Config.Traders.TraderSell;
			const SellArray = [Sell.Prapor,
				Sell.Therapist,
				Sell.Skier,
				Sell.Peacekeeper,
				Sell.Mechanic,
				Sell.Ragman,
				Sell.Jaeger
			]
			let p = 0;
			for (let CurTrader in traderArray)
			{
					for(let assortment in traders[traderArray[CurTrader]].assort.barter_scheme)
					{
						if( traders[traderArray[CurTrader]].assort.barter_scheme[assortment][0][0]._tpl == "5449016a4bdc2d6f028b456f" || 
						traders[traderArray[CurTrader]].assort.barter_scheme[assortment][0][0]._tpl == "569668774bdc2da2298b4568" ||
						traders[traderArray[CurTrader]].assort.barter_scheme[assortment][0][0]._tpl =="5696686a4bdc2da3298b456a")
						{
							let TempValue = (traders[traderArray[CurTrader]].assort.barter_scheme[assortment][0][0].count * SellArray[p]).toFixed(2)//testing
							traders[traderArray[CurTrader]].assort.barter_scheme[assortment][0][0].count = parseFloat(TempValue)
						}
					}
				p++;
			}

			if (Config.Traders.RemoveCurrencyOffers)
			{
				for (let CurTrader in traders)
				{
					if (CurTrader !== "ragfair" && CurTrader !== "638f541a29ffd1183d187f57" && CurTrader !== "579dc571d53a0658a154fbec") //avoid ragfair, lighthouse trader and fence
					{
						for(let assortment in traders[CurTrader].assort.barter_scheme)
						{
							if( traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl == "5449016a4bdc2d6f028b456f" || 
							traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl == "569668774bdc2da2298b4568" ||
							traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl =="5696686a4bdc2da3298b456a")
							{
								for(let DeletElem in traders[CurTrader].assort.items)
								{
									if(traders[CurTrader].assort.items[DeletElem]._id == assortment )
									{
									traders[CurTrader].assort.items.splice(DeletElem,1) //splice instead of delete is important - you can't have blank space in array or it will cause exception with ragfair generation
									break;//generally ineffecient way of search, break makes it less painful since we know there's only 1 element possible.
									}
								}
								for(let DeletLoyal in traders[CurTrader].loyal_level_items)
								{
									if(traders[CurTrader].assort.loyal_level_items[DeletLoyal] == assortment )
									{
									delete traders[CurTrader].assort.loyal_level_items[DeletLoyal]
									break;
									}
								}
								delete traders[CurTrader].assort.barter_scheme[assortment] //delete is fine here though
							}
						}
					}
				}
			}

			if (Config.Traders.RemoveBarterOffers)
			{
				for (let CurTrader in traders)
				{
					if (CurTrader !== "ragfair" && CurTrader !== "638f541a29ffd1183d187f57" && CurTrader !== "579dc571d53a0658a154fbec")
					{
						for(let assortment in traders[CurTrader].assort.barter_scheme)
						{
							if(traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl !== "5449016a4bdc2d6f028b456f" && 
							   traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl !== "569668774bdc2da2298b4568" &&
							   traders[CurTrader].assort.barter_scheme[assortment][0][0]._tpl !== "5696686a4bdc2da3298b456a")
							{
								for(let DeletElem in traders[CurTrader].assort.items)
								{
									if(traders[CurTrader].assort.items[DeletElem]._id == assortment )
									{
									traders[CurTrader].assort.items.splice(DeletElem,1)
									}
								}
								for(let DeletLoyal in traders[CurTrader].loyal_level_items)
								{
									if(traders[CurTrader].assort.loyal_level_items[DeletLoyal] == assortment )
									{
									delete traders[CurTrader].assort.loyal_level_items[DeletLoyal]
									break;
									}
								}
								delete traders[CurTrader].assort.barter_scheme[assortment]
							}
						}
					}
				}
			}
		}

		//############## PMC SECTION ##################,
		if (Config.PMC.EnablePMC)
		{
			PMC.convertIntoPmcChance.assault.min = Config.PMC.AItoPMC.PMCtoScav;
			PMC.convertIntoPmcChance.cursedassault.min = Config.PMC.AItoPMC.PMCtoCursedScav;
			PMC.convertIntoPmcChance.pmcbot.min = Config.PMC.AItoPMC.PMCtoRaider;
			PMC.convertIntoPmcChance.exusec.min = Config.PMC.AItoPMC.ExusectoPMC;
			PMC.convertIntoPmcChance.marksman = {};
			PMC.convertIntoPmcChance.marksman.min = Config.PMC.AItoPMC.SnipertoPMC;

			PMC.convertIntoPmcChance.assault.max = Config.PMC.AItoPMC.PMCtoScav;
			PMC.convertIntoPmcChance.cursedassault.max = Config.PMC.AItoPMC.PMCtoCursedScav;
			PMC.convertIntoPmcChance.pmcbot.max = Config.PMC.AItoPMC.PMCtoRaider;
			PMC.convertIntoPmcChance.exusec.max = Config.PMC.AItoPMC.ExusectoPMC;
			PMC.convertIntoPmcChance.marksman.max = Config.PMC.AItoPMC.SnipertoPMC;
			PMC.isUsec = Config.PMC.PMCRatio;
			PMC.chanceSameSideIsHostilePercent = Config.PMC.PMCChance.HostilePMC;
			PMC.botRelativeLevelDeltaMax = Config.PMC.LevelMargin;
			PMC.looseWeaponInBackpackChancePercent = Config.PMC.PMCChance.PMCLooseWep;
			PMC.weaponHasEnhancementChancePercent = Config.PMC.PMCChance.PMCWepEnhance;
			PMC.addPrefixToSameNamePMCAsPlayerChance = Config.PMC.PMCChance.PMCNamePrefix;
			PMC.allPMCsHavePlayerNameWithRandomPrefixChance = Config.PMC.PMCChance.PMCAllNamePrefix;
			for (const id in items)
			{
				let base = items[id]
				if (base._parent === "5447e1d04bdc2dff2f8b4567" && base._id !== "6087e570b998180e9f76dc24" && Config.PMC.LootableMelee)
				{
					EditSimpleItemData(id, "Unlootable", false);
					items[id]._props.UnlootableFromSide = [];
				}
			}
			if(Config.PMC.DisableLowLevelPMC)
			{
				Bots.equipment.pmc.randomisation[0].levelRange.max = 1;
			}
			//Logger.warning(PMC.convertIntoPmcChance)
			if (Config.PMC.ForceCustomWaves)
			{
				//Logger.info(locs.customWaves.boss)
				for(let wavemaps in locs.customWaves.boss)
				{
					for(let pmcwaves in locs.customWaves.boss[wavemaps])
					{
						locs.customWaves.boss[wavemaps][pmcwaves].BossChance =  Config.PMC.CustomWaveChance;
					}
				}
			}
			if(Config.PMC.NamesEnable)
			{
				if(Config.PMC.OverrideDefaultNames)
				{
					let Names = Config.PMC.PMCNameList.split("\r\n")
					Bot["usec"].firstName = Names;
					Bot["bear"].firstName = Names;
				}
				else
				{
					let Names = Config.PMC.PMCNameList.split("\r\n")
					for (const name in Names)//I don't really remember should i even have this cycle here, but eh, cba.
					{
						Bot["usec"].firstName.push(Names[name])
						Bot["bear"].firstName.push(Names[name])
					}
				}
			}
			}
		//############## QUESTS ############# It'll be straightforward as possible for now in sake of tests, i may shortify and push an array later.
		if (Config.Quests.EnableQuests)
		{
			const Daily = Config.Quests.DailyQuests;
			const Weekly = Config.Quests.WeeklyQuests;
			const ScavDaily = Config.Quests.ScavQuests;
			//Daily
			Quest.repeatableQuests[0].resetTime = Daily.Lifespan*60;
			let ArrayForTypes = Daily.Types.split(",");
			Quest.repeatableQuests[0].types = ArrayForTypes;
			Quest.repeatableQuests[0].numQuests = Daily.QuestAmount;
			Quest.repeatableQuests[0].minPlayerLevel = Daily.Access;
			Quest.repeatableQuests[0].rewardScaling.rewardSpread = Daily.Spread;
			Quest.repeatableQuests[0].questConfig.Exploration.maxExtracts = Daily.Extracts;
			Quest.repeatableQuests[0].questConfig.Completion.minRequestedAmount = Daily.MinItems;
			Quest.repeatableQuests[0].questConfig.Completion.maxRequestedAmount = Daily.MaxItems;
			Quest.repeatableQuests[0].questConfig.Elimination[0].minKills = Daily.MinKillsLR1;
			Quest.repeatableQuests[0].questConfig.Elimination[0].maxKills = Daily.MaxKillsLR1;
			Quest.repeatableQuests[0].questConfig.Elimination[1].minKills = Daily.MinKillsLR2;
			Quest.repeatableQuests[0].questConfig.Elimination[1].maxKills = Daily.MaxKillsLR2;
			Quest.repeatableQuests[0].questConfig.Elimination[2].minKills = Daily.MinKillsLR3;
			Quest.repeatableQuests[0].questConfig.Elimination[2].maxKills = Daily.MaxKillsLR3;
			//Weekly
			Quest.repeatableQuests[1].resetTime = Weekly.Lifespan*60;
			ArrayForTypes = Weekly.Types.split(",");
			Quest.repeatableQuests[1].types = ArrayForTypes;
			Quest.repeatableQuests[1].numQuests = Weekly.QuestAmount;
			Quest.repeatableQuests[1].minPlayerLevel = Weekly.Access;
			Quest.repeatableQuests[1].rewardScaling.rewardSpread = Weekly.Spread;
			Quest.repeatableQuests[1].questConfig.Exploration.maxExtracts = Weekly.Extracts;
			Quest.repeatableQuests[1].questConfig.Completion.minRequestedAmount = Weekly.MinItems;
			Quest.repeatableQuests[1].questConfig.Completion.maxRequestedAmount = Weekly.MaxItems;
			Quest.repeatableQuests[1].questConfig.Elimination[0].minKills = Weekly.MinKillsLR1;
			Quest.repeatableQuests[1].questConfig.Elimination[0].maxKills = Weekly.MaxKillsLR1;
			Quest.repeatableQuests[1].questConfig.Elimination[1].minKills = Weekly.MinKillsLR2;
			Quest.repeatableQuests[1].questConfig.Elimination[1].maxKills = Weekly.MaxKillsLR2;
			Quest.repeatableQuests[1].questConfig.Elimination[2].minKills = Weekly.MinKillsLR3;
			Quest.repeatableQuests[1].questConfig.Elimination[2].maxKills = Weekly.MaxKillsLR3;
			//Scav Daily
			Quest.repeatableQuests[2].resetTime = ScavDaily.Lifespan*60;
			ArrayForTypes = ScavDaily.Types.split(",");
			Quest.repeatableQuests[2].types = ArrayForTypes;
			Quest.repeatableQuests[2].numQuests = ScavDaily.QuestAmount;
			Quest.repeatableQuests[2].minPlayerLevel = ScavDaily.Access;
			Quest.repeatableQuests[2].rewardScaling.rewardSpread = ScavDaily.Spread;
			Quest.repeatableQuests[2].questConfig.Exploration.maxExtracts = ScavDaily.Extracts;
			Quest.repeatableQuests[2].questConfig.Completion.minRequestedAmount = ScavDaily.MinItems;
			Quest.repeatableQuests[2].questConfig.Completion.maxRequestedAmount = ScavDaily.MaxItems;
			Quest.repeatableQuests[2].questConfig.Elimination[0].minKills = ScavDaily.MinKillsLR1;
			Quest.repeatableQuests[2].questConfig.Elimination[0].maxKills = ScavDaily.MaxKillsLR1;
			Quest.repeatableQuests[2].questConfig.Elimination[1].minKills = ScavDaily.MinKillsLR2;
			Quest.repeatableQuests[2].questConfig.Elimination[1].maxKills = ScavDaily.MaxKillsLR2;
		}

		//############## SCAV SECTION ############## I wish i never made one, but here we are
		if (Config.Scav.EnableScav)
			{
				Inraid.carExtractBaseStandingGain = Config.Scav.CarBaseStanding
				locations["laboratory"].base.DisabledForScav = !Config.Scav.ScavLab;
				//Scav Cooldown Timer
				globals.SavagePlayCooldown = Config.Scav.ScavTimer;
				/*if (Config.Raids.UnlockPMCExitsForScav) Proven to be not functional, big sadde
				{
					for (let map in locations)
					{
						switch (map)
						{
								case "base":
								break;
							default:
							Logger.info(locations[map].base.DisabledScavExits)
							locations[map].base.exits.DisabledScavExits = "";
							break;
						}
					}
				}*/
				//PMC kill rep
				Bot["bear"].experience.standingForKill = Config.Scav.StandingPMCKill;
				Bot["usec"].experience.standingForKill = Config.Scav.StandingPMCKill;
					//Scav kill rep
				Bot["assault"].experience.standingForKill = Config.Scav.StandingFriendlyKill;
				Bot["cursedassault"].experience.standingForKill = Config.Scav.StandingFriendlyKill;
				Bot["marksman"].experience.standingForKill = Config.Scav.StandingFriendlyKill;

				for (let levels in globals.FenceSettings.Levels)//Damn it looks counter intuitive
				{
					if (Config.Scav.HostileScavs)
					{
						globals.FenceSettings.Levels[levels].HostileScavs = Config.Scav.HostileScavs
					}
					if (Config.Scav.HostileBosses)
					{
						globals.FenceSettings.Levels[levels].HostileBosses = Config.Scav.HostileScavs
					}
					if(Config.Scav.FriendlyScavs)
					{
						globals.FenceSettings.Levels[levels].HostileScavs = !Config.Scav.FriendlyScavs
					}
					if(Config.Scav.FriendlyBosses)
					{
						globals.FenceSettings.Levels[levels].HostileBosses = !Config.Scav.FriendlyBosses
					}
				}
				if (Config.Scav.ScavCustomPockets)
				{
					const JsonUtil = container.resolve("JsonUtil");
					let ScavCustomPocketItem = JsonUtil.clone(items["557ffd194bdc2d28148b457f"])
					let ScavPocketSize = Config.Scav.SCAVPockets
					ScavCustomPocketItem._id = "ScavCustomPocket"
					ScavCustomPocketItem._props.Grids[0]._id = "SVMScavPocket1"
					ScavCustomPocketItem._props.Grids[0]._parent = "ScavCustomPocket"
					ScavCustomPocketItem._props.Grids[0]._props.cellsH = ScavPocketSize.FirstH
					ScavCustomPocketItem._props.Grids[0]._props.cellsV = ScavPocketSize.FirstV
					ScavCustomPocketItem._props.Grids[1]._id = "SVMScavPSocket2"
					ScavCustomPocketItem._props.Grids[1]._parent = "ScavCustomPocket"
					ScavCustomPocketItem._props.Grids[1]._props.cellsH = ScavPocketSize.SecondH
					ScavCustomPocketItem._props.Grids[1]._props.cellsV = ScavPocketSize.SecondV
					ScavCustomPocketItem._props.Grids[2]._id = "SVMScavPocket3"
					ScavCustomPocketItem._props.Grids[2]._parent = "ScavCustomPocket"
					ScavCustomPocketItem._props.Grids[2]._props.cellsH = ScavPocketSize.ThirdH
					ScavCustomPocketItem._props.Grids[2]._props.cellsV = ScavPocketSize.ThirdV
					ScavCustomPocketItem._props.Grids[3]._id = "SVMScavPocket4"
					ScavCustomPocketItem._props.Grids[3]._parent = "ScavCustomPocket"
					ScavCustomPocketItem._props.Grids[3]._props.cellsH = ScavPocketSize.FourthH
					ScavCustomPocketItem._props.Grids[3]._props.cellsV = ScavPocketSize.FourthV
					if (ScavPocketSize.FourthH == 0 || ScavPocketSize.FourthV == 0)
					{
						ScavCustomPocketItem._props.Grids.splice(3,1);
					}
					if (ScavPocketSize.ThirdH == 0 || ScavPocketSize.ThirdV == 0)
					{
						ScavCustomPocketItem._props.Grids.splice(2,1);
					}
					if (ScavPocketSize.SecondH == 0 || ScavPocketSize.SecondV == 0)
					{
						ScavCustomPocketItem._props.Grids.splice(1,1);
					}
					if (ScavPocketSize.FirstH == 0 || ScavPocketSize.FirstV == 0)
					{
						ScavCustomPocketItem._props.Grids.splice(0,1);
					}
					items["ScavCustomPocket"] = ScavCustomPocketItem;
				}
			}
			//############## CUSTOM SECTION ##############
			if(Config.Custom.EnableCustom)
			{
				if(Config.Custom.LoggerIntoServer)
				{
					Logger.info(Config)
				}
			}
		//############## FUNCTIONS ##############
		//Set a Unique AI type spawn within selected location, with a lot of variables to come in.
		function CreateBoss(role, chance, followers, escortAmount, zones)
		{
			return {
				"BossName": role,
				"BossChance": chance,
				"BossZone": zones,
				"BossPlayer": false,
				"BossDifficult": "normal",
				"BossEscortType": followers,
				"BossEscortDifficult": "normal",
				"BossEscortAmount": escortAmount,
				"Time": -1
			}
		}
		function Filter(value)
		{
			let test = value.substring(1, value.length - 1)
			let arrayfin = test.split(",")
			return arrayfin
		}
		function EditSimpleItemData(id, data, value)
		{
			if (isNaN(value) && value !== 'true' && value !== 'false')
			{
				items[id]._props[data] = value
			}
			else
			{
				items[id]._props[data] = JSON.parse(value)
			}
		}
		function isJSONValueDefined(value) 
		{
			return value !== undefined && !value.isNaN;
		}
		function FreeExit(Exit)
		{
			Exit.PassageRequirement = "None";
			Exit.ExfiltrationType = "Individual";
			Exit.Id = '';
			Exit.Count = 0;
			Exit.PlayersCount = 0;
			Exit.RequirementTip = '';
			if (Exit.RequiredSlot)
			{
				delete Exit.RequiredSlot;
			}
		}
		function AmmoFilter(AID,Comp)
		{
			for (let ID in AID)
			{
				if(Comp.includes(AID[ID]))
				{
					return true;
				}
			}
			return false;
		}
	}
}
module.exports = {
	mod: new MainSVM
};