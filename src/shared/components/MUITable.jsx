import {
  DataGrid,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";



export default function DataTable({
  rows,
  columns,
  loading = false,
  onRowClick,
  onRowSelectionModelChange,
}) {
  return (
    <Box sx={
      { height: 650, width: "100%" }
      }>
  <DataGrid
    rows={rows}
    columns={columns}
    loading={loading}
    checkboxSelection
    disableRowSelectionOnClick
    pageSizeOptions={[5, 10, 25, 50]}
    onRowClick={(params) => onRowClick?.(params.row)}
    onRowSelectionModelChange={(newSelectionModel) => {
      onRowSelectionModelChange?.(newSelectionModel);
    }}
    initialState={{
      pagination: {
        paginationModel: {
          page: 0,
          pageSize: 10,
        },
      },
    }}
    sx={{
      fontFamily: "Cairo",
      border: "1px solid var(--mantine-color-default-border)",
      borderRadius: "var(--mantine-radius-md)",
      backgroundColor: "var(--mantine-color-body)",
      color: "var(--mantine-color-text)",

      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "var(--mantine-color-default)",
        color: "black",
        borderBottom: "1px solid var(--mantine-color-default-border)",
        fontWeight: 700,
      },

      "& .MuiDataGrid-cell": {
        borderColor: "var(--mantine-color-default-border)",
      },

      "& .MuiDataGrid-row": {
        borderBottom: "1px solid var(--mantine-color-default-border)",
      },

      "& .MuiDataGrid-row:hover": {
        backgroundColor: "rgba(0,0,0,0.04)",
      },

      "& .MuiDataGrid-footerContainer": {
        borderTop: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-default)",
      },

      "& .MuiCheckbox-root": {
        color: "var(--mantine-color-text)",
      },

      "& .MuiDataGrid-columnSeparator": {
        color: "var(--mantine-color-default-border)",
      },
    }}
  />
</Box>
  );
}