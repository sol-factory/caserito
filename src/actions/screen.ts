import { getItemsProps } from "./service";
import ScreenModel from "@/schemas/screen";

export const getItems = async ({ filterId, searchText }: getItemsProps) => {
  const screens = await ScreenModel.find();

  return screens.map((s) => ({ _id: s._id.toString(), name: s.name }));
};
