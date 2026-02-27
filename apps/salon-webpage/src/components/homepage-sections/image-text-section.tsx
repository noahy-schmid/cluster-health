/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getMediaUrl } from "@/api/media.actions";

type Props = {
  header: string;
  text: string;
  imageId?: string;
  imageSrc?: string;
  imageAlt: string;
  swapOrder?: boolean;
};

export default function ImageTextSection(props: Props) {
  const { data: imageUrl } = useQuery({
    queryKey: ["mediaUrl", props.imageId],
    queryFn: async () => {
      if (!props.imageId) return null;
      const result = await getMediaUrl(props.imageId);
      if (result.success) {
        return result.data;
      }
      return null;
    },
    enabled: !!props.imageId,
  });

  const displaySrc = imageUrl || props.imageSrc;

  return (
    <section
      className={
        "px-4 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20" +
        (props.swapOrder ? " md:flex-row-reverse" : "")
      }
    >
      <div>
        <h2 className="text-3xl font-semibold text-salon-fg-strong">
          {props.header}
        </h2>
        <p className="text-p text-salon-fg-base opacity-90">{props.text}</p>
      </div>
      <div className="shrink-0 md:w-[50%] md:m-10 rounded-3xl overflow-hidden shadow-lg shadow-black/20 aspect-video">
        {displaySrc && (
          <img
            src={displaySrc}
            alt={props.imageAlt}
            width={1000}
            height={562}
          ></img>
        )}
      </div>
    </section>
  );
}
