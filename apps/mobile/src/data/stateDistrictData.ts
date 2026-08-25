import stateDistrictJson from './stateDistrictMaster.json';

export const STATE_DISTRICT_MAP: Record<string, string[]> = stateDistrictJson.states as Record<string, string[]>;

export const ALL_STATES: string[] = Object.keys(STATE_DISTRICT_MAP);

export const ALL_DISTRICTS_WITH_STATE: Array<{ district: string; state: string }> = Object.entries(
  STATE_DISTRICT_MAP
).flatMap(([state, districts]) =>
  districts.map((district) => ({ district, state }))
);

export const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName || stateName === 'all') return [];
  const match = Object.keys(STATE_DISTRICT_MAP).find(
    (s) => s.toLowerCase() === stateName.toLowerCase()
  );
  return match && STATE_DISTRICT_MAP[match] ? STATE_DISTRICT_MAP[match] : [];
};
