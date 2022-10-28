require("@babel/polyfill");
import { AccessoryConfig, API, HAP, Logging } from "homebridge";
import { ConnectionService } from "./services/ConnectionService";
import { TeslaPluginService } from "./services/TeslaPluginService";
import { TrunkService } from "./services/TrunkService";
import { VehicleLockService } from "./services/VehicleLockService";
import { TeslaApi } from "./util/api";
import { TeslaPluginConfig } from "./util/types";

let hap: HAP;

export default function (api: API) {
  hap = api.hap;
  api.registerAccessory("homebridge-tesla", "Tesla", TeslaAccessory);
}

class TeslaAccessory {
  log: Logging;
  name: string;
  tesla: TeslaApi;

  // Services exposed.
  services: TeslaPluginService[] = [];

  constructor(log: Logging, untypedConfig: AccessoryConfig) {
    const config: TeslaPluginConfig = untypedConfig as any;

    this.log = log;
    this.name = config.name;
    this.tesla = new TeslaApi(log, config);

    // Create a new service for each feature.
    const args = [log, config, hap, this.tesla] as const;

    this.services.push(new ConnectionService(...args));

    if (config.vehicleLock ?? true) {
      this.services.push(new VehicleLockService(...args));
    }

    if (config.trunk ?? true) {
      this.services.push(new TrunkService(...args));
    }
  }

  getServices() {
    return this.services.map((service) => service.service);
  }
}
