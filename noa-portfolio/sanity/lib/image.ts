import imageUrlBuilder from "@sanity/image-url";
import { client } from "../sanity.client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    return {
      width: () => ({ height: () => ({ url: () => "" }) }),
      height: () => ({ url: () => "" }),
      url: () => "",
    } as any;
  }
  return builder.image(source);
}
