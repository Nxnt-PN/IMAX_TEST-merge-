import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
};

export default function DataTable({
  data,
  columns,
  loading,
  emptyText = "common:label.empty-text",
}) {
  const table = useReactTable({
    data,
    columns,
    state:{ id:'no', desc:false },
    getCoreRowModel: getCoreRowModel(),
  });

  const id = useId();
  const { t } = useTranslation();

  return (
    <div className="table-responsive" id={id}>
      <table className="table align-middle">
        <thead className="table-light">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="text-center">
                Loading...
              </td>
            </tr>
          )}

          {!loading && table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center">
                {t(emptyText)}
              </td>
            </tr>
          )}

          {!loading &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
