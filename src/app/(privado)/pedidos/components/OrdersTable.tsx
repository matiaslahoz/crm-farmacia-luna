import { UiOrder } from "../types/types";
import DesktopTable from "./OrdersTableDesktop";
import { MobileTable } from "./OrdersTableMobile";

export default function OrdersTable({
  rows,
  onOpen,
  updateStatus,
}: {
  rows: UiOrder[];
  onOpen: (row: UiOrder) => void;
  updateStatus: (id: number, status: string) => void;
}) {
  return (
    <>
      <DesktopTable rows={rows} onOpen={onOpen} updateStatus={updateStatus} />
      <MobileTable rows={rows} onOpen={onOpen} updateStatus={updateStatus} />
    </>
  );
}
