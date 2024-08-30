import { Box, Button, DefaultTheme, Text, useTheme } from "@saleor/macaw-ui";
import dotObject from "dot-object";
import dynamic from "next/dynamic";
import { ConfigureAPI, OnResults, SettingsAPI } from "nuvo-react";
import { useCallback, useMemo, useState } from "react";

import { useAuthorizedToken } from "../../authorization/use-authorized-token";
import { CustomersImportingResults } from "../customers-results/customers-importing-results";
import {
  CustomerColumnSchema,
  getCustomersModelColumns,
  getResultModelSchema,
} from "./customers-columns-model";

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
      return <Text>Loading</Text>;
    },
  },
);

const columns = getCustomersModelColumns();

const getNuvoSettings = (theme: DefaultTheme): SettingsAPI => {
  const isDarkMode = theme === "defaultDark";

  const dropdownStyles = {
    option: {
      color: "#111",
      ":hover": {
        background: "#eee",
      },
    },
    header: {
      background: "#fff",
      color: "#eee",
    },
    root: {
      border: `1px solid #eee`,
      background: "#fff",
      color: "#111",
    },
    search: {
      root: {
        background: "#fff",
        color: "#111",
      },
    },
    button: {
      root: {
        background: "#fff",
        color: "#111",
        maxHeight: "20px",
        border: `1px solid #eee`,
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
      sheetSelect: {
        icon: { filter: isDarkMode ? "invert(1)" : "none" },
      },
      joinSheet: {},
      dialog: { closeIcon: { filter: isDarkMode ? "invert(1)" : "none" } },
      messagePopup: {
        closeIcon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        warnIcon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        successIcon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
      },
      footer: {
        root: {
          background: "#fff",
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
        loadAnimationColor: "#111",
        content: {
          color: "#111",
        },
      },
      headerSelect: {
        root: {
          background: "#fff",
          border: "none",
        },
        table: {
          selectRowColor: "#eee",
          th: {
            color: "#111",
            background: "#fff",
          },
          td: {
            color: "#111",
            background: "#fff",
          },
          hoverRowColor: "#eee",
        },
        sheetName: {
          root: {
            display: "none",
          },
        },
      },
      columnMatch: {
        icon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        notMatchingValue: {
          root: {
            background: "#eee",
          },
          icon: {
            filter: isDarkMode ? "invert(1)" : "none",
          },
        },
        buttonJoined: {
          root: {
            background: "#eee",
          },
        },
        root: {
          background: "#fff",
          border: `1px solid #eee`,
        },
        columnMatchHeader: {
          dropdown: dropdownStyles,
          root: {
            background: "#fff",
            border: `1px solid #eee`,
          },
          icon: {
            filter: isDarkMode ? "invert(1)" : "none",
          },
        },
        columnMatchValue: {
          icon: {
            filter: isDarkMode ? "invert(1)" : "none",
          },
          emptyValue: {
            background: "#fff",
            color: "#111",
          },
          dropdown: dropdownStyles,
          root: {
            border: `1px solid #eee`,
            background: "#fff",
          },
        },
      },
      header: {
        description: {
          display: "none",
        },
        title: {
          fontSize: "18px",
        },
        root: {
          // display: "none",
          color: "#111",
        },
      },
      progressBar: {
        icon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
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
          background: "#fff",
          border: "1px dashed #eee",
        },
      },
      reviewEntries: {
        icon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        root: {
          backgroundColor: "#fff",
        },
        infoIcon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        moreIcon: {
          filter: isDarkMode ? "invert(1)" : "none",
        },
        table: {
          th: {
            backgroundColor: "#fff",
          },
          td: {
            normal: {
              backgroundColor: "#fff",
            },
            root: {
              backgroundColor: "#fff",
            },
          },
        },
      },
      globals: {
        fontFamily: "Inter",
        backgroundColor: "#fff",
        textColor: "#111",
        primaryTextColor: "#111",
        secondaryTextColor: "#222",
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
      getResultModelSchema().parse(dotObject.object(row)),
    );

    setImportedLines(parsedResult);
  }, []);

  const nuvoSettings = useMemo(() => {
    return getNuvoSettings(saleorTheme.theme);
  }, [saleorTheme]);

  if (authorized === undefined) {
    return <div>Authorizing</div>;
  }

  if (authorized === false) {
    return <Box color="default1">To use this importer you need MANAGER_USERS permission</Box>;
  }

  if (importedLines) {
    return <CustomersImportingResults importedLines={importedLines} />;
  }

  return (
    <div
      style={{
        filter: saleorTheme.theme === "defaultDark" ? "invert(1)" : "none",
      }}
    >
      <NuvoImporter
        renderUploadButton={({ launch }) => {
          return (
            <Button size="large" variant="primary" onClick={launch}>
              Upload file
            </Button>
          );
        }}
        onResults={handleResults}
        licenseKey={licenseKey}
        settings={nuvoSettings}
      />
    </div>
  );
};
