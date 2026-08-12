// Structured content for editable site sections that are stored as JSON
// blobs in the `site_settings` table (see lib/db/schema.ts). Each default
// object below mirrors what used to be hardcoded directly in the page /
// component markup, so saving nothing keeps the site looking exactly as
// it did before this became editable.

export type CheckinHourRow = {
  building: string
  hours: string
}

export type BuildingOverviewRow = {
  building: string
  checkin: string
  card: string
}

export type BuildingDetail = {
  key: string
  name: string
  address: string
  mapsUrl: string
  warning: string
  photo: string
  photoAlt: string
  photoCaption: string
  description: string
}

export type CheckinGuideContent = {
  checkIn: string
  checkOut: string
  earlyCheckIn: string
  lateCheckOut: string

  addressName: string
  addressLines: string
  addressMapsUrl: string
  addressPhoto: string

  frontDeskText: string
  frontDeskPhoto: string
  frontDeskPhotoCaption: string

  checkinHours: CheckinHourRow[]

  lateCheckinText: string
  lateCheckinNotice: string
  lateCheckinBaiyokeText: string
  lateCheckinPhoto: string
  lateCheckinPhotoCaption: string

  buildingsWalkNote: string
  buildingsOverviewPhoto: string
  buildingsOverviewPhotoCaption: string
  buildingsTable: BuildingOverviewRow[]

  buildings: BuildingDetail[]

  wifiText: string
  wifiPattitaNote: string
  wifiLibraryWarning: string

  chiangmaiGuideUrl: string
  whatsappUrl: string
  telegramUrl: string
}

export const DEFAULT_CHECKIN_GUIDE: CheckinGuideContent = {
  checkIn: '2:00 PM',
  checkOut: 'Before 12:00 PM (noon)',
  earlyCheckIn: 'Subject to availability',
  lateCheckOut: 'Additional fee, upon request',

  addressName: '4Seas Nimman',
  addressLines:
    '20 Nimmana Haeminda Rd Lane 15, Nimmanhaemin,\nTambon Su Thep, Amphoe Mueang Chiang Mai,\nChiang Mai 50200, Thailand',
  addressMapsUrl: 'https://maps.app.goo.gl/H6YsqkcWp6sjn9TN9',
  addressPhoto: '/checkin/4seas-building.jpg',

  frontDeskText:
    'The front desk is on the first floor (ground floor), on the left side after the main entrance — look for the sign and stickers.\n\nWhen you arrive, please have ready:\n- Your passport\n- The name on your booking\n\nWe\u2019ll verify your details and confirm your check-in and check-out dates are correct.',
  frontDeskPhoto: '/checkin/welcome-desk.jpg',
  frontDeskPhotoCaption:
    'Look for the Welcome Desk & Coffee sign — first floor, left side after the main entrance.',

  checkinHours: [
    { building: '4Seas E Building', hours: '2:00 PM – 8:30 PM' },
    { building: 'Library F Building', hours: '2:00 PM – 8:30 PM' },
    { building: 'Pattita Apartment', hours: '2:00 PM – 8:30 PM' },
    { building: 'Baiyoke Ciao Hotel', hours: '2:00 PM – 8:00 AM (next day)' },
  ],

  lateCheckinText:
    'For 4Seas E, Library F, and Pattita:\n\nIf you arrive after 8:30 PM, the front desk will be closed. No worries — your room key and the building door code will be left at the front desk. Grab them and head to your room.',
  lateCheckinNotice:
    'You must return to the front desk before 2:00 PM the next day with your passport to complete registration.',
  lateCheckinBaiyokeText:
    'For Baiyoke Ciao Hotel: the front desk is open until 8:00 AM, so late-night check-in is available.',
  lateCheckinPhoto: '/checkin/late-checkin.jpg',
  lateCheckinPhotoCaption:
    'Late check-in: your room key and door code will be left here at the front desk.',

  buildingsWalkNote: 'All buildings are within a 3-minute walk of each other.',
  buildingsOverviewPhoto: '/checkin/buildings-100m.jpg',
  buildingsOverviewPhotoCaption:
    'Our buildings are all located within 100 m of each other in the Nimman neighbourhood.',
  buildingsTable: [
    { building: '4Seas E Building', checkin: '4Seas Front Desk', card: 'Card marked E' },
    { building: 'Library F Building', checkin: '4Seas Front Desk', card: 'Card marked F' },
    { building: 'Pattita Apartment', checkin: '4Seas Front Desk', card: 'White card' },
    { building: 'Baiyoke Ciao Hotel', checkin: 'Baiyoke Ciao Hotel front desk', card: '—' },
  ],

  buildings: [
    {
      key: '4seas-e',
      name: '4Seas E Building',
      address:
        '20 Nimmana Haeminda Rd Lane 15, Nimmanhaemin, Chiang Mai 50200 — our main building and front desk.',
      mapsUrl: 'https://maps.app.goo.gl/H6YsqkcWp6sjn9TN9',
      warning: '',
      photo: '/checkin/building-e.png',
      photoAlt: '4Seas branded bookshelf and community lounge in E Building',
      photoCaption: '4Seas E Building — coworking lounge, kitchen, laundry, and community spaces.',
      description:
        'Our main coworking and social hub, with a shared kitchen, lounge, laundry, and coworking space open to all residents.',
    },
    {
      key: 'library-f',
      name: 'Library F Building (Zuzalu Library)',
      address: '2/20 Nimmana Haeminda Rd Lane 15, Suthep, Mueang Chiang Mai, Chiang Mai 50200.',
      mapsUrl: 'https://maps.app.goo.gl/tikdtRccQofh5ura7',
      warning: '',
      photo: '/checkin/building-f.png',
      photoAlt: 'Zuzalu Library Chiang Mai reading lounge with bean bags and bookshelves',
      photoCaption: 'Library F (Zuzalu Library) — a shared community library and reading space.',
      description:
        'Home to an exhibition space, a content studio, and the community library — a quieter spot for events, filming, and focused work.',
    },
    {
      key: 'pattita',
      name: 'Pattita Apartment',
      address:
        '6 Nimmanhaemin Soi 15, Suthep, Mueang Chiang Mai, Chiang Mai 50200 — a 3-minute walk from 4Seas E Building (within 100 m).',
      mapsUrl: 'https://maps.app.goo.gl/TkUAHbePjQ5NEgmy9',
      warning: '',
      photo: '/checkin/building-pattita.png',
      photoAlt: 'Pattita Apartment exterior',
      photoCaption: 'Pattita Apartment — within 100 m of 4Seas E Building.',
      description:
        'Best suited for stays of one month or longer. Every room has its own private bathroom, a washing machine, and a microwave.',
    },
    {
      key: 'baiyoke',
      name: 'Baiyoke Ciao Hotel',
      address: '8/11 Soi 8, Nimmanhaemin Road, Suthep, Mueang Chiang Mai, Chiang Mai 50200.',
      mapsUrl: 'https://maps.app.goo.gl/dax9KF91hLPgdf138',
      warning: 'Check-in is at the Baiyoke Ciao Hotel front desk, not at 4Seas.',
      photo: '/checkin/building-baiyoke.png',
      photoAlt: 'Baiyoke Ciao Hotel Chiang Mai signboard at the entrance',
      photoCaption: 'Baiyoke Ciao Hotel — also within 100 m of 4Seas E Building.',
      description:
        'A partner hotel just 100 m from 4Seas E Building. Every room has its own private bathroom, and family rooms are available.',
    },
  ],

  wifiText: 'WiFi name and password are posted in your room and in the shared spaces of each building.',
  wifiPattitaNote:
    'At Pattita Apartment, the WiFi network is "Patitta 15" and has no password.',
  wifiLibraryWarning:
    'The Zuzalu Library (F Building) locks its door at 10pm. You\u2019ll be given the door code at check-in — please don\u2019t share it outside the community.',

  chiangmaiGuideUrl: '/coliving/chiangmai',
  whatsappUrl: 'https://chat.whatsapp.com/BeHrYvwwepbIN9m1L859I9?mode=gi_t',
  telegramUrl: 'https://t.me/NomadsBase',
}

export type ColivingImages = {
  hero: string
  community1: string
  community2: string
  community3: string
  community4: string
}

export const DEFAULT_COLIVING_IMAGES: ColivingImages = {
  hero: '/coliving-hero.jpg',
  community1: '/coliving/community-1.jpg',
  community2: '/coliving/community-2.jpg',
  community3: '/coliving/community-3.jpg',
  community4: '/coliving/community-4.jpg',
}

export const SITE_SETTINGS_KEYS = {
  checkinGuide: 'checkin_guide',
  colivingImages: 'coliving_images',
} as const
