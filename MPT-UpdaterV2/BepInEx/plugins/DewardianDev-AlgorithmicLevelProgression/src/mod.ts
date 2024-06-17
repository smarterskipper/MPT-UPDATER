import { IPreAkiLoadMod } from "./../types/models/external/IPreAkiLoadMod.d";
/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import BotLevelChanges from "./LevelChanges/BotLevelChanges";
import {
  enableProgressionChanges,
  enableLevelChanges,
  enableNonPMCBotChanges,
} from "../config/config.json";
import ProgressionChanges from "./LoadoutChanges/ProgressionChanges";
import { SetupLocationGlobals } from "./LoadoutChanges/SetupLocationGlobals";
import { LocationUpdater } from "./LoadoutChanges/LocationUpdater";
import SetupNonPMCBotChanges from "./NonPmcBotChanges/SetupNonPMCBotChanges";

class AlgorithmicLevelProgression implements IPreAkiLoadMod, IPostAkiLoadMod {
  preAkiLoad(container: DependencyContainer): void {
    enableLevelChanges && BotLevelChanges(container);
    enableProgressionChanges && LocationUpdater(container);
  }

  postAkiLoad(container: DependencyContainer): void {
    enableProgressionChanges && ProgressionChanges(container);
    enableProgressionChanges && SetupLocationGlobals(container);
    enableNonPMCBotChanges && SetupNonPMCBotChanges(container);
  }
}

module.exports = { mod: new AlgorithmicLevelProgression() };
