import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBox,
  faDroplet,
  faFire,
  faGear,
  faHammer,
  faHouse,
  faLightbulb,
  faPaintbrush,
  faPlug,
  faScrewdriverWrench,
  faSnowflake,
  faTree,
  faWrench,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import type { CategoryIconComponent } from "@/domain/entities/Category";

export const CATEGORY_ICON_OPTIONS: { name: string; label: string; icon: IconDefinition }[] = [
  { name: "bolt", label: "Rayo", icon: faBolt },
  { name: "hammer", label: "Martillo", icon: faHammer },
  { name: "paintbrush", label: "Pincel", icon: faPaintbrush },
  { name: "droplet", label: "Gota", icon: faDroplet },
  { name: "lightbulb", label: "Bombilla", icon: faLightbulb },
  { name: "plug", label: "Enchufe", icon: faPlug },
  { name: "wrench", label: "Llave", icon: faWrench },
  { name: "screwdriver-wrench", label: "Herramientas", icon: faScrewdriverWrench },
  { name: "box", label: "Caja", icon: faBox },
  { name: "fire", label: "Fuego", icon: faFire },
  { name: "snowflake", label: "Frío", icon: faSnowflake },
  { name: "house", label: "Casa", icon: faHouse },
  { name: "tree", label: "Jardín", icon: faTree },
  { name: "gear", label: "Configuración", icon: faGear },
];

export function getCategoryIconDefinition(name?: string) {
  return CATEGORY_ICON_OPTIONS.find((option) => option.name === name)?.icon;
}

function createCategoryIconComponent(icon: IconDefinition): CategoryIconComponent {
  return function ResolvedCategoryIcon({ className }) {
    return <FontAwesomeIcon icon={icon} className={className} />;
  };
}

// Componentes estables derivados de la misma paleta que utiliza el administrador.
const CATEGORY_ICON_COMPONENTS = new Map(
  CATEGORY_ICON_OPTIONS.map(({ name, icon }) => [name, createCategoryIconComponent(icon)]),
);
const DEFAULT_CATEGORY_ICON = createCategoryIconComponent(faBox);

export function getCategoryIconComponent(name?: string | null): CategoryIconComponent {
  return CATEGORY_ICON_COMPONENTS.get(name ?? "box") ?? DEFAULT_CATEGORY_ICON;
}

export function CategoryIcon({
  name,
  fallback: Fallback,
  className,
}: {
  name?: string;
  fallback?: CategoryIconComponent;
  className?: string;
}) {
  const icon = getCategoryIconDefinition(name);

  if (icon) return <FontAwesomeIcon icon={icon} className={className} />;
  return Fallback ? <Fallback className={className} /> : <FontAwesomeIcon icon={faBox} className={className} />;
}
