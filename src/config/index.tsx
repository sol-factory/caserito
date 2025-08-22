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
      kind: "egress",
      date: new Date().toUTCString(),
      pick_up_date: null,
      amount: null,
      category: {},
      sub_category: {},
      gathered_amount: 0,
      canUpdate: false,
    }),
    menus: {
      rowItems: (s, isOwner) => <SaleRowMenuItems s={s} isOwner={isOwner} />,
    },
    createSchema: z.object({
      _id: optionalString(),
      date: z.date({ coerce: true, required_error: "Debes indicar la fecha" }),
    }),
    loadingKey: "sale-form",
    singular: "venta",
    plural: "Ventas",
    placeholder: "Venta",
    href: "washes",
    fields: [
      ({ user, canUpdate }) => (
        <>
          <ToogleCashflowKind
            form="sale"
            field="kind"
            value1="egress"
            value2="income"
          />
          <div className="flex items-center gap-2">
            <MultiSelect
              id="select-category"
              form="sale"
              field="category"
              entity="cashflow"
              placeholder="Categoría"
              action="getCategories"
              flag="kind"
              justOne
              autoFocus
              hideSearch
              className="min-w-20"
              idToFocusAfterSelection="select-sub-category"
              resetOnSelect="sub_category"
              disabled={!canUpdate}
            />
            <MultiSelect
              id="select-sub-category"
              form="sale"
              field="sub_category"
              entity="cashflow"
              action="getSubCategories"
              filterIdField="category"
              placeholder="Subcategoría"
              idToFocusAfterSelection={(newValue) =>
                ["Venta de productos", "Membresías"].includes(newValue.name)
                  ? "cashflow-client"
                  : "select-wallet"
              }
              monitorField="category"
              shouldHide={(category) => category?.name === "Retiro"}
              justOne
              autoFocus
              disabled={!canUpdate}
            />
          </div>
          <div className="flex gap-1 w-full">
            <DatePicker
              id="sale-date-picker"
              entity="sale"
              field="date"
              placeholder="Fecha de operación"
              fromDate={
                user.role === "Socio" ? new Date(2025, 0, 1) : new Date()
              }
              disabled={!canUpdate}
              // toDate={addDays(new Date(), 6)}
            />
            <MyTimeInput disabled={!canUpdate} form="sale" field="date" />
          </div>

          <MyInput
            id="sale-amount"
            placeholder="Monto"
            entity="sale"
            field="amount"
            type="number"
            disabled={!canUpdate}
          />
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
      wallet: {},
      wallet_to: {},
      client: {},
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
      phone: z
        .string({ required_error: "Teléfono inválido" })
        .min(3, "Teléfono inválido"),
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
