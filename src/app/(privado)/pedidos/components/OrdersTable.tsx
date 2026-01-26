import { UiOrder } from "../types/types";
import { MobileCards } from "./OrdersTableMobile";
import DesktopTable from "./OrdersTableDesktop";

export default function OrdersTable({
  rows,
  onOpen,
}: {
  rows: UiOrder[];
  onOpen: (row: UiOrder) => void;
}) {
  return (
    <>
      <DesktopTable rows={rows} onOpen={onOpen} />
      <MobileCards rows={rows} onOpen={onOpen} />
    </>
  );
}
