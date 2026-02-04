import type * as utils from "./utils";

export type Service = (typeof utils.SERVICES)[number];

export type ServiceMap = Record<Service, string>;
