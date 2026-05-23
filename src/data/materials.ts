export type WallColor = {
  id: string;
  name: string;
  hex: string;
  brand?: string;
  code?: string;
};

export type FloorTexture = {
  id: string;
  name: string;
  brand?: string;
  hexFallback: string;
  brightness: 'sehr-hell' | 'hell' | 'mittel' | 'mittel-dunkel' | 'dunkel' | 'sehr-dunkel';
};

// Vinyl-Klicksystem hat eine einzige physische Strukturprägung (Plankenfugen + Maserung-Relief).
// Alle Farbvarianten teilen dieselbe Diffuse+Normal-Basis, die Tönung kommt per Color-Tint.
// Quelle: polyhaven.com/a/plank_flooring_02 (CC0), 2K JPG.
export const BASE_FLOOR_TEXTURE = {
  diffuse: `${import.meta.env.BASE_URL}textures/vinyl/_base/diffuse.jpg`,
  normal: `${import.meta.env.BASE_URL}textures/vinyl/_base/normal.jpg`,
  ao: `${import.meta.env.BASE_URL}textures/vinyl/_base/ao.jpg`,
  // GLB hat keine UVs — wir generieren UVs zur Laufzeit aus Welt-Koordinaten
  // (in Metern). Repeat = Wiederholungen pro Meter.
  // Polyhaven plank_flooring_02 zeigt ~5 Planken pro Bild → repeat 1 = 1 Bild
  // pro Meter = ~5 Planken/m = 20 cm pro Planke (realistisch für Vinyl-Klick).
  tilingX: 1,
  tilingY: 1,
};

export const wallColorPalettes: { name: string; colors: WallColor[] }[] = [
  {
    name: 'Neutral',
    colors: [
      { id: 'white-pure', name: 'Reinweiß', hex: '#FFFFFF' },
      { id: 'white-warm', name: 'Warmweiß', hex: '#F5F1E8' },
      { id: 'white-cool', name: 'Kühlweiß', hex: '#F0F1F3' },
      { id: 'beige-soft', name: 'Beige sanft', hex: '#E8DDC9' },
      { id: 'grey-light', name: 'Hellgrau', hex: '#D8D8D5' },
      { id: 'grey-mid', name: 'Mittelgrau', hex: '#A8A8A4' },
      { id: 'grey-dark', name: 'Dunkelgrau', hex: '#5C5E60' },
    ],
  },
  {
    name: 'Farrow & Ball (klassische Auswahl)',
    colors: [
      { id: 'fb-cromarty', name: 'Cromarty', hex: '#C9C9B8', brand: 'Farrow & Ball', code: 'No. 285' },
      { id: 'fb-hague-blue', name: 'Hague Blue', hex: '#384147', brand: 'Farrow & Ball', code: 'No. 30' },
      { id: 'fb-pigeon', name: 'Pigeon', hex: '#8C8B7E', brand: 'Farrow & Ball', code: 'No. 25' },
      { id: 'fb-cornforth', name: 'Cornforth White', hex: '#D4CFC0', brand: 'Farrow & Ball', code: 'No. 228' },
      { id: 'fb-stiffkey', name: 'Stiffkey Blue', hex: '#3F4A57', brand: 'Farrow & Ball', code: 'No. 281' },
      { id: 'fb-mole', name: 'Mole\'s Breath', hex: '#7A7873', brand: 'Farrow & Ball', code: 'No. 276' },
    ],
  },
  {
    name: 'Caparol (Baumarkt-verfügbar)',
    colors: [
      { id: 'cap-karibik-14', name: 'Karibik 14', hex: '#BEDDD5', brand: 'Caparol', code: 'CD 1.05.50' },
      { id: 'cap-savanne-7', name: 'Savanne 7', hex: '#E0CFAA', brand: 'Caparol' },
      { id: 'cap-rosenholz', name: 'Rosenholz', hex: '#D9B5A8', brand: 'Caparol' },
      { id: 'cap-tundra', name: 'Tundra', hex: '#9BA89A', brand: 'Caparol' },
      { id: 'cap-graphit-95', name: 'Graphit 95', hex: '#3E3E3D', brand: 'Caparol' },
    ],
  },
  {
    name: 'Erdtöne',
    colors: [
      { id: 'terracotta', name: 'Terrakotta', hex: '#C46A4D' },
      { id: 'ochre', name: 'Ocker', hex: '#D4A24C' },
      { id: 'olive', name: 'Olive', hex: '#7A7C42' },
      { id: 'sage', name: 'Salbei', hex: '#9CAB89' },
      { id: 'rust', name: 'Rost', hex: '#A04E2F' },
      { id: 'sand', name: 'Sand', hex: '#D9C8A8' },
    ],
  },
  {
    name: 'Berlin-Altbau',
    colors: [
      { id: 'altbau-creme', name: 'Altbau Creme', hex: '#EFE6D2' },
      { id: 'altbau-sandstein', name: 'Sandstein', hex: '#D8C9AA' },
      { id: 'altbau-putz', name: 'Kalkputz roh', hex: '#E5DFD2' },
      { id: 'altbau-graublau', name: 'Graublau historisch', hex: '#7E8B96' },
      { id: 'altbau-petrol', name: 'Petrol gedeckt', hex: '#3E5C5E' },
    ],
  },
  {
    name: 'Grün',
    colors: [
      { id: 'gr-mint-light', name: 'Mint hell', hex: '#D6E4D3' },
      { id: 'gr-pistazie', name: 'Pistazie', hex: '#C0CFA1' },
      { id: 'gr-salbei-hell', name: 'Salbei hell', hex: '#B6C2A4' },
      { id: 'gr-laub', name: 'Laubgrün', hex: '#7B8E66' },
      { id: 'gr-flaschengruen', name: 'Flaschengrün', hex: '#3D5A47' },
      { id: 'gr-wald', name: 'Waldgrün', hex: '#2D3F2E' },
      { id: 'gr-oliv-dunkel', name: 'Oliv dunkel', hex: '#5A5A2C' },
      { id: 'gr-eukalyptus', name: 'Eukalyptus', hex: '#8FA88C' },
      { id: 'gr-moos', name: 'Moos', hex: '#5F6F4F' },
    ],
  },
  {
    name: 'Orange',
    colors: [
      { id: 'or-aprikose', name: 'Aprikose', hex: '#F4C9A3' },
      { id: 'or-pfirsich', name: 'Pfirsich', hex: '#F0B58A' },
      { id: 'or-terrakotta-hell', name: 'Terrakotta hell', hex: '#D89172' },
      { id: 'or-rost-warm', name: 'Rost warm', hex: '#B8643F' },
      { id: 'or-kuerbis', name: 'Kürbis', hex: '#D87B3D' },
      { id: 'or-ziegel', name: 'Ziegelrot', hex: '#A24B2A' },
      { id: 'or-burnt-orange', name: 'Burnt Orange', hex: '#C25223' },
      { id: 'or-mango', name: 'Mango', hex: '#E8A055' },
      { id: 'or-paprika', name: 'Paprika', hex: '#8B3A1F' },
    ],
  },
  {
    name: 'Blau',
    colors: [
      { id: 'bl-himmel', name: 'Himmel', hex: '#C8D8E4' },
      { id: 'bl-puderblau', name: 'Puderblau', hex: '#A8BCC8' },
      { id: 'bl-graublau', name: 'Graublau', hex: '#7C909A' },
      { id: 'bl-stahlblau', name: 'Stahlblau', hex: '#4F6A7A' },
      { id: 'bl-petrol', name: 'Petrol', hex: '#2F555C' },
      { id: 'bl-marine', name: 'Marine', hex: '#243A4F' },
      { id: 'bl-mitternacht', name: 'Mitternacht', hex: '#1C2638' },
      { id: 'bl-denim', name: 'Denim', hex: '#5B7290' },
      { id: 'bl-eisblau', name: 'Eisblau', hex: '#B8C9CC' },
    ],
  },
  {
    name: 'Gelb',
    colors: [
      { id: 'ge-vanille', name: 'Vanille', hex: '#F2E9C7' },
      { id: 'ge-butter', name: 'Butter', hex: '#F0DF9B' },
      { id: 'ge-senf-hell', name: 'Senf hell', hex: '#D8BC65' },
      { id: 'ge-senf', name: 'Senf', hex: '#B8943A' },
      { id: 'ge-ocker-warm', name: 'Ocker warm', hex: '#C99845' },
      { id: 'ge-honig', name: 'Honig', hex: '#D9A645' },
      { id: 'ge-curry', name: 'Curry', hex: '#A87A28' },
      { id: 'ge-stroh', name: 'Stroh', hex: '#E8D08C' },
      { id: 'ge-safran', name: 'Safran', hex: '#C68A2D' },
    ],
  },
  {
    name: 'Braun',
    colors: [
      { id: 'br-leinen', name: 'Leinen', hex: '#DCCDB4' },
      { id: 'br-kakao-hell', name: 'Kakao hell', hex: '#C2A684' },
      { id: 'br-haselnuss', name: 'Haselnuss', hex: '#A88358' },
      { id: 'br-walnuss', name: 'Walnuss', hex: '#7A5638' },
      { id: 'br-mahagoni', name: 'Mahagoni', hex: '#5B3725' },
      { id: 'br-schokolade', name: 'Schokolade', hex: '#3F2A1E' },
      { id: 'br-espresso', name: 'Espresso', hex: '#2A1C14' },
      { id: 'br-camel', name: 'Camel', hex: '#B58860' },
      { id: 'br-taupe', name: 'Taupe', hex: '#8B7B6A' },
    ],
  },
];

export const floorTextures: FloorTexture[] = [
  {
    id: 'eiche-sehr-hell',
    name: 'Eiche Sehr Hell',
    hexFallback: '#D9B98C',
    brightness: 'sehr-hell',
  },
  {
    id: 'eiche-hell',
    name: 'Eiche Hell',
    hexFallback: '#C9A57A',
    brightness: 'sehr-hell',
  },
  {
    id: 'eiche-natur',
    name: 'Eiche Natur',
    hexFallback: '#B68B5A',
    brightness: 'hell',
  },
  {
    id: 'eiche-medium',
    name: 'Eiche Medium',
    hexFallback: '#9B7048',
    brightness: 'mittel',
  },
  {
    id: 'eiche-honig',
    name: 'Eiche Honig',
    hexFallback: '#825A38',
    brightness: 'mittel-dunkel',
  },
  {
    id: 'walnuss',
    name: 'Walnuss',
    hexFallback: '#6E4527',
    brightness: 'dunkel',
  },
  {
    id: 'eiche-mocca',
    name: 'Eiche Mocca',
    hexFallback: '#5A3D29',
    brightness: 'sehr-dunkel',
  },
  {
    id: 'eiche-rauch',
    name: 'Eiche Rauch',
    hexFallback: '#4A352A',
    brightness: 'sehr-dunkel',
  },
];

export type Variant = {
  id: string;
  name: string;
  slotColors: Record<string, string>;
  activeFloorId: string | null;
  floorRotated: boolean;
  couchVisible: boolean;
  couchX: number;
  couchZ: number;
  couchRot: number;
};

const STORAGE_KEY = 'wohnung-viewer-variants';

export function loadVariants(): Variant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Variant[]) : [];
  } catch {
    return [];
  }
}

export function saveVariants(variants: Variant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(variants));
}

export type SlotConfig = {
  slotId: string;
  label: string;
  category: 'wand' | 'boden' | 'decke' | 'tuer' | 'fenster' | 'heizkoerper';
  defaultHex: string;
};

export const materialSlots: SlotConfig[] = [
  { slotId: 'wand_nord', label: 'Wand Nord', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'wand_ost', label: 'Wand Ost', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'wand_sued', label: 'Wand Süd', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'wand_west', label: 'Wand West', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'wand_erker_sued', label: 'Erker-Wand Süd (102 cm)', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'wand_erker_west', label: 'Erker-Wand West (18,5 cm)', category: 'wand', defaultHex: '#EAEAE6' },
  { slotId: 'boden', label: 'Boden', category: 'boden', defaultHex: '#B68B5A' },
  { slotId: 'decke', label: 'Decke', category: 'decke', defaultHex: '#FFFFFF' },
  { slotId: 'tuer_eingang_blatt', label: 'Tür Eingang — Blatt', category: 'tuer', defaultHex: '#EFEFEC' },
  { slotId: 'tuer_eingang_rahmen', label: 'Tür Eingang — Rahmen', category: 'tuer', defaultHex: '#F5F5F2' },
  { slotId: 'tuer_loggia_rahmen', label: 'Tür Loggia — Rahmen', category: 'tuer', defaultHex: '#F5F5F2' },
  { slotId: 'heizkoerper', label: 'Heizkörper', category: 'heizkoerper', defaultHex: '#F5F5F2' },
  { slotId: 'sockelleiste', label: 'Sockelleiste', category: 'wand', defaultHex: '#F5F5F2' },
];
