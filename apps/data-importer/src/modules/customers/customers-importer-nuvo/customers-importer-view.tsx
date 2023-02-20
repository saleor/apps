import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigureAPI, OnResults, SettingsAPI } from "nuvo-react";
import {
  CustomerColumnSchema,
  getCustomersModelColumns,
  getResultModelSchema,
} from "./customers-columns-model";
import dotObject from "dot-object";
import { useAuthorizedToken } from "../../authorization/use-authorized-token";
import { Alert, Button, SaleorTheme, useTheme } from "@saleor/macaw-ui";
import { CustomersImportingResults } from "../customers-results/customers-importing-results";
import { lighten, LinearProgress } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import { Theme } from "@material-ui/core/styles";

let PassSubmitResult: any;
let RejectSubmitResult: any;

const NuvoImporter = dynamic<ConfigureAPI>(
  async () => {
    return import("nuvo-react").then((item) => {
      PassSubmitResult = item.PassSubmitResult;
      RejectSubmitResult = item.RejectSubmitResult;
      return item.NuvoImporter;
    });
  },
  {
    ssr: false,
    loading() {
      return <LinearProgress />;
    },
  }
);

const columns = getCustomersModelColumns();

const getNuvoSettings = (theme: SaleorTheme): SettingsAPI => {
  const dropdownStyles = {
    option: {
      color: theme.palette.text.primary,
      ":hover": {
        background: `${lighten(theme.palette.background.default, 0.1)}`,
      },
    },
    header: {
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
    },
    root: {
      border: `1px solid ${lighten(theme.palette.background.default, 0.1)}`,
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
    },
    search: {
      root: {
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
      },
    },
    button: {
      root: {
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        maxHeight: "20px",
        border: `1px solid ${lighten(theme.palette.background.default, 0.1)}`,
      },
    },
  } as const;

  return {
    columns,
    enableExamples: false,
    developerMode: process.env.NEXT_PUBLIC_NUVO_PROD_MODE !== "true",
    identifier: "customers",
    modal: false,
    style: {
      footer: {
        root: {
          background: theme.palette.background.default,
        },
      },
      buttons: {
        primary: {
          background: "black",
          color: "#fff",
          ":hover": {
            backgroundColor: "black",
            color: "#fff",
          },
        },
        secondary: {
          background: "#444",
          color: "#fff",
          border: "none",
          ":hover": {
            background: "#444",
            color: "#fff",
          },
        },
      },
      loader: {
        loadAnimationColor: theme.palette.type === "light" ? "#000" : "#fff",
      },
      headerSelect: {
        root: {
          background: theme.palette.background.default,
          border: "none",
        },
        table: {
          selectRowColor: lighten(theme.palette.background.default, 0.3),
          th: {
            color: theme.palette.text.primary,
            background: theme.palette.background.default,
          },
          td: {
            color: theme.palette.text.primary,
            background: theme.palette.background.default,
          },
          hoverRowColor: lighten(theme.palette.background.default, 0.1),
        },
        sheetName: {
          root: {
            display: "none",
          },
        },
      },
      columnMatch: {
        notMatchingValue: {
          root: {
            background: lighten(theme.palette.background.default, 0.1),
          },
        },
        buttonJoined: {
          root: {
            background: lighten(theme.palette.background.default, 0.1),
          },
        },
        root: {
          background: theme.palette.background.default,
          border: `1px solid ${lighten(theme.palette.background.default, 0.1)}`,
        },
        columnMatchHeader: {
          dropdown: dropdownStyles,
          root: {
            background: theme.palette.background.default,
            border: `1px solid ${lighten(theme.palette.background.default, 0.1)}`,
          },
        },
        columnMatchValue: {
          emptyValue: {
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
          dropdown: dropdownStyles,
          root: {
            border: `1px solid ${lighten(theme.palette.background.default, 0.1)}`,
            background: theme.palette.background.default,
          },
        },
      },
      header: {
        description: {
          display: "none",
        },
        root: {
          // display: "none",
        },
      },
      progressBar: {
        root: {
          display: "none",
        },
      },
      dropzone: {
        icon: {
          box: {
            filter: "grayscale(1)",
          },
        },
        root: {
          background: theme.palette.background.default,
          border: "1px dashed #ddd",
        },
      },
      reviewEntries: {
        root: {
          backgroundColor: "transparent",
        },
        table: {
          th: {
            backgroundColor: "transparent",
          },
          td: {
            normal: {
              backgroundColor: "transparent",
            },
            root: {
              backgroundColor: "transparent",
            },
          },
        },
      },
      globals: {
        fontFamily: "Inter",
        backgroundColor: "transparent",
        textColor: "inherit",
      },
    },
    title: "Upload customers to Saleor",
    disableExcelTemplate: true,
    disableTemplates: true,
    allowManualInput: true,
  };
};

const licenseKey = process.env.NEXT_PUBLIC_NUVO_LICENSE_KEY as string;

export const CustomersImporterView = () => {
  const authorized = useAuthorizedToken("MANAGE_USERS");
  const saleorTheme = useTheme();

  const [importedLines, setImportedLines] = useState<CustomerColumnSchema[] | null>(null);

  const handleResults: OnResults = useCallback((resultArray) => {
    const parsedResult = resultArray.map((row) =>
      getResultModelSchema().parse(dotObject.object(row))
    );

    setImportedLines(parsedResult);
  }, []);

  const nuvoSettings = useMemo(() => {
    return getNuvoSettings(saleorTheme);
  }, [saleorTheme]);

  if (authorized === undefined) {
    return <div>Authorizing</div>;
  }

  if (authorized === false) {
    return <Alert variant="error">To use this importer you need MANAGER_USERS permission</Alert>;
  }

  if (importedLines) {
    return <CustomersImportingResults importedLines={importedLines} />;
  }

  return (
    <NuvoImporter
      renderUploadButton={({ launch }) => {
        return (
          <Button
            size="large"
            startIcon={<CloudUpload />}
            variant="primary"
            color="primary"
            onClick={launch}
          >
            Upload file
          </Button>
        );
      }}
      onResults={handleResults}
      licenseKey={licenseKey}
      settings={nuvoSettings}
    />
  );
};
