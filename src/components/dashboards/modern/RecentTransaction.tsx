import { useMemo, useState } from "react";
import CardBox from "src/components/shared/CardBox";

export const UncollectedTargets = () => {
    const [selectedMonth, setSelectedMonth] = useState("September");
    const [selectedYear, setSelectedYear] = useState(2026);

    const targets = [
        {
            id: 1,
            pharmacy: "Pharmacy A",
            month: "September",
            year: 2026,
            due: 600,
            reason: "Closed",
        },
        {
            id: 2,
            pharmacy: "Pharmacy B",
            month: "September",
            year: 2026,
            due: 600,
            reason: "Refused",
        },
        {
            id: 3,
            pharmacy: "Pharmacy C",
            month: "August",
            year: 2026,
            due: 600,
            reason: "No Contact",
        },
        {
            id: 4,
            pharmacy: "Pharmacy D",
            month: "August",
            year: 2026,
            due: 600,
            reason: "Customer Requested Delay",
        },
        {
            id: 5,
            pharmacy: "Pharmacy E",
            month: "July",
            year: 2026,
            due: 600,
            reason: "No Contact",
        },
    ];

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const years = [2024, 2025, 2026];

    const filteredTargets = useMemo(() => {
        return targets.filter(
            (target) =>
                target.month === selectedMonth &&
                target.year === selectedYear
        );
    }, [selectedMonth, selectedYear]);

    return (
        <CardBox className="h-full w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h5 className="card-title">Uncollected Targets</h5>

                    <p className="text-sm text-muted-foreground font-normal">
                        Monthly subscriptions that were not collected
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {/* Month */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </select>

                    {/* Year */}
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                        }
                        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-start font-semibold text-muted-foreground py-3 px-3">
                                Pharmacy
                            </th>

                            <th className="text-start font-semibold text-muted-foreground py-3 px-3">
                                Subscription Period
                            </th>

                            <th className="text-start font-semibold text-muted-foreground py-3 px-3">
                                Due
                            </th>

                            <th className="text-start font-semibold text-muted-foreground py-3 px-3">
                                Reason
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTargets.length > 0 ? (
                            filteredTargets.map((target) => (
                                <tr
                                    key={target.id}
                                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                                >
                                    <td className="py-4 px-3">
                                        <span className="font-medium text-foreground">
                                            {target.pharmacy}
                                        </span>
                                    </td>

                                    <td className="py-4 px-3">
                                        <span className="text-foreground">
                                            {target.month} {target.year}
                                        </span>
                                    </td>

                                    <td className="py-4 px-3">
                                        <span className="font-semibold text-foreground">
                                            {target.due.toLocaleString()} EGP
                                        </span>
                                    </td>

                                    <td className="py-4 px-3">
                                        <span className="inline-flex items-center rounded-full bg-lightwarning dark:bg-darkwarning px-2.5 py-1 text-xs font-medium text-warning">
                                            {target.reason}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No uncollected targets for{" "}
                                    {selectedMonth} {selectedYear}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </CardBox>
    );
};