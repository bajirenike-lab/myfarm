export interface DeliveryZone {
  id: string;
  name: string;
  neighborhoods: string[];
  fee: number;
  estimatedMinutes: string;
  hubDistanceKm: string;
}

export const IBADAN_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone_1',
    name: 'Ido / Eleyele / Ologuneru',
    neighborhoods: ['Ido Town', 'Eleyele', 'Ologuneru', 'Polytechnic Ibadan', 'Nihort'],
    fee: 1500,
    estimatedMinutes: '45–60 mins',
    hubDistanceKm: '5–12 km (Near Farm Hub)',
  },
  {
    id: 'zone_2',
    name: 'Bodija / Agodi GRA / Mokola / UI',
    neighborhoods: ['Old Bodija', 'New Bodija', 'Agodi GRA', 'Secretariat', 'Mokola', 'University of Ibadan (UI)', 'Samonda'],
    fee: 2200,
    estimatedMinutes: '60–80 mins',
    hubDistanceKm: '15–20 km (Central Ibadan)',
  },
  {
    id: 'zone_3',
    name: 'Ring Road / Oluyole / Challenge / Dugbe',
    neighborhoods: ['Ring Road', 'Oluyole Estate', 'Challenge', 'Dugbe Commercial', 'Jericho', 'Iyaganku GRA', 'Molete'],
    fee: 2800,
    estimatedMinutes: '75–90 mins',
    hubDistanceKm: '20–28 km (South/West Core)',
  },
  {
    id: 'zone_4',
    name: 'Akobo / Iwo Road / Alakia / Moniya',
    neighborhoods: ['Akobo', 'General Gas', 'Iwo Road', 'Alakia Airport Area', 'Ojoo', 'Moniya (Akinyele)'],
    fee: 3500,
    estimatedMinutes: '90–120 mins',
    hubDistanceKm: '25–35 km (East & North Ibadan)',
  },
];
