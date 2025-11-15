import { StaffMemberDetailed } from "../types/staff";

// Helper function to create dates for the next 14 days
const getNextNDays = (n: number): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
};

// Get specific weekdays from the next 14 days
const getWeekdays = (weekdayIndices: number[]): Date[] => {
  return getNextNDays(14).filter((date) =>
    weekdayIndices.includes(date.getDay())
  );
};

// Weekday indices: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday

// Internal type that includes availability (not exported to consumers)
interface StaffMemberWithAvailability
  extends Omit<StaffMemberDetailed, "services"> {
  services: {
    name: string;
    duration: string;
    price: string;
    availability: {
      date: Date;
      times: string[];
    }[];
  }[];
}

// Mock data for specialists - in a real app, this would come from an API
export const staffMembers: StaffMemberWithAvailability[] = [
  {
    id: "0",
    name: "Jana Schmidt",
    role: "Salon-Inhaberin & Meisterin",
    imageSrc: "/images/house.png",
    description:
      "Mit über 20 Jahren Erfahrung leitet Jana den Salon mit Leidenschaft und Expertise. Spezialisiert auf moderne Schnitt- und Färbetechniken.",
    longDescription:
      "Jana Schmidt ist die stolze Inhaberin und Meisterin unseres Salons. Mit ihrer über 20-jährigen Erfahrung in der Friseurbranche hat sie sich einen exzellenten Ruf erarbeitet. Ihre Spezialgebiete umfassen moderne Schnitt- und Färbetechniken sowie individuelle Typberatung. Jana legt großen Wert auf persönliche Betreuung und nimmt sich Zeit, um die perfekte Frisur für jeden Kunden zu finden.",
    specialties: [
      "Moderne Haarschnitte",
      "Färbetechniken",
      "Typberatung",
      "Hochsteckfrisuren",
    ],
    experience: "20+ Jahre",
    rating: 4.9,
    reviewCount: 127,
    services: [
      {
        name: "Waschen & Schneiden",
        duration: "45 min",
        price: "45€",
        availability: getWeekdays([1, 2, 3, 4, 5]).map((date) => ({
          date,
          times:
            [1, 2, 3, 4, 5].includes(date.getDay()) && date.getDay() !== 3
              ? ["09:00", "11:00", "14:00", "16:00"]
              : ["09:00", "11:00", "14:00"],
        })),
      },
      {
        name: "Färben",
        duration: "90 min",
        price: "75€",
        availability: getWeekdays([2, 3, 4, 5]).map((date) => ({
          date,
          times: ["09:00", "14:00"],
        })),
      },
      {
        name: "Balayage",
        duration: "120 min",
        price: "120€",
        availability: getWeekdays([3, 4, 5]).map((date) => ({
          date,
          times: date.getDay() === 3 ? ["09:00"] : ["09:00", "13:00"],
        })),
      },
      {
        name: "Hochsteckfrisur",
        duration: "60 min",
        price: "65€",
        availability: getWeekdays([1, 2, 4, 5]).map((date) => ({
          date,
          times: ["10:00", "13:00", "15:00"],
        })),
      },
    ],
  },
  {
    id: "1",
    name: "Sarah Müller",
    role: "Color Specialist",
    imageSrc: "/images/house.png",
    description:
      "Sarah ist unsere Expertin für außergewöhnliche Colorationen und Balayage. Sie kreiert individuelle Farberlebnisse für jeden Haartyp.",
    longDescription:
      "Sarah Müller ist unsere absolute Expertin, wenn es um Haarfarbe geht. Mit einem außergewöhnlichen Gespür für Farbnuancen und Trends kreiert sie individuelle Looks, die perfekt zum Typ passen. Ihre Spezialität ist die Balayage-Technik, bei der sie natürlich wirkende Farbverläufe zaubert.",
    specialties: ["Balayage", "Ombré", "Colorationen", "Strähnen"],
    experience: "12 Jahre",
    rating: 4.8,
    reviewCount: 98,
    services: [
      {
        name: "Balayage",
        duration: "150 min",
        price: "140€",
        availability: getWeekdays([3, 4, 5, 6]).map((date) => ({
          date,
          times: ["09:00"],
        })),
      },
      {
        name: "Komplettfärbung",
        duration: "120 min",
        price: "85€",
        availability: getWeekdays([2, 3, 4, 5]).map((date) => ({
          date,
          times: ["10:00", "13:00"],
        })),
      },
      {
        name: "Strähnen",
        duration: "90 min",
        price: "70€",
        availability: getWeekdays([2, 3, 4, 5, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 6
              ? ["09:00", "11:00"]
              : ["10:00", "13:00", "15:00"],
        })),
      },
      {
        name: "Ombré",
        duration: "120 min",
        price: "110€",
        availability: getWeekdays([3, 4, 5, 6]).map((date) => ({
          date,
          times: date.getDay() === 6 ? ["09:00"] : ["10:00"],
        })),
      },
    ],
  },
  {
    id: "2",
    name: "Tim Wagner",
    role: "Stylist",
    imageSrc: "/images/house.png",
    description:
      "Tim bringt frischen Wind in klassische Schnitte. Seine modernen Interpretationen von zeitlosen Styles begeistern unsere Kunden.",
    longDescription:
      "Tim Wagner verbindet klassisches Handwerk mit modernem Styling. Er hat ein besonderes Talent dafür, zeitlose Schnitte neu zu interpretieren und ihnen einen frischen, zeitgemäßen Touch zu verleihen. Bei Tim sind Sie in den besten Händen, wenn Sie einen Look suchen, der sowohl klassisch als auch modern ist.",
    specialties: [
      "Herrenschnitte",
      "Moderne Kurzhaarschnitte",
      "Bartpflege",
      "Styling",
    ],
    experience: "8 Jahre",
    rating: 4.7,
    reviewCount: 76,
    services: [
      {
        name: "Herrenschnitt",
        duration: "30 min",
        price: "35€",
        availability: getWeekdays([1, 2, 3, 4, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 6
              ? ["09:00", "11:00", "13:00"]
              : date.getDay() === 3
                ? ["10:00", "12:00", "15:00"]
                : ["10:00", "12:00", "15:00", "17:00"],
        })),
      },
      {
        name: "Waschen & Schneiden",
        duration: "45 min",
        price: "42€",
        availability: getWeekdays([1, 2, 3, 4, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 6
              ? ["09:00", "11:00"]
              : date.getDay() === 3
                ? ["10:00", "13:00"]
                : ["10:00", "13:00", "16:00"],
        })),
      },
      {
        name: "Bart trimmen",
        duration: "20 min",
        price: "18€",
        availability: getWeekdays([1, 2, 3, 4, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 6
              ? ["09:00", "10:00", "11:00", "12:00", "13:00"]
              : date.getDay() === 3
                ? ["10:00", "11:00", "12:00", "15:00"]
                : ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
        })),
      },
      {
        name: "Komplettpaket",
        duration: "60 min",
        price: "55€",
        availability: getWeekdays([1, 2, 3, 4, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 6
              ? ["09:00", "11:00"]
              : date.getDay() === 3
                ? ["10:00"]
                : ["10:00", "15:00"],
        })),
      },
    ],
  },
  {
    id: "3",
    name: "Lisa Becker",
    role: "Hair Artist",
    imageSrc: "/images/house.png",
    description:
      "Lisa hat ein Händchen für kreative Hochsteckfrisuren und besondere Anlässe. Sie zaubert wahre Kunstwerke.",
    longDescription:
      "Lisa Becker ist unsere kreative Künstlerin im Team. Mit ihrer Leidenschaft für aufwendige Hochsteckfrisuren und ihrer Liebe zum Detail zaubert sie wahre Kunstwerke. Ob Hochzeit, Gala oder besonderer Anlass - bei Lisa werden Ihre Haarträume wahr.",
    specialties: [
      "Hochsteckfrisuren",
      "Brautstyling",
      "Event-Frisuren",
      "Kreative Styles",
    ],
    experience: "10 Jahre",
    rating: 5.0,
    reviewCount: 64,
    services: [
      {
        name: "Hochsteckfrisur",
        duration: "75 min",
        price: "70€",
        availability: getWeekdays([3, 4, 5, 6]).map((date) => ({
          date,
          times: ["11:00", "14:00"],
        })),
      },
      {
        name: "Brautstyling",
        duration: "120 min",
        price: "150€",
        availability: getWeekdays([5, 6]).map((date) => ({
          date,
          times: date.getDay() === 5 ? ["10:00"] : ["09:00", "12:00"],
        })),
      },
      {
        name: "Event-Frisur",
        duration: "60 min",
        price: "60€",
        availability: getWeekdays([3, 4, 5, 6]).map((date) => ({
          date,
          times:
            date.getDay() === 5
              ? ["14:00", "16:00"]
              : ["11:00", "14:00", "16:00"],
        })),
      },
      {
        name: "Styling-Beratung",
        duration: "30 min",
        price: "25€",
        availability: getWeekdays([3, 4, 5, 6]).map((date) => ({
          date,
          times: ["11:00", "12:00", "14:00", "15:00", "16:00"],
        })),
      },
    ],
  },
];
