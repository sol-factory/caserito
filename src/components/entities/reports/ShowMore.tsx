import React from "react";

const ShowMore = ({ items, setShowMore, showMore }) => {
  return (
    items.length > 5 && (
      <span
        onClick={() => setShowMore(!showMore)}
        className="font-extralight mt-5 block w-fit text-xs hover:text-blue-600 hover:cursor-pointer underline"
      >
        Ver {!showMore ? "listado completo" : "menos"}
      </span>
    )
  );
};

export default ShowMore;
