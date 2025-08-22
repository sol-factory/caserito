"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONFIG } from "@/config/constanst";
import { createQueryString } from "@/helpers/url";
import { addMonths } from "date-fns";
import {
  Bell,
  Cake,
  Calendar,
  CalendarRange,
  CircleDollarSign,
  Eye,
  Send,
  SendHorizontal,
  Shapes,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const WASHES_OPTIONS = [
  {
    screen: "washes",
    key: "unfinished",
    selectable: true,
    label: "Sin finalizar",
    match: ({ date, view }) => {
      return view === "unfinished";
    },
    imageSrc: `${CONFIG.blob_url}/logo.png`,
    href: ({ pathname }) =>
      `/washes?${createQueryString("", "view", "unfinished", pathname)}`,
    clearLocalStorage: true,
  },
  {
    screen: "washes",
    key: "untaken",
    label: "Sin retirar del local",
    selectable: true,
    match: ({ date, client_id, search, view }) => {
      return view === "untaken";
    },
    imageSrc: `${CONFIG.blob_url}/keys-6iGprFHBksy8CdBbVEkYbEnYjZd9yr.png`,
    href: ({ pathname }) =>
      `/washes?${createQueryString("", "view", "untaken", pathname)}`,
  },
  {
    screen: "washes",
    label: "En una fecha específica",
    key: "date",
    icon: Calendar,
    selectable: true,
    href: ({ pathname }) =>
      `/washes?${createQueryString(
        "",
        ["date", "view"],
        [String(+new Date()), "daily"],
        pathname
      )}`,
    match: ({ date, view, period, search }) =>
      (view === "daily" || !view) && !period && !search,
  },
  {
    screen: "washes",
    label: "En una semana específica",
    icon: CalendarRange,
    key: "week",
    selectable: true,
    href: ({ pathname }) =>
      `/washes?${createQueryString(
        "",
        ["date", "view"],
        [String(+new Date()), "weekly"],
        pathname
      )}`,
    match: ({ date, view }) => !!date && view === "weekly",
  },
  {
    screen: "washes",
    selectable: false,
    label: "De cliente y período específicos",
    match: ({ client_id, period }) => {
      return !!period && !!client_id;
    },
  },
  {
    screen: "washes",
    selectable: false,
    label: "Que presentan deuda",
    match: ({ view, period }) => {
      return view === "debts" && !!period;
    },
  },
  {
    screen: "washes",
    selectable: false,
    label: "Para búsqueda específica",
    match: ({ search, date }) => {
      return !date && !!search;
    },
  },
];
const CLIENTS_OPTIONS = [
  {
    screen: "clients",
    key: "all",
    selectable: true,
    label: "Listado completo",
    match: ({ month, search, service_id }) => {
      return !month && !search && !service_id;
    },
    href: `/clients`,
    clearLocalStorage: true,
    icon: Users,
  },
  {
    screen: "clients",
    key: "birthday",
    selectable: true,
    label: "Que cumplen años",
    match: ({ month }) => {
      return !!month;
    },
    href: ({ pathname }) => {
      return `/clients?${createQueryString(
        "",
        "month",
        String(addMonths(new Date(), 1).getMonth() + 1),
        pathname
      )}`;
    },
    icon: Cake,
    clearLocalStorage: true,
  },
  {
    screen: "clients",
    key: "service",
    selectable: true,
    label: "Que realizaron un servicio",
    match: ({ service_id, days_ago }) => {
      return !!service_id && !!days_ago;
    },
    href: ({ pathname }) => {
      return `/clients?${createQueryString(
        "",
        ["service_id", "days_ago"],
        ["null", "30"],
        pathname
      )}`;
    },
    icon: Bell,
    clearLocalStorage: true,
  },
  {
    screen: "clients",
    selectable: false,
    label: "Para búsqueda específica",
    match: ({ search }) => {
      return !!search;
    },
  },
];
const QUOTES_OPTIONS = [
  {
    screen: "quotes",
    key: "not-sent",
    selectable: true,
    label: "Sin enviar al cliente",
    match: ({ days_ago, search, client_id, view }) => {
      return !days_ago && !search && !client_id && !view;
    },
    href: `/quotes`,
    clearLocalStorage: true,
    icon: SendHorizontal,
  },
  {
    screen: "quotes",
    key: "only-sent",
    selectable: true,
    label: "Enviadas sin convertir a venta",
    match: ({ days_ago }) => {
      return !!days_ago;
    },
    href: ({ pathname }) => {
      return `/quotes?${createQueryString("", ["view", "days_ago"], ["sent", "0"], pathname)}`;
    },
    icon: Send,
    clearLocalStorage: true,
  },
  {
    screen: "quotes",
    key: "sold",
    selectable: true,
    label: "Convertidas en venta",
    match: ({ view }) => {
      return view === "sold";
    },
    href: ({ pathname }) => {
      return `/quotes?${createQueryString("", "view", "sold", pathname)}`;
    },
    icon: CircleDollarSign,
    clearLocalStorage: true,
  },
  {
    screen: "quotes",
    selectable: false,
    label: "Para búsqueda específica",
    match: ({ search }) => {
      return !!search;
    },
  },
  {
    screen: "quotes",
    selectable: false,
    label: "De cliente específico",
    match: ({ client_id }) => {
      return !!client_id;
    },
  },
];
const CASHFLOWS_OPTIONS = [
  {
    screen: "cashflows",
    key: "daily",
    selectable: true,
    label: "De fecha específica",
    match: ({ search, client_id, subCategory, view }) => {
      return !search && !client_id && !subCategory && view !== "monthly";
    },
    href: `/cashflows`,
    clearLocalStorage: true,
    icon: Calendar,
  },
  {
    screen: "cashflows",
    key: "monthly",
    selectable: true,
    label: "De categoría y período específico",
    match: ({ subCategory, view }) => {
      return !!subCategory && view === "concept";
    },
    href: ({ pathname, searchParams }) => {
      return `/cashflows?${createQueryString("", ["subCategory", "view", "period"], ["Sueldos", "concept", "this_month"], pathname)}`;
    },
    clearLocalStorage: true,
    icon: CalendarRange,
  },
];
const OPTIONS = [
  ...WASHES_OPTIONS,
  ...CLIENTS_OPTIONS,
  ...QUOTES_OPTIONS,
  ...CASHFLOWS_OPTIONS,
];

export default function ViewDropdown({ screen = "washes", count, counts }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const date = searchParams.get("date");
  const search = searchParams.get("search");
  const month = searchParams.get("month");
  const days_ago = searchParams.get("days_ago");
  const service_id = searchParams.get("service_id");
  const client_id = searchParams.get("client_id");
  const subCategory = searchParams.get("subCategory");
  const view = searchParams.get("view");
  const period = searchParams.get("period");

  const finalOptions = OPTIONS.filter((opt) => opt.screen === screen);
  const activeOption = finalOptions.find((opt) =>
    opt.match?.({
      date,
      search,
      client_id,
      view,
      month,
      days_ago,
      service_id,
      subCategory,
      period,
    })
  );

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="py-0 px-2 h-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <Eye size={12} aria-hidden="true" />
            <span className="text-xs font-light">{activeOption?.label}</span>

            <span className="font-extralight text-xs text-muted-foreground -ml-1">
              (<span className="px-[0.06rem]">{count}</span>)
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-32" side="bottom" align="start">
          <DropdownMenuLabel>Variantes de visualización</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {finalOptions
            .filter((opt) => opt.selectable)
            .map((opt: any, i) => (
              <DropdownMenuItem
                key={i}
                className="cursor-pointer"
                onClick={() => {
                  const url =
                    typeof opt.href === "function"
                      ? opt.href({ pathname, searchParams })
                      : opt.href;
                  router.push(url);
                  if (opt.clearLocalStorage) {
                    localStorage.setItem(pathname, "");
                  }
                }}
              >
                {opt.icon && <opt.icon size={16} />}
                {opt.imageSrc && (
                  <Image
                    src={opt.imageSrc}
                    className="w-[1.15rem] h-5 -ml-0.5"
                    width={14}
                    height={14}
                    alt="icon"
                  />
                )}
                <span className="ml-2">{opt.label}</span>
                {counts?.[opt.key] != null && (
                  <span className="font-extralight text-xs text-muted-foreground ml-1">
                    (<span className="px-[0.06rem]">{counts[opt.key]}</span>)
                  </span>
                )}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
