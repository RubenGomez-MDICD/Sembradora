import { Baby, BookOpen, Bus, Coins, CreditCard, Ellipsis, Gem, HandCoins, Handshake, HeartPulse, House, Landmark, PiggyBank, Sprout, Store, Users, Utensils, Wallet, type LucideIcon } from "lucide-react";

/**
 * Íconos que se guardan por nombre en la base (categorías y metas).
 * El nombre es el de Lucide, igual que en los componentes de Figma («Icon/house»).
 */
export const ICONOS: Record<string, LucideIcon> = {
  baby: Baby,
  "book-open": BookOpen,
  bus: Bus,
  coins: Coins,
  "credit-card": CreditCard,
  ellipsis: Ellipsis,
  gem: Gem,
  "hand-coins": HandCoins,
  handshake: Handshake,
  "heart-pulse": HeartPulse,
  house: House,
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  sprout: Sprout,
  store: Store,
  users: Users,
  utensils: Utensils,
  wallet: Wallet,
};

export const icono = (nombre: string | undefined): LucideIcon => (nombre && ICONOS[nombre]) || Sprout;
