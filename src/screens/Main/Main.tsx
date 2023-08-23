import React, { useEffect } from "react";
import {
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { files } from "dropbox";
import {
  dbxDownloadFile,
  dbxListFolder,
  dbxUploadFile,
} from "@/dropbox/service";
import { CheckBox } from "@mui/icons-material";
import styles from "./Main.module.css";
const allowedFiles = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp3",
  "audio/x-m4a",
  "audio/x-wav",
  "audio/x-ogg",
  "audio/x-mp3",
  "audio/x-mpeg",
  "audio/x-mpeg-3",
  "audio/m4a",
];

export type MainProps = {};

const Main: React.FC<MainProps> = ({}) => {
  const [actualFolder, setActualFolder] = React.useState<string>("/Sounds");
  const [listFolder, setListFolder] = React.useState<
    (
      | files.FileMetadataReference
      | files.FolderMetadataReference
      | files.DeletedMetadataReference
    )[]
  >([]);
  useEffect(() => {
    dbxListFolder("/Sounds").then((res) => {
      if (res && res.result) {
        const result = res.result;
        const items = result.entries;
        setListFolder(items);
      }
    });
  }, []);

  const mapListFolder = () => {
    return listFolder.map((row) => {
      if (row[".tag"] === "folder") {
        return (
          <TableRowItem
            key={row.id}
            row={row}
            iconName="folder"
            onClick={() => {
              dbxListFolder(row.path_display as string).then((res) => {
                console.log(res);
                if (res && res.result) {
                  const result = res.result;
                  const items = result.entries;
                  setListFolder(items);
                  setActualFolder(row.path_display as string);
                }
              });
            }}
          />
        );
      }
      if (row[".tag"] === "file") {
        return (
          <TableRowItem
            key={row.id}
            row={row}
            iconName="audio_file"
            onClick={async () => {
              const fileBlob = await dbxDownloadFile(
                row.path_display as string
              ).then((res) => {
                const value = res?.result as files.FileMetadata & {
                  fileBlob: Blob;
                };
                return value.fileBlob as Blob;
              });
              const audioElement = document.createElement("audio");
              audioElement.src = URL.createObjectURL(fileBlob);
              audioElement.play();
            }}
          />
        );
      }
      return null;
    });
  };

  return (
    <div>
      <div
        className={styles.path}
        style={{ display: "flex", flexDirection: "row" }}
      >
        {actualFolder.split("/").map((item, index) => {
          if (item === "") {
            return null;
          }
          return (
            <div key={index} style={{ display: "flex", flexDirection: "row" }}>
              <Button
                key={index}
                variant="outlined"
                onClick={() => {
                  const newPath = actualFolder
                    .split("/")
                    .slice(0, index + 1)
                    .join("/");
                  dbxListFolder(newPath).then((res) => {
                    console.log(res);
                    if (res && res.result) {
                      const result = res.result;
                      const items = result.entries;
                      setListFolder(items);
                      setActualFolder(newPath);
                    }
                  });
                }}
              >
                {item}
              </Button>
              <div style={{ width: 10 }} />
              <Typography color="GrayText" variant="h4">
                /
              </Typography>
              <div style={{ width: 10 }} />
            </div>
          );
        })}
      </div>
      <div style={{ height: 10 }} />
      <Container maxWidth="sm">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // upload file when button is clicked to dropbox
            const input = document.createElement("input");
            input.accept = "audio/*";
            input.type = "file";
            input.multiple = false;
            input.click();
            input.onchange = async () => {
              const file = input.files?.item(0);
              if (file) {
                const result = await dbxListFolder(actualFolder);
                if (result && result.result) {
                  const resultFolder = result.result;
                  let items = resultFolder.entries;
                  const fileExist = items.find(
                    (item) => item.name === file.name
                  );
                  if (fileExist) {
                    alert("Ya existe un archivo con ese nombre");
                  } else {
                    const resultUpload = await dbxUploadFile(
                      actualFolder + "/" + file.name,
                      file
                    );
                    if (resultUpload && resultUpload.result) {
                      const resultFolder = await dbxListFolder(actualFolder);
                      if (resultFolder && resultFolder.result) {
                        items = resultFolder.result.entries;
                        setListFolder(items);
                      }
                    }
                  }
                }
              }
            };
          }}
        >
          Subir Sonido
        </Button>
      </Container>

      <TableContainer sx={{ width: "100%" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Loop</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{mapListFolder()}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const TableRowItem = ({
  row,
  iconName,
  onClick,
}: {
  row:
    | files.FileMetadataReference
    | files.FolderMetadataReference
    | files.DeletedMetadataReference;
  iconName: string;
  onClick?: () => void;
}) => {
  return (
    <TableRow
      key={row.name}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ display: "flex", alignContent: "center" }}
      >
        <span className="material-symbols-outlined">{iconName}</span>
        <Typography>{row.name}</Typography>
      </TableCell>
      <TableCell align="right"></TableCell>
      <TableCell align="right">Acciones</TableCell>
    </TableRow>
  );
};

export default Main;
