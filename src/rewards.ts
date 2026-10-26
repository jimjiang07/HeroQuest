/* The reward order (data/rewards.json): small items for quest stones, boss rewards, thinker badges. */
import rewardsFile from '../data/rewards.json';
import type {RewardPlan} from '@/learn/learner';
export const REWARDS=rewardsFile as RewardPlan;
