import CardBox from "src/components/shared/CardBox"
import { Badge } from "src/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table"

export const RepresentativePerformance = () => {
  // ============================================================
  // MOCK DATA
  // Replace later with API data
  // ============================================================

  const PerformanceData = [
    {
      key: "rep-1",
      username: "Ahmed Mohamed",
      designation: "Technical Support Representative",
      target: "50,000",
      achieved: "47,000",
      achievement: 94,
      outstanding: "3,000",
      status: "Excellent",
      statusClass: "bg-success text-white",
    },
    {
      key: "rep-2",
      username: "Mohamed Ali",
      designation: "Technical Support Representative",
      target: "60,000",
      achieved: "42,000",
      achievement: 70,
      outstanding: "18,000",
      status: "On Track",
      statusClass: "bg-primary text-white",
    },
    {
      key: "rep-3",
      username: "Ali Hassan",
      designation: "Technical Support Representative",
      target: "55,000",
      achieved: "31,000",
      achievement: 56,
      outstanding: "24,000",
      status: "Needs Attention",
      statusClass: "bg-warning text-white",
    },
    {
      key: "rep-4",
      username: "Omar Mahmoud",
      designation: "Technical Support Representative",
      target: "45,000",
      achieved: "22,000",
      achievement: 49,
      outstanding: "23,000",
      status: "Behind",
      statusClass: "bg-error text-white",
    },
    {
      key: "rep-5",
      username: "Khaled Samir",
      designation: "Technical Support Representative",
      target: "40,000",
      achieved: "35,500",
      achievement: 89,
      outstanding: "4,500",
      status: "Excellent",
      statusClass: "bg-success text-white",
    },
  ]

  return (
    <CardBox>
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="mb-6">
        <div>
          <h5 className="card-title">Representative Performance</h5>

          <p className="text-sm text-muted-foreground font-normal">
            Monthly collection performance for September 2026
          </p>
        </div>
      </div>

      {/* ============================================================
          TABLE
      ============================================================ */}
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-semibold">
                      #
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Representative
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Target
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Achieved
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Achievement
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Outstanding
                    </TableHead>

                    <TableHead className="text-sm font-semibold">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {PerformanceData.map((item, index) => (
                    <TableRow
                      key={item.key}
                      className="border-b border-border"
                    >
                      {/* Index */}
                      <TableCell>
                        <p className="text-muted-foreground font-medium text-sm">
                          {index + 1}
                        </p>
                      </TableCell>

                      {/* Representative */}
                      <TableCell className="ps-0 min-w-[220px]">
                        <div>
                          <h6 className="text-sm font-semibold mb-1">
                            {item.username}
                          </h6>

                          <p className="text-xs font-medium text-muted-foreground">
                            {item.designation}
                          </p>
                        </div>
                      </TableCell>

                      {/* Target */}
                      <TableCell>
                        <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {item.target} EGP
                        </p>
                      </TableCell>

                      {/* Achieved */}
                      <TableCell>
                        <p className="text-sm font-semibold text-success whitespace-nowrap">
                          {item.achieved} EGP
                        </p>
                      </TableCell>

                      {/* Achievement */}
                      <TableCell className="min-w-[150px]">
                        <div className="flex items-center gap-3">
                          <div className="w-full max-w-[90px] h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(
                                  item.achievement,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-sm font-semibold whitespace-nowrap">
                            {item.achievement}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Outstanding */}
                      <TableCell>
                        <p className="text-sm font-medium text-error whitespace-nowrap">
                          {item.outstanding} EGP
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={`
                            text-[12px]
                            px-3
                            rounded-full
                            justify-center
                            py-0.5
                            whitespace-nowrap
                            ${item.statusClass}
                          `}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </CardBox>
  )
}