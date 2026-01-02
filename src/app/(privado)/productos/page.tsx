import { Pill } from "lucide-react";
import ImportProducts from "./components/ImportProducts";
import ProductsTable from "./components/ProductsTable";

export default function ProductsPage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="size-7 text-teal-600" />
            Productos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestioná el stock, precios y requisitos de venta.
          </p>
        </div>
      </header>

      <section>
        <ImportProducts />
      </section>

      <section>
        <ProductsTable />
      </section>
    </div>
  );
}
