"use client";

import { useState } from "react";

export default function Guidelines() {
  const [open, setOpen] = useState<{
    sinonimos: boolean;
    institucional: boolean;
  }>({
    sinonimos: false,
    institucional: false,
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-medium text-gray-900">
          Guía para editar la base de conocimientos
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {/* ===== KB SINÓNIMOS ===== */}
        <section>
          <button
            onClick={() => setOpen((s) => ({ ...s, sinonimos: !s.sinonimos }))}
            className="w-full flex items-center justify-between px-4 py-3"
            aria-expanded={open.sinonimos}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">KB Sinónimos</div>
              <div className="text-xs text-gray-500">
                Alias, equivalencias y normalización
              </div>
            </div>
            <span
              className={`inline-block transition-transform ${open.sinonimos ? "rotate-90" : ""}`}
            >
              ▸
            </span>
          </button>

          {open.sinonimos && (
            <div className="px-4 pb-4">
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>
                  En <b>Nombre principal</b> escribí el nombre real, original o
                  el que uses en tu sistema.
                </li>
                <li>
                  En <b>Nombres alternativos</b> escribí las palabras que suelen
                  usar los clientes para referirse a ese producto.
                </li>
                <li>
                  Podés poner <b>varios nombres alternativos</b> separados por
                  coma.
                </li>
                <li>
                  No distingue <b>mayúsculas ni minúsculas</b>.
                </li>
                <li>
                  Busque utilizar palabras en <b>singular</b> y <b>evite</b>{" "}
                  palabras muy cortas.
                </li>
              </ol>

              <div className="mt-3 text-xs text-gray-500">
                <p className="mb-1">Ejemplos:</p>
                <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {`clavo, clavito, puntilla => clavo`}
                </pre>
              </div>
            </div>
          )}
        </section>

        {/* ===== KB INSTITUCIONAL ===== */}
        <section>
          <button
            onClick={() =>
              setOpen((s) => ({ ...s, institucional: !s.institucional }))
            }
            className="w-full flex items-center justify-between px-4 py-3"
            aria-expanded={open.institucional}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">KB Institucional</div>
              <div className="text-xs text-gray-500">
                Medios de pago, envíos, horarios, devoluciones, etc.
              </div>
            </div>
            <span
              className={`inline-block transition-transform ${open.institucional ? "rotate-90" : ""}`}
            >
              ▸
            </span>
          </button>

          {open.institucional && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-700 mb-2">
                Para que se entienda perfectamente, escribí la información en{" "}
                <b>secciones</b> con un título entre corchetes (en MAYÚSCULAS,
                sin tildes) y debajo poné <code>clave: valor</code> (una por
                línea). Separá secciones con una línea en blanco.
              </p>

              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  Secciones sugeridas: <code>[MEDIOS_DE_PAGO]</code>,{" "}
                  <code>[ENVIOS]</code>, <code>[DEVOLUCIONES]</code>,{" "}
                  <code>[HORARIOS]</code>, <code>[CONTACTO]</code>,{" "}
                  <code>[SUCURSALES]</code>, <code>[GARANTIA]</code>,{" "}
                  <code>[FACTURACION]</code>, <code>[PROMOCIONES]</code>.
                </li>
                <li>
                  En las claves usá nombres simples con guión bajo, por ejemplo:{" "}
                  <code>tarjetas_aceptadas</code>, <code>gratis_desde</code>.
                </li>
                <li>
                  Si algo no aplica, poné <code>N/A</code>. Si hay links, pegá
                  la URL completa.
                </li>
                <li>
                  Si necesitás cambiar un dato, repetí la misma clave:{" "}
                  <b>vale la última</b>.
                </li>
              </ul>

              <div className="mt-3 text-xs text-gray-500">
                <p className="mb-1">
                  Plantilla sugerida (copiar/pegar y editar):
                </p>
                <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {`[MEDIOS_DE_PAGO]
tarjetas_aceptadas: VISA, Mastercard, Amex
cuotas: 3, 6, 12 (con interes)
transferencias: alias MMakers.Tienda
efectivo: si (solo en sucursal)
link_pago: https://tu-pasarela/pago

[ENVIOS]
operador: Andreani
zonas: CABA, GBA, Interior
costos: CABA $2500 | GBA $3500 | Interior $4500
gratis_desde: $50000
retiro_en_tienda: si (Direccion Principal 123, CABA)
demora_estimada: CABA 24-48h | GBA 48-72h | Interior 3-6 dias
tracking: si (mail y whatsapp)

[DEVOLUCIONES]
plazo: 30 dias corridos
condiciones: sin uso, en empaque original, con comprobante
quien_cubre_envio: segun motivo (falla: empresa)

[HORARIOS]
atencion: lun-vie 09-18 | sab 10-14
feriados: cerrado

[CONTACTO]
whatsapp: +54 9 11 1234-5678
email: soporte@tuempresa.com
telefono: 011 4321-0000

[SUCURSALES]
principal: Direccion Principal 123, CABA
sucursal_2: Av. Siempre Viva 742, GBA

[GARANTIA]
tipo: oficial
plazo: 12 meses
check: contactar soporte con numero de orden

[FACTURACION]
tipos: A, B
datos_requeridos: razon_social, cuit, condicion_iva, domicilio

[PROMOCIONES]
ahora_12: si (bancos adheridos)
descuentos: 10% transferencia (no acumulable)`}
                </pre>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                <b>Tip:</b> mantené el formato <code>clave: valor</code>. Si
                querés agregar una aclaración, ponela debajo de la clave
                correspondiente.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
