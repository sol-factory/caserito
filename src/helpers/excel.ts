// scripts/import-excel-sales-cashflows.js

import {
  CashflowCategoryModel,
  CashflowModel,
  CashflowSubCategoryModel,
} from "@/schemas/cashflow";
import { SaleModel } from "@/schemas/sale";
import { getFullDate } from "./date";

import path from "path";
import fs from "fs/promises";
import * as XLSX from "xlsx";
import mongoose from "mongoose";
import WalletModel from "@/schemas/wallet";

// ====== AJUSTES QUE TENÉS QUE COMPLETAR ======
// 1) Conexión
const MONGODB_URI = process.env.NEXT_ATLAS_MONGO_URL;

// 2) Contexto del import (usuario que "crea")
const USER = {
  _id: "68a8824f775784e50663f65d",
  email: "alanalvira@hotmail.com",
  firstname: "Alan",
  lastname: "Alvira",
  avatar_url: "",
  company: { _id: "68a88421775784e50663f68f" },
  store: {
    _id: "68a88421775784e50663f692",
    name: "Caserito 35",
    address: "Caserito 35",
  },
};

// 3) Wallets por MEDIO DE PAGO (completar IDs reales)
const WALLETS = {
  EFECTIVO: {
    _id: "68a88421775784e50663f694",
    name: "Efectivo",
    pre_name: "billetes.png",
    currency: "ars",
  },
  "MERCADO PAGO": {
    _id: "68a9e707bb3308b111e20dd0",
    name: "caserito35.mp",
  },
  CHEQUE: {
    _id: "68b052294ed5be4a273a6610",
    name: "cheque",
  },
  BANCO: {
    _id: "68a9e6fcbb3308b111e20dc2",
    name: "caserito35",
  },
  // agrega más si tenés (TRANSFERENCIA, TARJETA, etc)
};

// 4) Nombres de columnas exactamente como aparecen en tu excel
const COLS = {
  fecha: "FECHA",
  ingEgr: "ING/EGR",
  categoria: "CATEGORIA",
  subCategoria: "SUB CATEGORIA",
  carga: "CARGA",
  medioPago: "MEDIO DE PAGO",
  montoBoleta: "MONTO BOLETA",
  pagoDiarios: "PAGO DIARIOS",
  fechaPago: "FECHA PAGO",
};

// ====== HELPERS ======
function excelCellToDate(v) {
  // soporta fecha en número Excel o string "M/D/YYYY"
  if (typeof v === "number") {
    // días desde 1899-12-30
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 24 * 60 * 60 * 1000;
    return new Date(epoch.getTime() + ms);
  }
  if (!v) return null;
  // intenta parseo tolerante
  const parts = String(v)
    .trim()
    .split(/[\/\-]/);
  if (parts.length >= 3) {
    // muchas planillas vienen D/M/YYYY
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    return new Date(Date.UTC(y, m, d, 10, 0, 0)); // 10:00 UTC para evitar TZ
  }
  const dt = new Date(v);
  return dt;
}

function toNumber(v) {
  if (v == null || v === "") return 0;
  return (
    Number(
      String(v)
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/\s/g, "")
        .replace(/[^\d\.\-]/g, "")
    ) || 0
  );
}

function normalize(text) {
  return String(text || "").trim();
}

function mapKind(v) {
  const s = normalize(v).toUpperCase();
  if (s.includes("ING")) return "income";
  return "egress";
}

function medioPagoToWallet(v) {
  const key = normalize(v).toUpperCase();
  return WALLETS[key] || null;
}

// asegura categoría y subcategoría (por nombre)
async function ensureCategoryAndSub(catName, subName) {
  const name = normalize(catName).toUpperCase();
  const sub = normalize(subName).toUpperCase();

  const category = await CashflowCategoryModel.findOne({ name });

  const subcat = await CashflowSubCategoryModel.findOne({
    name: sub,
    "category._id": category?._id,
  });

  return {
    category: { _id: category?._id, name: category?.name },
    sub_category: { _id: subcat?._id, name: subcat?.name },
  };
}

// ====== IMPORT PRINCIPAL ======
export async function importExcelCashflows(fileName) {
  await mongoose.connect(MONGODB_URI);
  console.log("🔌 Conectado a Mongo");

  // 1) Path ABSOLUTO dentro de /public
  const absPath = path.join(process.cwd(), "public", fileName);

  // Opcional: valida que exista, así ves el path real en logs
  try {
    const stat = await fs.stat(absPath);
    console.log("📄 Excel encontrado:", absPath, stat.size, "bytes");
  } catch (e) {
    console.error("❌ No se encontró el archivo en:", absPath);
    throw e;
  }

  // 2) Leé como buffer y parseá con XLSX
  const buf = await fs.readFile(absPath);
  const wb = XLSX.read(buf, { type: "buffer" });
  const firstSheet = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { raw: true });

  console.log(`📄 Filas leídas: ${rows.length}`);

  let createdSales = 0;
  let createdCashflows = 0;
  let i = 0;
  for (const row of rows) {
    i++;
    try {
      const kind = mapKind(row[COLS.ingEgr]);
      const catName = row[COLS.categoria];
      const subName = row[COLS.subCategoria];
      console.log({ catName, subName, i });
      const { category, sub_category } = await ensureCategoryAndSub(
        catName,
        subName
      );
      console.log({ category, sub_category });

      // Fechas
      const saleDate = excelCellToDate(row[COLS.fecha]) || new Date();
      const cashflowDate = excelCellToDate(row[COLS.fechaPago]);

      // Montos
      const montoBoleta = toNumber(row[COLS.montoBoleta]);
      const pagoDiario = toNumber(row[COLS.pagoDiarios]);
      const saleAmount =
        montoBoleta > 0 ? Math.abs(montoBoleta) : Math.abs(pagoDiario || 0);
      // Para el cashflow uso lo pagado ese día; si no hay, uso el total
      const cashflowAmount = Math.abs(pagoDiario || 0);

      // Wallet
      const wallet = medioPagoToWallet(row[COLS.medioPago]);
      const fullWallet = await WalletModel.findById(wallet?._id);

      // --- Crear Sale ---
      const sale = await SaleModel.create({
        kind,
        category,
        sub_category,
        date: saleDate,
        full_date: getFullDate(saleDate),
        // full_pick_up_date: getFullDate(pickUpDate),
        amount: saleAmount,
        gathered_amount: 0,
        company_id: USER.company._id,
        store_id: USER.store._id,
        store: USER.store,
        creator: USER,
        search_field:
          `${category.name} ${sub_category.name} ${normalize(row[COLS.carga])}`.toLowerCase(),
      });
      createdSales++;

      // --- Crear Cashflow (1 por fila) ---
      const coef = kind === "income" ? 1 : -1;
      const cfDate = cashflowDate ? cashflowDate : pagoDiario ? saleDate : null;

      if (cfDate || pagoDiario) {
        await CashflowModel.create({
          date: cfDate,
          full_date: getFullDate(cfDate),
          category,
          sub_category,
          company_id: USER.company._id,
          store_id: USER.store._id,
          sale_id: sale._id,
          sale_date: sale.date,
          sale_full_date: sale.full_date,
          amount: cashflowAmount * coef, // signo según kind
          currency: wallet?.currency,
          exchange_rate: 1,
          cancelling: wallet?.currency,
          wallet: {
            ...fullWallet,
            logo_url: fullWallet?.institution?.logo_url || "",
          },
          creator: USER,
        });
        createdCashflows++;
      }

      // Actualizar gathered_amount de la sale
      await SaleModel.findByIdAndUpdate(sale._id, {
        $inc: { gathered_amount: cashflowAmount },
      });
    } catch (err) {
      console.error("❌ Error en fila:", err.message);
    }
  }

  console.log("✅ Listo");
  console.log({ createdSales, createdCashflows });

  await mongoose.disconnect();
}
