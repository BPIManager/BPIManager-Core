import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import DetailedSongInformation from "@/view/components/songs/detailsScreen";
import { scoreData, songData } from "@/types/data";
import { compareData } from "@/types/compare";
import Loader from "../common/loader";
import { defaultBackground } from "@/themes/ifColor";

interface P {
  isLoading: boolean;
  full: compareData[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (value: string) => void;
  changeSort: (value: number) => void;
  sort?: number;
  isDesc?: boolean;
  displayMode: string;
}

const _: React.FC<P> = ({
  isLoading,
  full,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  displayMode,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [songData, setSongData] = useState<songData | null>(null);
  const [scoreData, setScoreData] = useState<scoreData | null>(null);

  const handleOpen = async (
    updateFlag: boolean,
    row?: compareData | null
  ): Promise<void> => {
    setOpen(!open);
    setSongData(row ? row.songData : null);
    setScoreData(row ? row.scoreData : null);
  };

  const columns = [
    { id: "difficultyLevel", label: "☆" },
    { id: "title", label: "比較元" },
    { id: "exScore", label: "比較先" },
    {
      id: "gap",
      label: "GAP",
    },
  ];
  if (isLoading) {
    return <Loader />;
  }
  return (
    <Paper
      style={{
        borderRadius: 0,
        width: "100%",
        overflowX: "auto",
        background: defaultBackground(),
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        {full
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row: any, i: number) => {
            const prefix =
              row.difficulty === "hyper"
                ? "(H)"
                : row.difficulty === "leggendaria"
                ? "(L)"
                : "";
            const coloring = (col: number): string => {
              const s = row.exScore - row.compareData >= 0;
              if (col === 0) {
                return s ? "rgb(255, 151, 151)" : "transparent";
              }
              if (col === 1) {
                return !s ? "rgb(255, 151, 151)" : "transparent";
              }
              return "transparent";
            };
            return (
              <TableBody
                className="rival"
                key={row.title + i}
                onClick={() => handleOpen(false, row)}
              >
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  className={i % 2 ? "isOdd" : "isEven"}
                >
                  <TableCell rowSpan={2} style={{ position: "relative" }}>
                    {row["difficultyLevel"]}
                  </TableCell>
                  <TableCell
                    rowSpan={1}
                    colSpan={3}
                    style={{ position: "relative" }}
                  >
                    {row["title"]}
                    {prefix}
                  </TableCell>
                </TableRow>
                <TableRow className="rivalBody">
                  <TableCell
                    className="dense"
                    style={{
                      borderLeft: `4px solid ${coloring(0)}`,
                      position: "relative",
                    }}
                  >
                    <span className={"bodyNumber"}>{row.exScore}</span>
                  </TableCell>
                  <TableCell
                    className="dense"
                    style={{
                      borderLeft: `4px solid ${coloring(1)}`,
                      position: "relative",
                    }}
                  >
                    <span className={"bodyNumber"}>{row.compareData}</span>
                  </TableCell>
                  <TableCell
                    className="dense"
                    style={{
                      borderLeft: `4px solid ${coloring(2)}`,
                      color:
                        row.exScore - row.compareData >= 0
                          ? "#00b8ff"
                          : "#ff0000",
                      position: "relative",
                    }}
                  >
                    <span className={"bodyNumber"}>
                      {displayMode === "exScore" &&
                        row.exScore - row.compareData}
                      {displayMode === "bpi" &&
                        (row.scoreData.currentBPI - row.compareData).toFixed(2)}
                      {displayMode === "percentage" &&
                        (row.exScore - row.compareData).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            );
          })}
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={full.length}
        rowsPerPage={rowsPerPage}
        page={page}
        labelRowsPerPage=""
        backIconButtonProps={{
          "aria-label": "previous page",
        }}
        nextIconButtonProps={{
          "aria-label": "next page",
        }}
        onPageChange={(
          _e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
          newPage: number
        ) => handleChangePage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChangeRowsPerPage(e.target.value)
        }
      />
      {open && (
        <DetailedSongInformation
          isOpen={open}
          song={songData}
          score={scoreData}
          handleOpen={handleOpen}
        />
      )}
    </Paper>
  );
};

export default _;
