import { ImageIcon } from "@saleor/macaw-ui";
import { Highlight, useHits } from "react-instantsearch-hooks-web";
import styles from "../styles/search.module.css";
import Image from "next/image";

function Hit(props: { hit: any }) {
  return (
    <div className={styles.wrapper}>
      {props.hit?.thumbnail ? (
        <Image height={60} width={60} src={props.hit.thumbnail} alt={props.hit.slug} />
      ) : (
        <div className={styles.fallbackThumbnail}>
          <ImageIcon />
        </div>
      )}
      <Highlight attribute="name" hit={props.hit} />
    </div>
  );
}

export function Hits() {
  const { hits } = useHits();

  return (
    <div className={styles.hitsWrapper}>
      {hits.map((hit) => (
        <Hit key={hit.objectID} hit={hit} />
      ))}
    </div>
  );
}
