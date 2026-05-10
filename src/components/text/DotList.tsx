import { ReactNode } from "react";

export interface DotListProps {
  content: ReactNode[];
  className?: string;
}

export function DotList(props: DotListProps) {
  return (
    <p className={`font-semibold text-type-secondary ${props.className || ""}`}>
      {props.content.map((item, index) => {
        const key =
          typeof item === "string" || typeof item === "number" ? item : index;
        return (
          <span key={key}>
            {index !== 0 ? (
              <span className="mx-[0.6em] text-[1em]">&#9679;</span>
            ) : null}
            {item}
          </span>
        );
      })}
    </p>
  );
}
