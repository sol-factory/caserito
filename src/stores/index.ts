import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EMPTY_ENTITIES, ENTITIES } from "@/config";

export type StateStore = typeof EMPTY_ENTITIES & {
  logged_user: any;
  current_store: any;
  current_company: any;
  login: { email: string; code: string };
  filter: { date: string };
  subscription: { stores: number; plan_id: string };
  tutorial: { videoId: string };
  errors: any;
  initialization: any;
  user_member?: {
    email: string;
    isManager: boolean;
    isOwner: boolean;
    can_view_quote: boolean;
    can_view_cashflow: boolean;
    can_view_amount_quote: boolean;
    can_view_client: boolean;
    can_edit_client: boolean;
    can_view_phone_client: boolean;
    can_view_service: boolean;
    can_view_amount_service: boolean;
    can_view_amount_sale: boolean;
  };
  openDialog: string;
  openSecondaryDialog: string;
  openDialogIndex: number;
  openDialogSubtitle: string;
  hover_id: string;
  show_cars: boolean;
  showUI: string;
  openDatePicker: string;
  openSelect: string;
  openMenu: string;
  loading: string;
  searchText: string;
  tooltipId: string;
  globalSearchText: string;
  subKind: string;
  creating: boolean;
  edit_subscription: boolean;
  sheetOpen: boolean;
  connectingWsp: boolean;
  sendingMode: "hand" | "automatic";
  deleting: boolean;
  deletion_id: string;
  deletion_entity: string;
  deletion_action_name: string;
  attachments_entity_id: string;
  attachments_entity: string;
  attachments_table_subtitle: string;
  comments_entity_id: string;
  comments_entity: string;
  selected_wallet: any;
  comments_table_subtitle: string;
  deletion_query_refetch: string;
  avoidClosingModal: boolean;
  click: { x: number; y: number; _id: string };
  walletClosureInfo: any;

  update: (prop: keyof StateStore, value) => void;
  updateArray: (
    prop: keyof StateStore,
    value,
    field,
    arrayField,
    index?,
    idToFilterArray?,
    idField?
  ) => void;
  reset: (prop: keyof StateStore, partial?: boolean) => void;
};

export const EMPTY_SIZE = {
  company_id: 1,
  name: "",
};

export const tackArrayField = ({
  s,
  entity,
  arrayField,
  field,
  index,
  idToFilterArray,
  idField,
}) => {
  let value;
  const arrayValue = s[entity][field];
  const isValueAnArray = Array.isArray(arrayValue);

  if (idToFilterArray) {
    value = isValueAnArray
      ? arrayValue.find((item) => item[idField] === idToFilterArray)?.[
          arrayField
        ]
      : "";
  } else {
    value = isValueAnArray ? arrayValue[index][arrayField] : "";
  }
  return value;
};

export const useStore = create<StateStore>()(
  devtools((set) => ({
    ...EMPTY_ENTITIES,
    logged_user: {},
    login: { email: "", code: "" },
    subscription: { stores: 1, plan_id: "" },
    size: EMPTY_SIZE,
    filter: { date: new Date().toUTCString() },
    errors: {},
    initialization: {},
    openDialog: "",
    openDialogIndex: 0,
    showUI: "",
    openDatePicker: "",
    openSelect: "",
    openMenu: "",
    loading: "",
    tooltipId: "",
    searchText: "",
    subKind: "",
    globalSearchText: "",
    hover_id: "",
    show_cars: false,
    click: { x: 0, y: 0, _id: "" },
    creating: true,
    sheetOpen: false,
    connectingWsp: false,
    sendingMode: "automatic",
    deleting: false,
    deletion_id: "",
    deletion_entity: "",
    deletion_query_refetch: "",
    avoidClosingModal: false,
    update: (prop, value) =>
      set((state) => {
        if (typeof state[prop] === "object") {
          const currState = state[prop] as object;
          const newState = { ...currState, ...value };
          return { ...state, [prop]: newState };
        } else {
          return { ...state, [prop]: value };
        }
      }),
    updateArray: (
      prop,
      value,
      field,
      arrayField,
      index,
      idToFilterArray,
      idField
    ) =>
      set((state) => {
        let newState;
        if (idToFilterArray) {
          newState = state[prop][field].map((item) => {
            if (item[idField] === idToFilterArray) {
              return { ...item, [arrayField]: value };
            }
            return item;
          });
        } else {
          newState = state[prop][field].map((item, idx) => {
            if (index === idx) {
              return { ...item, [arrayField]: value };
            }
            return item;
          });
        }

        return {
          ...state,
          [prop]: { ...state[prop], [field]: [...newState] },
        };
      }),
    reset: (prop, partial) =>
      set((state) => {
        // Sobre todo para aquellos que tienen un campo que no queremos borrar, como el "sale_id"
        // de los cashflows
        const entity = ENTITIES[prop];
        const currState = state[prop] as object;
        const emptyState = partial
          ? { ...currState, ...entity.new() }
          : entity
            ? { ...entity.new() }
            : {};

        return { ...state, [prop]: emptyState };
      }),
  }))
);
