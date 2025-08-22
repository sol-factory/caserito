import { ClientModel } from "@/schemas/client";
import CompanyModel from "@/schemas/company";
import DiscountModel from "@/schemas/discount";
import { MemberModel } from "@/schemas/member";
import { SaleModel } from "@/schemas/sale";
import ServiceModel from "@/schemas/service";
import StoreModel from "@/schemas/store";
import TemplateModel from "@/schemas/template";
import { VehicleModel } from "@/schemas/vehicle";
import VehicleKindModel from "@/schemas/vehicle-kind";
import WalletModel from "@/schemas/wallet";
import { toObjectId } from "./mdb";
import { CashflowModel } from "@/schemas/cashflow";

export const deleteCompany = async (company_id: string) => {
  const id = toObjectId(company_id);
  await MemberModel.deleteMany({
    "company._id": id,
  });
  const result = await CashflowModel.deleteMany({ company_id: id });
  await ClientModel.deleteMany({ company_id: id });
  await CompanyModel.deleteMany({ _id: id });
  await DiscountModel.deleteMany({ company_id: id });
  await SaleModel.deleteMany({ company_id: id });
  await ServiceModel.deleteMany({ company_id: id });
  await StoreModel.deleteMany({ company_id: id });
  await TemplateModel.deleteMany({ company_id: id });
  await VehicleKindModel.deleteMany({ company_id: id });
  await WalletModel.deleteMany({ company_id: id });
  await VehicleModel.deleteMany({ company_id: id });
};

export const activateCompany = async (
  company_id: string,
  stores: number = 1
) => {
  const result = await CompanyModel.findByIdAndUpdate(company_id, {
    $set: { "subscription.active": true, "subscription.stores": stores },
  });
};
