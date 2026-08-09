import { useMemo, useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";
import {
  Center,
  Checkbox,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import classes from "../../styles/Tablesort.module.css";

// export interface TableColumn<T> {
//   key: keyof T;
//   label: string;
//   sortable?: boolean;
//   searchable?: boolean;
//   render?: (value: T[keyof T], row: T) => React.ReactNode;
// }

// interface TableSortProps<T extends Record<string, any>> {
//   data: T[];
//   columns: TableColumn<T>[];
//   rowKey: keyof T | ((row: T) => React.Key);
//   searchPlaceholder?: string;

//   // NEW
//   selectable?: boolean;
//   onSelectionChange?: (selectedRows: T[]) => void;
// }

// interface ThProps {
//   children: React.ReactNode;
//   reversed: boolean;
//   sorted: boolean;
//   sortable?: boolean;
//   onSort: () => void;
// }

function Th({
  children,
  reversed,
  sorted,
  sortable = true,
  onSort,
}) {
  if (!sortable) {
    return (
      <Table.Th className={classes.th}>
        <Text fw={500} fz="sm">
          {children}
        </Text>
      </Table.Th>
    );
  }

  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;

  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>

          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

export default function TableSort({
  data,
  columns,
  rowKey,
  searchPlaceholder = "Search...",
  selectable = false,
  onSelectionChange,
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  // NEW
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(
    new Set()
  );

  const getRowKey = (row)=> {
    return typeof rowKey === "function"
      ? rowKey(row)
      : (row[rowKey]);
  };

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return data;

    return data.filter((row) =>
      columns
        .filter((c) => c.searchable !== false)
        .some((column) =>
          String(row[column.key] ?? "")
            .toLowerCase()
            .includes(query)
        )
    );
  }, [data, search, columns]);

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortBy] ?? "");
      const bValue = String(b[sortBy] ?? "");

      return reverseSortDirection
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    });
  }, [filteredData, sortBy, reverseSortDirection]);

  const setSorting = (field) => {
    const reversed =
      field === sortBy ? !reverseSortDirection : false;

    setSortBy(field);
    setReverseSortDirection(reversed);
  };

  // NEW
  const toggleRow = (row) => {
    const key = getRowKey(row);
    const next = new Set(selectedKeys);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    setSelectedKeys(next);

    onSelectionChange?.(
      sortedData.filter((r) => next.has(getRowKey(r)))
    );
  };

  // NEW
  const toggleAll = () => {
    if (selectedKeys.size === sortedData.length) {
      setSelectedKeys(new Set());
      onSelectionChange?.([]);
      return;
    }

    const next = new Set<React.Key>(
      sortedData.map((row) => getRowKey(row))
    );

    setSelectedKeys(next);
    onSelectionChange?.(sortedData);
  };

  const allSelected =
    sortedData.length > 0 &&
    selectedKeys.size === sortedData.length;

  const someSelected =
    selectedKeys.size > 0 &&
    selectedKeys.size < sortedData.length;

  return (
    <ScrollArea>
      <TextInput
        mb="md"
        value={search}
        placeholder={searchPlaceholder}
        leftSection={<IconSearch size={16} />}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        highlightOnHover
        withTableBorder
      >
        <Table.Thead>
          <Table.Tr>
            {selectable && (
              <Table.Th w={40}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </Table.Th>
            )}

            {columns.map((column) => (
              <Th
                key={String(column.key)}
                sortable={column.sortable !== false}
                sorted={sortBy === column.key}
                reversed={reverseSortDirection}
                onSort={() =>
                  column.sortable !== false &&
                  setSorting(column.key)
                }
              >
                {column.label}
              </Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {sortedData.length ? (
            sortedData.map((row) => {
              const key = getRowKey(row);

              return (
                <Table.Tr key={key}>
                  {selectable && (
                    <Table.Td>
                      <Checkbox
                        checked={selectedKeys.has(key)}
                        onChange={() => toggleRow(row)}
                      />
                    </Table.Td>
                  )}

                  {columns.map((column) => (
                    <Table.Td key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? "")}
                    </Table.Td>
                  ))}
                </Table.Tr>
              );
            })
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={
                  columns.length + (selectable ? 1 : 0)
                }
              >
                <Text ta="center" fw={500}>
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}