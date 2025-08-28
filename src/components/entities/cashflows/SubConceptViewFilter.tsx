import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import { DatePickerPeriod } from "@/components/custom-ui/DatePickerPeriod";

const SubConceptViewFilter = ({ subCategory, category }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center text-md font-light">
        <span className="font-bold underline text-nowrap">Categoría</span>:
        <div className="ml-2 mr-2 text-sm font-extralight text-orange-600 inline">
          {category}
        </div>{" "}
      </div>
      <div className="flex items-center text-md font-light">
        <span className="font-bold underline text-nowrap">Subcategoría</span>:
        <div className="ml-2 mr-2 text-sm font-extralight text-orange-600 inline">
          {subCategory}
        </div>{" "}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center mr-3 mt-2">
        <DatePickerPeriod show btnClassName="!py-4 !h-5 mr-2 " />
        <CleanUrlFilters />
      </div>
    </div>
  );
};

export default SubConceptViewFilter;
