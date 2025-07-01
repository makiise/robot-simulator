import { RobotType } from "@/types/common.types";

export const ROBOT_SPECS: { [key in RobotType]: { initialHp: number; cost: number; } } = {
    CERBERUS_BASIC: {
        initialHp: 300,
        cost: 300,
    },
    JESUS_OF_SUBURBIA: {
        initialHp: 100,
        cost: 100,
    },
    CALCIFER: {
        initialHp: 50,
        cost: 50,
    },
};

export const JOS_ZONE_RADIUS = 5;

export const MOVEMENT_HP_COST = 1;
export const GARBAGE_COLLECTION_HP_COST = 3;
export const PACKAGE_PICKUP_HP_COST = 3; 
export const FIXED_HEALTH_PACK_AMOUNT = 10;

export const BASE_TICK_RATE = 1000;