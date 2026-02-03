import Image from "next/image";

type Props = {
  header: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  swapOrder?: boolean;
};

export default function ImageTextSection(props: Props) {
  return (
    <section
      className={
        "px-4 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20" +
        (props.swapOrder ? " md:flex-row-reverse" : "")
      }
    >
      <div>
        <h2 className="text-xl font-semibold text-fg">{props.header}</h2>
        <p className="text-p text-fg opacity-90">{props.text}</p>
      </div>
      <div className="shrink-0 md:w-[50%] md:m-10 rounded-3xl overflow-hidden shadow-lg shadow-black/20 aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {props.imageSrc && <img
          src={props.imageSrc}
          alt={props.imageAlt}
          width={1000}
          height={562}
        ></img>}
      </div>
    </section>
  );
}
