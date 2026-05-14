import { Pill } from "lucide-react";
import ImportProducts from "./components/ImportProducts";

export default function ProductsPage() {
  return (
    <div className="h-full overflow-y-auto pr-2 space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
            <Pill className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Productos
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Gestioná el stock, precios y requisitos de venta
            </p>
          </div>
        </div>
      </div>

      <section>
        <ImportProducts />
      </section>
    </div>
  );
}
