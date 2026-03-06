/* eslint-disable @next/next/no-img-element */

interface StylistCardProps {
  name: string;
  role: string;
  imageSrc?: string;
}

export default function StylistCard({
  name,
  role,
  imageSrc,
}: StylistCardProps) {
  return (
    <div className="relative w-full pt-16">
      {/* Circular profile image - positioned above the card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-lg shadow-black/20 bg-salon-bg-2 flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-salon-fg-base/50 text-sm text-center px-2">
              {name[0]}
            </span>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="relative bg-salon-bg-1 rounded-lg shadow-md shadow-black/20 overflow-hidden p-6 pt-24 hover:shadow-lg transition ">
        {/* Content */}
        <div className="relative text-center">
          <h3 className="text-2xl md:text-xl font-bold text-salon-fg-strong">
            {name}
          </h3>
          <p className="text-salon-fg-base/70 mt-2 text-base md:text-sm">
            {role}
          </p>
          <button className="mt-6 w-full bg-salon-accent text-salon-on-accent rounded-md px-6 py-3 md:py-2.5 font-semibold shadow-md shadow-salon-fg/20 text-lg md:text-base cursor-pointer">
            Termin buchen
          </button>
        </div>
      </div>
    </div>
  );
}
