import Image from "next/image";

type Props = {
  header: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
};

export default function ImageTextSection(props: Props) {
  return (
    <section
      className={
        "border-b px-4 py-8 max-w-7xl mx-auto border-fg/30 flex flex-col md:flex-row items-center gap-10 md:gap-20"
      }
    >
      <div>
        <h2 className="text-xl font-semibold text-fg">{props.header}</h2>
        <p className="text-p text-fg opacity-90">{props.text}</p>
      </div>
      <div className="shrink-0 md:w-[50%] md:m-10 rounded-3xl overflow-hidden shadow-lg shadow-black/20">
        <Image
          src={props.imageSrc}
          alt={props.imageAlt}
          width={1000}
          height={1000}
        ></Image>
      </div>
    </section>
  );
}
