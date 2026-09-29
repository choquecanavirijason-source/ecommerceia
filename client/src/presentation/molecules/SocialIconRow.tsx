import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const icons = [Facebook, Twitter, Instagram, Youtube];

export function SocialIconRow() {
  return (
    <div className="flex items-center gap-2.5">
      {icons.map((Icon, i) => (
        <button
          key={i}
          type="button"
          aria-label="Red social"
          className="w-9 h-9 bg-neutral-100 border border-neutral-200/80 rounded-full flex items-center justify-center text-neutral-600 hover:bg-[#FF6A00] hover:text-white hover:border-[#FF6A00] transition-all duration-200 shadow-xs active:scale-90"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
