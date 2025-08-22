import BirthdayInput from "@/components/custom-ui/BirthdayInput";
import { DatePicker } from "@/components/custom-ui/DatePicker";
import FileUploadInput from "@/components/custom-ui/FileUploadInput";
import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import DiscountForm from "@/components/entities/discounts/DiscountForm";
import SaleServices from "@/components/entities/sales/SaleServices";
import {
  atLeastOneObject,
  optionalString,
  selectableSchema,
} from "@/helpers/z";
import { addYears } from "date-fns";
import {
  ArrowUpDown,
  Bell,
  BuildingIcon,
  Calculator,
  ChartAreaIcon,
  ChartBar,
  CircleDollarSign,
  CreditCard,
  MapPin,
  Percent,
  Send,
  Tags,
  UserCog2,
  Users,
  Video,
  Wallet2,
} from "lucide-react";
import { z } from "zod";
import { CONFIG } from "./constanst";
import { toSlug } from "@/helpers/text";
import { focusAfter, getCountry } from "@/helpers/ui";
import SaleRowMenuItems from "@/components/entities/sales/SaleRowMenuItems";
import ClientRowMenuItems from "@/components/entities/clients/ClientRowMenuItems";
import MyTextAreaCE from "@/components/custom-ui/MyTextAreaCE";
import ServiceRowMenuItems from "@/components/entities/services/ServiceRowMenuItems";
import DropdownVehicles from "@/components/custom-ui/DropdownVehicles";
import MemberRowMenuItems from "@/components/entities/users/MemberRowMenuItems";
import TemplateRowMenuItems from "@/components/entities/templates/TemplateRowMenuItems";
import StoreRowMenuItems from "@/components/entities/stores/StoreRowMenuItems";
import MyTimeInput from "@/components/custom-ui/MyTimeInput";
import MyCheckboxField from "@/components/custom-ui/MyCheckbox";
import CompanyRowMenuItems from "@/components/entities/companies/CompanyRowsMenuItems";
import MyTextArea from "@/components/custom-ui/MyTextArea";
import CashflowRowMenuItems from "@/components/entities/cashflows/CashflowRowMenuItems";
import WhatsappNumberRowMenuItems from "@/components/entities/templates/WhatsappNumberRowMenuItems";
import ServicePrices from "@/components/entities/services/ServicePrices";
import ToggleCurrency, {
  ToogleTinyCurrency,
} from "@/components/entities/services/ToggleCurrency";
import QuoteRowMenuItems from "@/components/entities/quotes/QuoteRowMenuItems";
import QuoteServices from "@/components/entities/quotes/QuoteServices";
import StoreMap from "@/components/entities/stores/StoreMap";
import { CardTitle } from "@/components/ui/card";
import MemberPermissions from "@/components/entities/users/MemberPermissions";
import MemberSalary from "@/components/entities/users/MemberSalary";
import TooglePersonKind from "@/components/entities/clients/TogglePersonKind";
import ToogleCashflowKind from "@/components/entities/cashflows/ToggleCashflowKind";
import MainCashflowForm from "@/components/entities/cashflows/MainCashflowForm";
import SecondaryCashflowForm from "@/components/entities/cashflows/SecondaryCashflowForm";
import { hasRepeatedIds } from "@/helpers/arrays";
import WalletRowMenuItems from "@/components/entities/wallets/WalletRowMenuItems";
import AttachmentRowMenuItems from "@/components/entities/attachments/AttachmentRowMenuItems";
import WalletClosureForm from "@/components/entities/wallets/WalletClosureForm";

export const APP_ROLES = ["Socio", "Admin", "Developer"] as const;
export type ROLE = (typeof APP_ROLES)[number];

const iconsClasses =
  "h-5 w-5 transition-transform duration-300 cursor-pointer group-hover:scale-105";

export const ENTITIES = {
  countries: {
    new: () => {},
    createSchema: z.any(),
    singular: "País",
    plural: "Países",
    placeholder: "País",
  },
  role: {
    new: () => {},
    createSchema: z.any(),
    placeholder: "Rol",
    singular: "rol",
    plural: "roles",
  },
  sale: {
    new: () => ({
      _id: "",
      quote_id: "",
      quote_identifier: "",
      date: new Date().toUTCString(),
      pick_up_date: null,
      client: { _id: "", name: "" },
      vehicle: { _id: "", name: "" },
      services: [],
      usd_services: [],
      discounts: [],
      usd_discounts: [],
      workers: [],
      amount: 0,
      usd_amount: 0,
      finished: undefined,
      discounts_amount: 0,
      usd_discounts_amount: 0,
      gathered_amount: 0,
      usd_gathered_amount: 0,
      canUpdate: false,
    }),
    menus: {
      rowItems: (
        s,
        isOwner,
        companyName,
        isManager,
        colorAllowed,
        multiCurrencyAllowed
      ) => (
        <SaleRowMenuItems
          s={s}
          companyName={companyName}
          isOwner={isOwner}
          isManager={isManager}
          colorAllowed={colorAllowed}
        />
      ),
    },
    createSchema: z.object({
      _id: optionalString(),
      date: z.date({ coerce: true, required_error: "Debes indicar la fecha" }),
      client: selectableSchema("Debes elegir un cliente"),
      vehicle: selectableSchema("Debes elegir un vehículo"),
      services: atLeastOneObject("Debes elegir al menos 1 servicio", {
        _id: z.string(),
      }).refine((services) => !hasRepeatedIds(services), {
        message: "Los servicios no pueden estar repetidos",
      }),
      workers: z.array(z.object({ _id: z.string() })).optional(),
    }),
    loadingKey: "sale-form",
    singular: "venta",
    plural: "Ventas",
    placeholder: "Venta",
    href: "washes",
    fields: [
      ({ store, user, canUpdate }) => (
        <>
          <div className="flex gap-1 w-full">
            <DatePicker
              id="sale-date-picker"
              entity="sale"
              field="date"
              placeholder="Fecha de ingreso"
              fromDate={
                user.role === "Socio" ? new Date(2025, 0, 1) : new Date()
              }
              disabled={!canUpdate}
              // toDate={addDays(new Date(), 6)}
            />
            <MyTimeInput disabled={!canUpdate} form="sale" field="date" />
          </div>
          {store?.allow_pick_up_date && (
            <div className="flex gap-1">
              <DatePicker
                id="sale_pick_up_date"
                entity="sale"
                placeholder="Fecha de retiro"
                field="pick_up_date"
                fromDateField="date"
                disabled={!canUpdate}
                // toDate={addDays(new Date(), 6)}
              />
              <MyTimeInput
                dateFieldId="sale_pick_up_date"
                disabled={!canUpdate}
                form="sale"
                field="pick_up_date"
                from_hour_field="date"
              />
            </div>
          )}
          <MultiSelect
            id="sale-client"
            entity="client"
            form="sale"
            field="client"
            searchPlaceholder="Buscar por nombre, celular o patente..."
            idToFocusAfterSelection="sale-vehicle"
            resetOnSelect="vehicle"
            justOne
            propercase
            disabled={!canUpdate}
          />

          <MultiSelect
            id="sale-vehicle"
            entity="vehicle"
            form="sale"
            filterIdField="client"
            field="vehicle"
            resetOnSelect="services"
            idToFocusAfterSelection="sale-service"
            justOne
            disabled={!canUpdate}
            hideSearch
          />
          <MultiSelect
            id="sale-service"
            entity="service"
            filterIdField="vehicle"
            form="sale"
            field="services"
            placeholder="Servicio/s"
            disabled={!canUpdate}
          >
            {(si) => (
              <>
                <SaleServices services={si} currency={store?.currency} />
                <SaleServices services={si} currency="usd" />
              </>
            )}
          </MultiSelect>
          {store?.allow_workers && (
            <MultiSelect
              form="sale"
              field="workers"
              entity="member"
              action="getWorkers"
              placeholder="Equipo de trabajo"
              className="mt-0"
              disabled={!canUpdate}
            />
          )}
        </>
      ),
    ],
    menu_item: true,
    menu_item_name: "Ventas",
    icon: <CircleDollarSign className={iconsClasses} />,
    show: (role: ROLE, is_developer) => true,
  },
  cashflow: {
    new: (current_store?: any, state?: any) => ({
      _id: undefined,
      date: new Date().toUTCString(),
      kind: "egress",
      wallet: {},
      wallet_to: {},
      category: {},
      client: {},
      sub_category: {},
      detail: "",
      sale_id: state?.sale_id || "",
      canCreate: true,
      canUpdate: true,
      cancelling: state?.cancelling || current_store?.currency,
      exchange_rate: current_store?.usd_exchange_rate,
      isMultiCurrency: false,
      amount: null,
    }),
    createSchema: [
      z.object({
        _id: optionalString(),
        wallet: selectableSchema("Debes indicar dónde ingresó el dinero"),
        amount: z.number({ coerce: true }).gt(0, "El monto debe ser mayor a 0"),
      }),
      z
        .object({
          _id: optionalString(),
          category: selectableSchema("Debes indicar el tipo de egreso"),
          sub_category: z
            .object({ _id: z.string().optional().nullable() })
            .optional(),
          wallet: selectableSchema("Debes indicar de dónde egresó el dinero"),
          amount: z
            .number({ coerce: true })
            .gt(0, "El monto debe ser mayor a 0"),
        })
        .superRefine((data, ctx) => {
          const categoryValue = data.category?.name;
          if (categoryValue === "Gasto" && !data.sub_category?._id) {
            ctx.addIssue({
              path: ["sub_category"],
              message: `Debes indicar la categoría del gasto`,
              code: z.ZodIssueCode.custom,
            });
          }
          if (categoryValue === "Inversión" && !data.sub_category?._id) {
            ctx.addIssue({
              path: ["sub_category"],
              message: `Debes indicar la categoría de la inversión`,
              code: z.ZodIssueCode.custom,
            });
          }
        }),
      z.object({
        _id: optionalString(),
        amount: z.number({ coerce: true }).gt(0, "El monto debe ser mayor a 0"),
      }),
    ],
    menus: {
      rowItems: (c) => <CashflowRowMenuItems c={c} />,
    },
    loadingKey: "cashflow-form",
    singular: "cobro",
    plural: "cobros",
    placeholder: "Cobros",
    fields: [
      ({ canUpdate, canCreate, user, state }) => {
        return (
          <MainCashflowForm
            user={user}
            canCreate={canCreate}
            canUpdate={canUpdate}
            state={state}
          />
        );
      },
      ({ canUpdate, user, canCreate, creating }) => {
        return (
          <SecondaryCashflowForm
            creating={creating}
            user={user}
            canCreate={canCreate}
            canUpdate={canUpdate}
          />
        );
      },
      ({ canUpdate, user, canCreate }) => {
        return (
          <>
            <DatePicker
              id="cashflow-date-picker"
              entity="cashflow"
              field="date"
              disabled={!canUpdate}
              fromDate={new Date(2025, 0, 1)}
              toDate={
                user.email === "mgesualdo14@gmail.com" ? undefined : new Date()
              }
              // toDate={addDays(new Date(), 6)}
            />
            <MyInput
              id="cashflow-amount"
              placeholder="Monto"
              entity="cashflow"
              field="amount"
              type="number"
              disabled={!canUpdate && !canCreate}
            />
            <MultiSelect
              id="select-wallet"
              form="cashflow"
              field="wallet"
              entity="wallet"
              placeholder="¿De dónde egresó el dinero?"
              justOne
              autoFocus
              hideSearch
              idToFocusAfterSelection="cashflow-detail"
              disabled={!canUpdate && !canCreate}
            />
            <MultiSelect
              id="select-wallet"
              form="cashflow"
              field="wallet_to"
              entity="wallet"
              placeholder="¿A dónde ingresó el dinero?"
              justOne
              autoFocus
              hideSearch
            />
          </>
        );
      },
    ],
    href: "cashflows",
    menu_item: true,
    menu_item_name: "Caja",
    icon: <ArrowUpDown className={iconsClasses} />,
    show: (role: ROLE, is_developer, user) => true,
  },
  quote: {
    new: () => ({
      _id: "",
      client: { _id: "", name: "" },
      vehicle: { _id: "", name: "" },
      services: [],
      discounts: [],
      amount: 0,
      observations: 0,
      valid_days: 0,
      tax: 0,
      default_observations: "",
      avoid_default_observations: false,
      discounts_amount: 0,
      canUpdate: false,
    }),
    menus: {
      rowItems: (q, isOwner, companyName, _, colorAllowed) => (
        <QuoteRowMenuItems
          q={q}
          companyName={companyName}
          isOwner={isOwner}
          colorAllowed={colorAllowed}
        />
      ),
    },
    createSchema: z.object({
      _id: optionalString(),
      client: selectableSchema("Debes elegir un cliente"),
      vehicle: selectableSchema("Debes elegir un vehículo"),
      services: atLeastOneObject("Debes elegir al menos 1 servicio"),
    }),
    loadingKey: "quote-form",
    singular: "cotización",
    plural: "Cotizacións",
    placeholder: "Cotizaciones",
    href: "quotes",
    fields: [
      ({ store, user, canUpdate }) => {
        return (
          <>
            <div className="flex items-center gap-2">
              <MyInput
                id="quotes-valid-days"
                placeholder="Días corridos de validez"
                entity="quote"
                field="valid_days"
                type="number"
                disabled={!canUpdate}
              />
              <MyInput
                id="quotes-tax"
                placeholder="% de IVA"
                entity="quote"
                field="tax"
                type="number"
                disabled={!canUpdate}
              />
            </div>
            <MultiSelect
              id="quote-client"
              entity="client"
              form="quote"
              field="client"
              idToFocusAfterSelection="quote-vehicle"
              resetOnSelect="vehicle"
              justOne
              propercase
              disabled={!canUpdate}
            />

            <MultiSelect
              id="quote-vehicle"
              entity="vehicle"
              form="quote"
              filterIdField="client"
              field="vehicle"
              resetOnSelect="services"
              idToFocusAfterSelection="quote-service"
              justOne
              disabled={!canUpdate}
              hideSearch
            />
            <MultiSelect
              id="quote-service"
              entity="service"
              filterIdField="vehicle"
              form="quote"
              field="services"
              placeholder="Servicio/s a cotizar"
              disabled={!canUpdate}
              canRepeat
              idToFocusAfterSelection="quote-amount"
            >
              {(si) => {
                return (
                  <>
                    <QuoteServices services={si} currency={store?.currency} />
                    <QuoteServices services={si} currency="usd" />
                  </>
                );
              }}
            </MultiSelect>
            <MyTextArea
              entity="quote"
              field="observations"
              placeholder="Observaciones..."
            />
            <MyCheckboxField
              entity="quote"
              field="avoid_total"
              id="1"
              text="Ocultar el total"
              className="mt-2"
            >
              Oculta la sumatoria total de servicios cotizados
            </MyCheckboxField>
          </>
        );
      },
    ],
    menu_item: true,
    menu_item_name: "Cotizaciones",
    icon: <Calculator className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      ["Socio", "Encargado", "Técnico"].includes(role),
  },
  client: {
    new: () => ({
      _id: undefined,
      kind: "person",
      name: "",
      firstname: "",
      lastname: "",
      email: "",
      fiscal_id: "",
      address: "",
      phone: "",
      dob: {},
      brand: {},
      insurance: {},
      vehicle_kind: {},
      model: "",
      patent: "",
    }),
    menus: {
      rowItems: (c, _, companyName) => (
        <ClientRowMenuItems c={c} companyName={companyName} />
      ),
    },
    ui: {
      selects: {
        handleNewItem: (update, useStore) => {
          const country = getCountry(
            useStore.getState().current_store,
            "client"
          );
          update("client", {
            ...ENTITIES.client.new(),
            country,
            phone: "",
            formatted_number: "",
            was_creating: useStore.getState().creating,
            canCreate: true,
          });
          update("openDialog", "client");
          update("openDialogIndex", 0);
          update("creating", true);
        },
        newItemText: "Nuevo cliente",
        newItemInForm: (form) => form === "sale" || form === "quote",
      },
    },
    createSchema: z.object({
      _id: optionalString(),
      firstname: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      lastname: optionalString(),
      email: z.string().refine(
        (val) => {
          return (
            val === "" ||
            val === null ||
            z.string().email().safeParse(val).success
          );
        },
        {
          message: "Email inválido",
        }
      ),
      address: optionalString(),
      dob: z.union([
        z.object({
          day: z.number(),
          month: z.number(),
          year: z
            .number()
            .min(
              addYears(new Date(), -100).getFullYear(),
              "El cliente no puede tener más de 100 años"
            ),
        }),
        z.object({}).strict(),
      ]),
      phone: optionalString(),
      vehicle_kind: selectableSchema("Debes indicar el tipo de vehículo"),
      brand: selectableSchema("Debes indicar la marca del vehículo"),
      model: optionalString(),
      patent: optionalString(),
    }),
    updateSchema: z.object({
      _id: optionalString(),
      firstname: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      lastname: optionalString(),
      email: z.string().refine(
        (val) => {
          return (
            val === "" ||
            val === null ||
            z.string().email().safeParse(val).success
          );
        },
        {
          message: "Email inválido",
        }
      ),
      address: optionalString(),
      dob: z.union([
        z.object({
          day: z.number(),
          month: z.number(),
          year: z
            .number()
            .min(
              addYears(new Date(), -100).getFullYear(),
              "El cliente no puede tener más de 100 años"
            ),
        }),
        z.object({}).strict(),
      ]),
      phone: optionalString(),
    }),
    loadingKey: "client-form",
    singular: "cliente",
    plural: "Clientes",
    placeholder: "Cliente",
    href: "clients",
    fields: [
      ({ store, creating, can_view_phone_client }) => (
        <>
          <TooglePersonKind
            form="client"
            field="kind"
            value1="person"
            value2="company"
          />
          <div className="flex gap-2">
            <MyInput
              entity="client"
              field="firstname"
              placeholder={(kind) =>
                kind === "person" ? "Nombre" : "Denominación"
              }
              monitoredField="kind"
              autoFocus={creating}
              shouldHide={(kind) => kind === "person"}
              shouldHideField="kind"
              className="w-full"
            />
            <MyInput
              entity="client"
              field="firstname"
              placeholder="Nombre"
              autoFocus={creating}
              shouldHide={(kind) => kind === "company"}
              shouldHideField="kind"
            />
            <MyInput
              entity="client"
              field="lastname"
              placeholder="Apellido"
              idFocusAfterTab="phone"
              shouldHide={(kind) => kind === "company"}
              shouldHideField="kind"
            />
          </div>
          {(can_view_phone_client || creating) && (
            <MyInput
              id="phone"
              entity="client"
              type="tel"
              field="phone"
              placeholder="Teléfono"
            />
          )}
          <BirthdayInput />
          {store?.allow_client_email && (
            <MyInput
              entity="client"
              type="email"
              field="email"
              placeholder="Email"
            />
          )}
          {store?.allow_client_fiscal_id && (
            <MyInput
              entity="client"
              field="fiscal_id"
              placeholder="N° de documento"
            />
          )}
          {store?.allow_client_address && (
            <StoreMap
              form="client"
              hideMap
              placeholder="Domicilio"
              store={store}
            />
          )}

          {creating && (
            <>
              <h2 className="block font-bold mt-2 -mb-1">Datos del vehículo</h2>

              <MultiSelect
                id="vehicle_kind"
                form="client"
                entity="vehicle-kind"
                field="vehicle_kind"
                idToFocusAfterSelection="vehicle_brand"
                placeholder="Clasificación para precios"
                justOne
                hideSearch
              />
              <div className="flex gap-2 w-full">
                <MultiSelect
                  id="vehicle_brand"
                  form="client"
                  entity="brand"
                  field="brand"
                  className="!w-full"
                  idToFocusAfterSelection={
                    store?.allow_vehicle_insurance
                      ? "vehicle_insurance"
                      : "vehicle_model"
                  }
                  justOne
                />
                {store?.allow_vehicle_insurance && (
                  <MultiSelect
                    id="vehicle_insurance"
                    form="client"
                    entity="institution"
                    field="insurance"
                    flag="insurance"
                    placeholder="Aseguradora"
                    idToFocusAfterSelection="vehicle_model"
                    justOne
                  />
                )}
              </div>
              <div className="flex gap-2">
                <MyInput
                  id="vehicle_model"
                  entity="client"
                  field="model"
                  placeholder="Modelo"
                />
                <MyInput entity="client" field="patent" placeholder="Patente" />
              </div>
            </>
          )}
        </>
      ),
    ],
    onSuccess: ({ state, update, response, dialogToOpen }) => {
      if (dialogToOpen) {
        const updates = {
          client: {
            _id: response.data.createdClientId,
            name: `${state.firstname} ${state.lastname}`,
            lat: response.data.lat,
            lng: response.data.lng,
          },

          vehicle: {
            _id: response.data.createdVehicleId,
            pre_name: `${CONFIG.blob_url}/brands/${toSlug(
              state.brand.name
            )}.png`,
            name: `${
              state.vehicle_kind.emoji ? state.vehicle_kind.emoji : ""
            }  ${state.vehicle_kind.name}`,
            detail: state.model,
            brand: state.brand,
          },
          services: [],
        };

        update(dialogToOpen, updates);
        update("creating", state.was_creating ? true : false);
        focusAfter("sale-service", 100, true);
      }
    },
    menu_item: true,
    menu_item_name: "Clientes",
    icon: <Users className={iconsClasses} />,
    show: (role: ROLE, is_developer) => true,
  },
  service: {
    new: (store) => ({
      _id: "",
      name: "",
      detail: "",
      redo_after_days: 0,
      manteinance_after_days: 0,
      manteinance_fee: 0,
      quotes_description: "",
      allow_quantity: false,
      currency: store?.currency,
      prices: [],
      stores: [],
    }),
    createSchema: z.object({
      _id: optionalString(),
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      detail: z
        .string()
        .max(60, "La aclaración debe tener máximo 60 caracteres")
        .optional(),
      stores: atLeastOneObject(
        "Elige al menos 1 sucursal donde se prestará el servicio"
      ),
    }),
    menus: {
      rowItems: (s, isOwner) => <ServiceRowMenuItems s={s} isOwner={isOwner} />,
    },
    loadingKey: "service-form",
    singular: "servicio",
    plural: "Servicios",
    placeholder: "Servicios",
    fields: [
      ({ creating, store, canUpdate }) => {
        return (
          <div key="prices" className="flex flex-col gap-2">
            <MyInput
              key="name"
              entity="service"
              field="name"
              placeholder="Denominación"
              autoFocus={creating}
              disabled={canUpdate === false}
            />
            <MyInput
              key="detail"
              entity="service"
              field="detail"
              placeholder="Aclaración... (opcional)"
              disabled={canUpdate === false}
            />
            <MultiSelect
              form="service"
              field="stores"
              entity="store"
              placeholder="¿En qué sucursal/es se ofrece?"
              prefetch
              hideSearch
              disabled={canUpdate === false}
            />

            <MultiSelect
              id="vehicle-kinds"
              form="service"
              entity="vehicle-kind"
              field="prices"
              hideSearch
              prefetch
              allSelectedByDefault
              disabled={canUpdate === false}
            >
              {() => <ServicePrices canUpdate={canUpdate} />}
            </MultiSelect>

            <MyCheckboxField
              entity="service"
              field="allow_quantity"
              id="1"
              text="Admite indicar cantidad"
            >
              Útil para servicios sobre partes del vehículo.<br></br>Ej: pulido
              de ópticas
            </MyCheckboxField>
          </div>
        );
      },
      ({ user, creating, canUpdate }) => {
        return (
          <>
            <MyTextArea
              entity="service"
              field="quotes_description"
              placeholder="Detalle por defecto para cotizaciones..."
            />
            {/* <MyInput
              key="redo_after_days"
              entity="service"
              field="redo_after_days"
              placeholder="Días para repetir el servicio..."
              autoFocus={creating}
              disabled={canUpdate === false}
            />
            <MyInput
              key="manteinance_after_days"
              entity="service"
              type="number"
              field="manteinance_after_days"
              placeholder="Días para mantenimiento..."
              disabled={canUpdate === false}
            />
            <MyInput
              key="manteinance_fee"
              entity="service"
              type="number"
              field="manteinance_fee"
              min={0}
              max={100}
              placeholder="Costo del mantenimiento... (en %)"
              disabled={canUpdate === false}
            /> */}
          </>
        );
      },
    ],
    href: "services",
    menu_item: true,
    menu_item_name: "Servicios",
    icon: <Bell className={iconsClasses} />,
    show: (role: ROLE, is_developer) => true,
  },
  "vehicle-kind": {
    new: () => ({ _id: "", name: "", classification_id: "" }),
    createSchema: z.object({
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      // classification_id: z
      //   .string({
      //     required_error:
      //       "Debes elegir una imagen representativa para esta clasificación",
      //   })
      //   .min(
      //     1,
      //     "Debes elegir una imagen representativa para esta clasificación"
      //   ),
    }),
    loadingKey: "vehicle-kind-form",
    singular: "clasificación",
    plural: "clasificaciones",
    placeholder: "Clasificaciones de vehículos",
    href: "vehicle-kinds",
    fields: [
      ({ creating }) => (
        <div className="flex items-center w-full gap-2">
          <DropdownVehicles />

          <MyInput
            id="kind_name"
            entity="vehicle-kind"
            field="name"
            placeholder="Denominación"
            className="w-full"
          />
        </div>
      ),
    ],
  },
  "cashflow-sub-category": {
    new: () => ({
      _id: "",
      name: "",
      category: {},
      subCategory: {},
      kind: {},
    }),
    createSchema: z.object({
      category: selectableSchema("Debes indicar el tipo"),
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
    }),
    loadingKey: "cashflow-sub-category-form",
    singular: "categoría",
    plural: "categorías",
    fields: [
      ({ creating }) => (
        <div className="flex flex-col gap-2">
          <MultiSelect
            form="cashflow-sub-category"
            entity="cashflow"
            field="category"
            hideSearch
            placeholder="Tipo de egreso"
            action="getCategories"
            idToFocusAfterSelection="sub-category-name"
            justOne
          />
          <MyInput
            id="sub-category-name"
            entity="cashflow-sub-category"
            field="name"
            placeholder="Denominación categoría"
            className="w-full"
          />
        </div>
      ),
    ],
  },
  comment: {
    new: () => ({
      text: "",
    }),
    createSchema: z.object({
      text: z.string(),
    }),
    loadingKey: "comment-form",
    singular: "comentario",
    plural: "Comentarios",
    placeholder: "Comentario",
    fields: [({ creating }) => <MyInput entity="comment" field="text" />],
  },
  attachment: {
    new: () => ({
      kind: "",
      description: "",
      blob: "",
    }),
    createSchema: z.object({
      kind: z.string(),
      description: z
        .string({ required_error: "Debes indicar una descripción" })
        .min(3, "La descripción debe tener al menos 3 caracteres"),
    }),
    menus: {
      rowItems: (a) => {
        return <AttachmentRowMenuItems a={a} />;
      },
    },
    href: "attachments",
    loadingKey: "attachment-form",
    singular: "adjunto",
    plural: "Archivos adjuntos",
    placeholder: "Archivo adjunto",
    fields: [
      ({ creating }) => (
        <>
          <FileUploadInput
            form="attachment"
            field="blob"
            name="blob"
            text="Seleccionar archivo"
            acceptedTypes="*/*"
            acceptedDescription="Cualquier archivo, hasta 2 MB"
          />
          <MyInput
            entity="attachment"
            field="description"
            placeholder="Descripción..."
          />
        </>
      ),
    ],
  },
  screen: {
    new: () => ({
      name: "",
    }),
    singular: "pantalla",
    plural: "pantallas",
    placeholder: "Pantallas",
  },
  "subscription-plan": {
    new: () => ({
      stores: 1,
      _id: "",
      discount_code: "",
      discount_percent: 0,
      unit_amount: 0,
      frequency: 1,
      mp_plan_id: "",
    }),
  },
  discount: {
    new: () => ({
      kind: "%",
      name: "",
      value: "",
      stores: [],
    }),
    createSchema: z.object({
      name: z.string(),
      kind: z.string(),
      value: z.number({ coerce: true }).gt(0, "El valor debe ser mayor a 0"),
    }),
    loadingKey: "discount-form",
    singular: "descuento",
    plural: "Descuentos",
    placeholder: "Descuento",
    href: "discounts",
    fields: [({ creating }) => <DiscountForm />],
    onSubmit: ({ state, update, useStore }) => {
      const sale = useStore.getState().sale;
      const saleDiscounts = sale.discounts || [];
      const finalAmount =
        state.kind === "$ Monto"
          ? state.amount
          : +(state.percent / 100).toFixed(2) * sale.amount;

      const newDiscount = {
        kind: state.kind,
        percent: state.kind === "$ Monto" ? 0 : state.percent,
        amount: finalAmount,
        concept: state.concept,
      };

      update("sale", {
        discounts: saleDiscounts.concat(newDiscount),
      });
      update("openDialog", "sale");
      update("openDialogIndex", 0);
      update("creating", !sale?._id);
      return { ok: true, message: "Descuento agregado" };
    },
    onSuccess: ({ update, useStore, response }) => {
      const saleDiscounts = useStore.getState().sale.discounts || [];
      update("sale", {
        discounts: saleDiscounts.concat(response.data),
      });
    },
    menu_item: true,
    menu_item_name: "Descuentos",
    icon: <Percent className={iconsClasses} />,
    show: (role: ROLE, is_developer) => role === "Socio",
  },
  template: {
    new: () => ({
      _id: "",
      name: "",
      of: "Whatsapp",
      content: "",
      stores: [],
      screens: [],
    }),
    menus: {
      rowItems: (t, isOwner) => (
        <TemplateRowMenuItems t={t} isOwner={isOwner} />
      ),
    },
    createSchema: z.object({
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      // content: z
      //   .string({ required_error: "Debes indicar el contenido del mensaje" })
      //   .min(10, "El mensaje debe tener al menos 10 caracteres"),
    }),
    loadingKey: "template-form",
    singular: "plantilla",
    plural: "Plantillas",
    placeholder: "Plantilla",
    href: "templates",
    fields: [
      ({ creating, canUpdate, state }) => (
        <>
          <MyInput
            entity="template"
            field="name"
            placeholder="Denominación"
            autoFocus={creating}
            disabled={canUpdate === false || state.locked}
          />
          <MultiSelect
            form="template"
            field="stores"
            entity="store"
            placeholder="¿En qué sucursal/es se utiliza?"
            prefetch
            disabled={canUpdate === false}
          />
          <MultiSelect
            form="template"
            field="screens"
            entity="screen"
            placeholder="¿Desde qué pantalla/s se utiliza?"
            prefetch
            disabled={canUpdate === false || state.locked}
          />
          <MyTextAreaCE
            id="template-content"
            entity="template"
            field="content"
            placeholder="Contenido del mensaje"
            disabled={canUpdate === false}
          />
        </>
      ),
    ],
    menu_item: true,
    menu_item_name: "Plantillas",
    icon: <Send className={iconsClasses} />,
    show: (role: ROLE) => true,
  },
  "whatsapp-number": {
    new: () => ({ _id: "", number: "" }),
    menus: {
      rowItems: (w, isOwner) => (
        <WhatsappNumberRowMenuItems w={w} isOwner={isOwner} />
      ),
    },
    createSchema: z.object({}),
    loadingKey: "whatsapp-number-form",
    singular: "número de whatsapp",
    plural: "Números de whatsapp",
  },
  member: {
    new: () => ({
      _id: undefined,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      sales_percentage: 0,
      fixed_salary: 0,
      payment_type: {},
      pay_cycle: {},
      role: {},
      stores: [],
    }),
    menus: {
      rowItems: (m, isOwner, companyName) => (
        <MemberRowMenuItems m={m} companyName={companyName} />
      ),
    },
    createSchema: z.object({
      _id: optionalString(),
      firstname: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      lastname: optionalString(),
      email: z
        .string({ required_error: "Debes indicar el email" })
        .email("Email inválido"),
      phone: optionalString(),
      role: selectableSchema("Elige el ROL de este integrante"),
      stores: atLeastOneObject("Elige al menos 1 sucursal donde trabajará"),
    }),
    loadingKey: "member-form",
    singular: "integrante",
    plural: "integrantes",
    placeholder: "Integrante",
    href: "members",
    fields: [
      () => (
        <>
          <div className="flex gap-2">
            <MyInput
              entity="member"
              field="firstname"
              placeholder="Nombre"
              autocomplete="off"
              trim
            />
            <MyInput
              entity="member"
              field="lastname"
              placeholder="Apellido"
              autocomplete="off"
              trim
            />
          </div>
          <MyInput
            entity="member"
            type="tel"
            field="phone"
            placeholder="Teléfono"
          />
          <MyInput
            entity="member"
            type="email"
            field="email"
            placeholder="Email para ingresar"
            autocomplete="off"
            toLowerCase
            trim
          />

          <MultiSelect
            form="member"
            field="role"
            entity="role"
            justOne
            placeholder="Rol en la empresa"
          />

          <MultiSelect form="member" field="stores" entity="store" />
        </>
      ),
      () => <MemberSalary />,
      () => <MemberPermissions />,
    ],
    menu_item: true,
    menu_item_name: "Personal",
    icon: <UserCog2 className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      ["Socio"].includes(role) || is_developer,
  },
  wallet: {
    new: (store) => ({
      name: "",
      institution: {},
      logo_url: "",
      currency: store?.currency || "ars",
      stores: [],
      counted_closing: null,
      closure_comment: "",
    }),
    createSchema: [
      z.object({
        _id: optionalString(),
        name: z
          .string({ required_error: "Debes indicar un nombre" })
          .min(3, "El nombre debe tener al menos 3 caracteres"),
        institution: selectableSchema("Elige una entidad financiera"),
      }),
    ],
    menus: {
      rowItems: (w) => <WalletRowMenuItems w={w} />,
    },
    loadingKey: "wallet-form",
    singular: "billetera",
    plural: "Billeteras",
    placeholder: "¿Dónde ingresa el dinero?",
    href: "wallets",
    fields: [
      ({ creating, store }) => (
        <>
          {store?.country_code === "AR" && (
            <ToggleCurrency
              form="wallet"
              field="currency"
              value1={store?.currency}
              value2="usd"
            />
          )}
          <MultiSelect
            form="wallet"
            field="institution"
            entity="institution"
            placeholder="Entidad financiera"
            justOne
            idToFocusAfterSelection="wallet-name"
          />
          <MyInput
            id="wallet-name"
            entity="wallet"
            field="name"
            placeholder="Denominación, alias o tipo de cuenta"
          />

          <MultiSelect
            form="wallet"
            field="stores"
            entity="store"
            placeholder="¿En qué sucursal/es se utiliza?"
            prefetch
          />
        </>
      ),
      ({ creating, store }) => <WalletClosureForm />,
    ],
    menu_item: true,
    menu_item_name: "Billeteras",
    icon: <Wallet2 className={iconsClasses} />,
    show: (role: ROLE, is_developer) => role === "Socio" || is_developer,
  },
  store: {
    new: () => ({
      _id: "",
      name: "",
      address: "",
      lat: 0,
      lng: 0,
      services: [],
      templates: [],
      members: [],
      wallets: [],
      discounts: [],
      usd_exchange_rate: 0,
      quotes_observations: "",
      quotes_valid_days: null,
      quotes_primary_color: "",
      quotes_dark_mode: false,
      quotes_secondary_color: "",
      quotes_tax: 0,
      quotes_payment_conditions: "",
      allow_pick_up_date: false,
    }),
    menus: {
      rowItems: (s) => <StoreRowMenuItems s={s} />,
    },
    createSchema: z.object({
      address: z
        .string({ required_error: "Debes indicar una dirección" })
        .min(3, "La dirección debe tener al menos 3 caracteres"),
      lat: z
        .number()
        .optional()
        .refine((val) => val === undefined || val !== 0, {
          message: "Debes elegir una ubicación en el mapa",
        }),
      allow_pick_up_date: z.boolean(),
    }),
    updateSchema: z.object({
      name: z
        .string({ required_error: "Debes indicar una denominación" })
        .min(3, "La denominación debe tener al menos 3 caracteres"),
      address: z
        .string({ required_error: "Debes indicar una dirección" })
        .min(3, "La dirección debe tener al menos 3 caracteres"),
    }),
    loadingKey: "store-form",
    singular: "sucursal",
    plural: "Sucursales",
    placeholder: "Sucursales",
    href: "stores",
    fields: [
      ({ creating, state }) => (
        <>
          <MyInput
            entity="store"
            field="name"
            placeholder="Denominación"
            autoFocus={creating}
          />
          <StoreMap form="store" />
          {creating && (
            <>
              <MultiSelect
                className="mt-3"
                form="store"
                entity="member"
                field="members"
                placeholder="Asignar personal"
                prefetch
              />
              <MultiSelect
                form="store"
                entity="service"
                field="services"
                placeholder="Asignar servicios"
                prefetch
              />

              <MultiSelect
                form="store"
                entity="wallet"
                field="wallets"
                placeholder="Asignar billeteras"
                prefetch
              />
              <MultiSelect
                form="store"
                entity="template"
                field="templates"
                placeholder="Asignar plantillas de Whatsapp"
                prefetch
              />
              <MultiSelect
                form="store"
                entity="discount"
                field="discounts"
                placeholder="Asignar descuentos"
                prefetch
              />
            </>
          )}
        </>
      ),
      ({ store, user, canUpdate }) => (
        <>
          <div className="flex items-center gap-2">
            <MyInput
              id="quotes-valid-days"
              placeholder="Días corridos de validez"
              entity="store"
              field="quotes_valid_days"
              type="number"
              disabled={!canUpdate}
            />
            <MyInput
              id="quotes-tax"
              placeholder="% de IVA"
              entity="store"
              field="quotes_tax"
              type="number"
              disabled={!canUpdate}
            />
          </div>
          <div className="flex items-center gap-2">
            <MyInput
              id="quotes-primary-color"
              placeholder="Color primario"
              entity="store"
              field="quotes_primary_color"
              type="color"
              className="w-full"
              disabled={!canUpdate}
            />
            <MyInput
              id="quotes-secondary-color"
              placeholder="Color secundario"
              entity="store"
              field="quotes_secondary_color"
              type="color"
              className="w-full"
              disabled={!canUpdate}
            />
          </div>
          <MyTextArea
            id="quotes-observations"
            entity="store"
            field="quotes_observations"
            disabled={!canUpdate}
            placeholder="Observaciones por defecto..."
          />
          <MyCheckboxField
            id="quotes-dark-mode"
            entity="store"
            field="quotes_dark_mode"
            text="Modo oscuro"
            className="mt-2"
          >
            Permite que las cotizaciones se muestren en modo oscuro
          </MyCheckboxField>
        </>
      ),
      ({ creating, state }) => (
        <>
          <div className="flex flex-col mt-2.5">
            <CardTitle>Configuraciones ventas</CardTitle>
            <div className="flex flex-col gap-1">
              <MyCheckboxField
                entity="store"
                field="allow_pick_up_date"
                id="pick_up_date"
                text="Indicar fecha y hora de retiro"
                className="mt-1"
              >
                Posibilidad de indicar fecha y hora estimada de retiro de un
                vehículo al crear una venta
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="show_permanence"
                id="show_permanence"
                text="Visualizar permanencia"
              >
                Visualizar fácilmente la permanencia de cada vehículo en el
                local desde la vista Semanal de ventas.
                <br />
                <br />
                Ideal para negocios donde el vehículo permanezca 2 o más días en
                la sucursal y se precisa conocer la cantidad de vehículos que
                habría en cada fecha.
                <br />
                <br />
                Para que esta configuración tenga efecto, es necesario indicar
                la <br />
                <u>Fecha de estimada de retiro</u> de cada vehículo.
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="allow_automatic_reminders"
                id="reminders"
                text="Recordatorios automáticos"
              >
                Enviar recordatorios a clientes automáticamente 24 hs antes del
                turno.
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="allow_workers"
                id="workers"
                text="Indicar trabajadores"
              >
                Posibilidad de indicar qué usuarios con rol de
                &quot;Técnico&quot; realizarán los servicios de cada venta.
                <br />
                <br />
                También habilita la posibilidad de configurar el sueldo de cada
                Técnico desde la pestaña de &quot;Personal&quot;.
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="allow_sale_color"
                id="colors"
                text="Diferenciar por colores"
              >
                Posibilidad de asignar un color a la venta para reconocerlas más
                fácilmente.
                <br />
                <br />
                Algunos negocios lo utilizan, por ejemplo, para diferenciar qué
                vehículos ya ingresaron al negocio, o cuáles están dentro o
                fuera del local.
              </MyCheckboxField>
            </div>
          </div>

          <div className="flex flex-col mt-3">
            <CardTitle>Configuraciones clientes</CardTitle>
            <div className="flex flex-col gap-1">
              <MyCheckboxField
                entity="store"
                field="allow_client_email"
                id="client_email"
                text="Indicar email de clientes"
                className="mt-1"
              >
                Posibilidad de inidicar el email del cliente al crearlo
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="allow_client_fiscal_id"
                id="client_fiscal_id"
                text="Indicar documento de clientes"
              >
                Posibilidad de inidicar el documento del cliente al crearlo
              </MyCheckboxField>
              <MyCheckboxField
                entity="store"
                field="allow_client_address"
                id="client_address"
                text="Indicar domicilio de clientes"
              >
                Posibilidad de inidicar el domicilio del cliente al momento de
                crearlo.
              </MyCheckboxField>
            </div>
          </div>

          <div className="flex flex-col mt-3">
            <CardTitle>Configuraciones vehículos</CardTitle>
            <div className="flex flex-col gap-1">
              <MyCheckboxField
                entity="store"
                field="allow_vehicle_insurance"
                id="allow_vehicle_insurance"
                text="Indicar aseguradora de vehículos"
                className="mt-1"
              >
                Posibilidad de inidicar la aseguradora contratada para cada
                vehículo.
              </MyCheckboxField>
            </div>
          </div>
        </>
      ),
      ({ creating, state }) => (
        <MyInput
          id="store-usd-exchange-rate"
          placeholder="Tipo de cambio 🇺🇸"
          entity="store"
          field="usd_exchange_rate"
          type="number"
        />
      ),
    ],
    menu_item: true,
    menu_item_name: "Sucursales",
    icon: <MapPin className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      ["Socio"].includes(role) || is_developer,
  },
  report: {
    new: () => {},
    createSchema: z.any(),
    singular: "informe",
    plural: "Informes",
    placeholder: "Informes",
    href: "reports",
    menu_item: true,
    menu_item_name: "Informes",
    icon: <ChartAreaIcon className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      ["Socio"].includes(role) || is_developer,
  },
  tutorial: {
    new: () => ({ _id: "" }),
    href: "tutorials",
    menu_item: true,
    menu_item_name: "Tutoriales",
    icon: <Video className={iconsClasses} />,
    show: () => true,
  },
  subscription: {
    new: (country = null, createdAt?: Date) => ({
      _id: "",
      discount_code: "",
      plan_id: "",
      mp_email: "",
      quotes: CONFIG.subscriptions.quote.free_limit,
      files: CONFIG.subscriptions.file.free_limit,
      messages: CONFIG.subscriptions.whatsapp.free_limit,
      amount: CONFIG.subscriptions.prices(country, createdAt)?.aquapp,
    }),
    href: "subscription",
    menu_item: true,
    menu_item_name: "Suscripción",
    icon: <CreditCard className={iconsClasses} />,
    show: (role: ROLE, is_developer) => role === "Socio",
  },
  user: {
    new: () => ({
      _id: undefined,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      avatar_url: "",
    }),
    createSchema: z.object({
      _id: optionalString(),
      firstname: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      lastname: optionalString(),
      email: z.string().refine(
        (val) => {
          return (
            val === "" ||
            val === null ||
            z.string().email().safeParse(val).success
          );
        },
        {
          message: "Email inválido",
        }
      ),
      phone: optionalString(),
    }),
    loadingKey: "user-form",
    singular: "usuario",
    plural: "usuarios",
    placeholder: "Usuarios",
    fields: [
      ({ creating }) => (
        <>
          <div className="flex gap-2">
            <MyInput
              entity="user"
              field="firstname"
              placeholder="Nombre"
              autoFocus={creating}
            />
            <MyInput entity="user" field="lastname" placeholder="Apellido" />
          </div>
          <MyInput
            entity="user"
            type="tel"
            field="phone"
            placeholder="Teléfono"
          />

          <FileUploadInput
            name="avatar"
            form="user"
            field="avatar_url"
            text="Foto de perfil"
            acceptedTypes="image/*"
          />
        </>
      ),
    ],
  },
  vehicle: {
    new: () => ({
      brand: { _id: "", name: "" },
      vehicle_kind: { _id: "", name: "" },
      insurance: { _id: "", name: "" },
      model: "",
      patent: "",
      canCreate: true,
    }),
    ui: {
      selects: {
        handleNewItem: (update, useStore, form) => {
          const userId = useStore.getState()[form].client._id;
          update("vehicle", {
            user_id: userId,
            ...ENTITIES.vehicle.new(),
            was_creating: useStore.getState().creating,
            canCreate: true,
          });
          update("openDialog", "vehicle");
          update("openDialogIndex", 0);
          update("creating", true);
          focusAfter("vehicle-brand", 50, true);
        },
        newItemText: "Nuevo vehículo",
        newItemInForm: (form) => form === "sale" || form === "quote",
      },
    },
    createSchema: z.object({
      vehicle_kind: selectableSchema("Debes indicar el tipo de vehículo"),
      brand: selectableSchema("Debes indicar la marca del vehículo"),
      model: optionalString(),
      patent: optionalString(),
    }),
    loadingKey: "vehicle-form",
    singular: "vehículo",
    plural: "vehículos",
    placeholder: "Vehículo",
    fields: [
      ({ creating, store }) => (
        <>
          <MultiSelect
            id="vehicle_kind"
            form="vehicle"
            entity="vehicle-kind"
            field="vehicle_kind"
            idToFocusAfterSelection="vehicle_brand"
            placeholder="Clasificación para precios"
            justOne
            hideSearch
          />
          <div className="flex gap-2 w-full">
            <MultiSelect
              id="vehicle_brand"
              form="vehicle"
              entity="brand"
              field="brand"
              idToFocusAfterSelection={
                store?.allow_vehicle_insurance
                  ? "vehicle_insurance"
                  : "vehicle_model"
              }
              justOne
            />
            {store?.allow_vehicle_insurance && (
              <MultiSelect
                id="vehicle_insurance"
                form="vehicle"
                entity="institution"
                field="insurance"
                flag="insurance"
                placeholder="Aseguradora"
                idToFocusAfterSelection="vehicle_model"
                justOne
              />
            )}
          </div>
          <MyInput
            id="vehicle_model"
            entity="vehicle"
            field="model"
            placeholder="Modelo"
          />
          <MyInput entity="vehicle" field="patent" placeholder="Patente" />
        </>
      ),
    ],
    onSuccess: ({ state, update, response, dialogToOpen }) => {
      const updates = {
        vehicle: {
          _id: response.data.createdVehicleId,
          pre_name: `${CONFIG.blob_url}/brands/${toSlug(state.brand.name)}.png`,
          name: `${state.vehicle_kind.emoji ? state.vehicle_kind.emoji : ""}  ${
            state.vehicle_kind.name
          }`,
          detail: state.model,
          brand: state.brand,
        },
        services: [],
      };

      update(dialogToOpen, updates);
      update("creating", state.was_creating ? true : false);
      focusAfter(`${dialogToOpen}-service`, 100, true);
    },
  },
  brand: {
    new: () => ({
      company_id: 1,
      name: "",
      logo_url: "",
      vehicles: [],
    }),
    createSchema: z.object({ name: z.string() }),
    loadingKey: "brand-form",
    singular: "marca",
    plural: "Marcas",
    placeholder: "Marca",
    href: "brands",
    fields: [
      ({ creating }) => (
        <>
          <MyInput
            entity="brand"
            field="name"
            placeholder="Denominación"
            autoFocus={creating}
          />
          <FileUploadInput
            name="image"
            form="brand"
            field="logo_url"
            acceptedTypes="image/*"
          />
        </>
      ),
    ],
    menu_item: true,
    menu_item_name: "Marcas",
    icon: <Tags className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      is_developer && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
  },
  company: {
    new: () => ({
      name: "",
      address: "",
      logo_url: "",
      phone: "",
      fiscal_id: "",
      fiscal_category: {},
      canCreate: true,
    }),
    createSchema: z.object({
      _id: optionalString(),
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
      address: z
        .string({ required_error: "Debes indicar una dirección" })
        .min(3, "La dirección debe tener al menos 3 caracteres"),
      lat: z.number({ required_error: "Debes indicar una ubicación" }),
      phone: z
        .string({ required_error: "Teléfono inválido" })
        .min(3, "Teléfono inválido"),
    }),
    updateSchema: z.object({
      _id: optionalString(),
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
    }),
    menus: {
      rowItems: (c, isOwner, companyName) => {
        return <CompanyRowMenuItems c={c} />;
      },
    },
    loadingKey: "company-form",
    singular: "empresa",
    plural: "Empresas",
    placeholder: "Empresa",
    href: "companies",
    fields: [
      ({ user, creating, store }) => {
        return (
          <>
            <MyInput
              entity="company"
              field="name"
              placeholder="Nombre de tu empresa"
              autoFocus={creating}
            />
            <MyInput
              entity="company"
              type="tel"
              field="phone"
              placeholder="Celular de contacto"
            />
            {/* {creating && (
              <MyInput
                entity="company"
                field="address"
                placeholder="Dirección de la 1era sucursal"
              />
            )} */}
            {creating && (
              <StoreMap
                form="company"
                placeholder="Dirección 1era sucursal..."
                user={user}
              />
            )}

            <FileUploadInput
              name="logo"
              form="company"
              field="logo_url"
              acceptedTypes="image/*"
            />
            {!creating && store?.country_code === "AR" && (
              <>
                <MyInput
                  entity="company"
                  field="fiscal_id"
                  placeholder="CUIT"
                />
                <MultiSelect
                  form="company"
                  entity="company"
                  field="fiscal_category"
                  placeholder="Condición frente al IVA"
                  items={[
                    { _id: "monotributo", name: "Monotributo" },
                    {
                      _id: "responsable_inscripto",
                      name: "Responsable Inscripto",
                    },
                  ]}
                  justOne
                />
              </>
            )}
          </>
        );
      },
    ],
  },
  institution: {
    new: () => ({
      name: "",
      is_financial: false,
      logo_url: false,
    }),
    createSchema: z.object({
      _id: optionalString(),
      name: z
        .string({ required_error: "Debes indicar un nombre" })
        .min(3, "El nombre debe tener al menos 3 caracteres"),
    }),
    loadingKey: "institution-form",
    singular: "entidad",
    plural: "Instituciones financieras",
    placeholder: "Entidad",
    href: "institutions",
    fields: [
      ({ creating }) => {
        return (
          <>
            <MyCheckboxField
              entity="institution"
              field="is_financial"
              id="is_financial"
              text="Es financiera"
            >
              Indica si esta institución es una entidad financiera (banco,
              fintech, etc.)
            </MyCheckboxField>
            <MyCheckboxField
              entity="institution"
              field="is_insurance"
              id="is_insurance"
              text="Es aseguradora de autos"
            >
              Indica si esta institución es una aseguradora de autos
            </MyCheckboxField>
            <MyInput
              entity="institution"
              field="name"
              placeholder="Denominación"
              autoFocus={creating}
            />
            <FileUploadInput
              name="logo"
              form="institution"
              field="logo_url"
              acceptedTypes="image/*"
            />
          </>
        );
      },
    ],
    menu_item: true,
    menu_item_name: "Instituciones",
    icon: <BuildingIcon className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      is_developer && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
  },
  admin: {
    new: () => ({
      name: "",
    }),
    href: "admin",
    menu_item: true,
    menu_item_name: "Admin",
    icon: <ChartBar className={iconsClasses} />,
    show: (role: ROLE, is_developer) =>
      is_developer && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
  },
};

export type ENTITIES_KEYS = keyof typeof ENTITIES;
export const ENTITIES_NAMES = Object.keys(ENTITIES) as [ENTITIES_KEYS];

export const ENTITIES_ARRAY = ENTITIES_NAMES.map((e) => ({
  name: e,
  ...ENTITIES[e],
}));

export const MENU_ITEMS = ENTITIES_ARRAY.filter((e: any) => e.menu_item);

export const EMPTY_ENTITIES = ENTITIES_NAMES.reduce(
  (prev, curr: any) => {
    const entity = ENTITIES[curr];
    if (entity.new) {
      prev[curr] = entity.new();
    }

    return prev;
  },
  {} as { [K in ENTITIES_KEYS]: ReturnType<(typeof ENTITIES)[K]["new"]> }
);
