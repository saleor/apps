import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ConfigureAPI, OnResults, SettingsAPI } from "nuvo-react";
import {
  CustomerColumnSchema,
  getCustomersModelColumns,
  getResultModelSchema,
} from "./customers-columns-model";
import dotObject from "dot-object";
import { useAuthorizedToken } from "../../authorization/use-authorized-token";
import { Alert, Button } from "@saleor/macaw-ui";
import { CustomersImportingResults } from "../customers-results/customers-importing-results";
import { LinearProgress } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";

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

const nuvoSettings: SettingsAPI = {
  columns,
  developerMode: true, //todo
  identifier: "customers",
  modal: false,
  style: {
    buttons: {
      primary: {
        background: "#222431",
        borderColor: "#5B5D6D",
        color: "#fff",
        ":hover": {
          borderColor: "#222431",
          backgroundColor: "#5B5D6D",
        },
        ":active": {
          borderColor: "#222431",
          backgroundColor: "#5B5D6D",
        },
      },
      secondary: { background: "#fff", color: "#000" },
    },
    loader: {
      loadAnimationColor: "#222431",
    },
    messagePopup: {
      root: {
        backgroundColor: "#222431",
      },
      overlay: {
        backgroundColor: "grayscale(1)",
      },
      title: {
        color: "#fff",
      },
      description: {
        color: "#fff",
      },
      warnIcon: {
        stroke: "red",
      },
      successIcon: {
        stroke: "green",
      },
      closeIcon: {
        stroke: "#fff",
      },
    },
    header: {
      root: {
        display: "none",
      },
    },
    footer: {
      root: {
        background: "#34384b",
        borderTop: "1px solid #d5d5d5",
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
        background: "grayscale(1)",
        border: "1px dashed #ddd",
        color: "#222431",
      },
    },
    globals: { fontFamily: "Inter", backgroundColor: "transparent" },
    sheetSelect: {
      root: {
        backgroundColor: "#5B5D6D",
        border: "1px solid #5B5D6D",
      },
      header: {
        color: "#fff",
      },
      sheetName: {
        root: {
          backgroundColor: "#222431",
        },
        title: {
          color: "#fff",
        },
        description: {
          color: "#fff",
        },
        border: {
          backgroundColor: "#222431",
        },
      },
      grid: {
        root: {
          borderColor: "#5B5D6D",
          backgroundColor: "#222431",
          ":hover": {
            backgroundColor: "#222431",
          },
        },
        title: {
          color: "#fff",
        },
        description: {
          color: "#fff",
        },
        checkbox: {
          backgroundColor: "#5B5D6D",
        },
        checked: {
          root: {
            borderColor: "#222431",
            backgroundColor: "#222431",
            ":hover": {
              backgroundColor: "#222431",
            },
          },
          title: {
            color: "#fff",
          },
          description: {
            color: "#fff",
          },
          checkbox: {
            backgroundColor: "#222431",
          },
        },
      },
      list: {
        root: {
          backgroundColor: "#222431",
        },
        title: {
          color: "#222431",
        },
        description: {
          color: "#fff",
        },
        checkbox: {
          backgroundColor: "#222431",
        },
        checked: {
          root: {
            borderColor: "#5B5D6D",
            backgroundColor: "#222431",
          },
          title: {
            color: "#222431",
          },
          description: {
            color: "#fff",
          },
          checkbox: {
            backgroundColor: "#222431",
          },
        },
      },
      pagination: {
        currentPageButton: {
          backgroundColor: "#222431",
          color: "white",
        },
      },
      icon: {
        stroke: "#fff",
      },
      sheetLists: {
        root: {
          backgroundColor: "#5B5D6D",
        },
      },
      unSelectSheetName: {
        root: {
          backgroundColor: "#fff",
        },
        title: {
          color: "#fff",
        },
        description: {
          color: "#fff",
        },
        border: {
          backgroundColor: "green",
        },
      },
      addFileButton: {
        root: {
          backgroundColor: "red",
          color: "blue",
        },
        icon: {
          stroke: "green",
        },
      },
    },
    headerSelect: {
      root: { backgroundColor: "#5B5D6D" },
      sheetName: {
        root: {
          backgroundColor: "transparent",
        },
        title: {
          color: "#fff",
        },
        description: {
          color: "#fff",
        },
        border: {
          backgroundColor: "#34384b",
        },
      },
      table: {
        th: {
          backgroundColor: "#34384b",
          color: "#fff",
        },
        td: {
          backgroundColor: "#5B5D6D",
          color: "#fff",
        },

        scrollbar: {
          navigatorColor: "#5B5D6D",
          backgroundColor: "#34384b",
        },
        selectRowColor: "#34384b",
        hoverRowColor: "#34384b",
      },
      progressBar: {
        root: {
          display: "none",
        },
      },
    },

    columnMatch: {
      root: {
        color: "#fff",
        borderColor: "#5B5D6D",
      },
      icon: {
        color: "#fff",
      },
      matchingTitle: {
        root: {
          backgroundColor: "transparent",
        },
        icon: {
          color: "#fff",
        },
        checkIcon: {
          color: "#fff",
        },
      },
      matchingPercent: {
        root: {
          backgroundColor: "transparent",
          color: "#fff",
        },
        icon: {
          color: "#fff",
        },
      },
      notMatchingValue: {
        root: {
          backgroundColor: "transparent",
          color: "red",
        },
        icon: {
          color: "red",
        },
      },
      columnMatchHeader: {
        root: {
          backgroundColor: "#222431",
          borderColor: "#5B5D6D",
          color: "#fff",
        },
        icon: {
          stroke: "#fff",
        },
        dropdown: {
          scrollbar: {
            backgroundColor: "grayscale(1)",
            navigatorColor: "grayscale(1)",
          },
          search: {
            placeholder: "transparent",
            root: {
              backgroundColor: "transparent",
              borderColor: "#222431",
            },
          },
          root: {
            backgroundColor: "grayscale(1)",
            color: "#fff",
            borderColor: "#222431",
          },
          selectedOption: {
            backgroundColor: "#222431",
            color: "#fff",
            ":hover": {
              backgroundColor: "#222431",
            },
          },
          button: {
            placeholder: "#fff",
            root: {
              backgroundColor: "#222431",
              borderColor: "#5B5D6D",
              height: "unset",
              color: "#fff",
            },
            icon: {
              color: "#fff",
            },
          },
          header: {
            color: "#fff",
            backgroundColor: "#5B5D6D",
            border: "1px solid #222431",
          },
          option: {
            color: "#fff",
            backgroundColor: "#5B5D6D",
            ":hover": {
              backgroundColor: "#222431",
            },
          },
          badge: {
            root: {
              backgroundColor: "grayscale(1)",
              color: "#222431",
            },
            icon: {
              color: "#fff",
            },
          },
          createNewOption: {
            root: {
              color: "#fff",
              backgroundColor: "#5B5D6D",
              ":hover": {
                backgroundColor: "#222431",
              },
            },
            icon: {
              color: "white",
            },
          },
        },
      },
      columnMatchValue: {
        root: {
          backgroundColor: "transparent",
          borderColor: "#5B5D6D",
          color: "#fff",
        },
        emptyValue: {
          color: "red",
        },
        icon: {
          stroke: "#fff",
        },

        dropdown: {
          root: {
            backgroundColor: "salmon",
            color: "#fff",
            borderColor: "red",
          },
          selectedOption: {
            backgroundColor: "navy",
          },
          option: {
            ":hover": {
              backgroundColor: "pink",
              color: "blue",
            },
          },
          button: {
            placeholder: "yellow",
            root: {
              backgroundColor: "tomato",
            },
            icon: {
              color: "#fff",
            },
          },
          createNewOption: {
            root: {
              backgroundColor: "blue",
              color: "green",
            },
            icon: {
              color: "white",
            },
          },
          multiSelectionBadge: {
            root: {
              backgroundColor: "green",
              color: "blue",
            },
            icon: {
              color: "blue",
            },
          },
          iconCheckedColor: "yellow",
        },
      },
      requiredColumns: {
        title: {
          color: "#fff",
        },
        showMore: {
          root: {
            backgroundColor: "yellow",
          },
          badge: {
            backgroundColor: "blue",
            color: "yellow",
          },
          text: {
            color: "#fff",
            fontSize: 24,
          },
          icon: {
            stroke: "blue",
          },
        },
        notMatchErrorIcon: {
          stroke: "green",
        },
        notMatchError: {
          color: "#fff",
        },
        hasMatchIcon: {
          stroke: "green",
        },
        hasMatch: {
          color: "#fff",
        },
        notMatch: {
          color: "#fff",
        },
        notMatchIcon: {
          color: "black",
        },
      },
      dialogJoinColumn: {
        root: {
          backgroundColor: "transparent",
        },
        overlay: {
          backgroundColor: "black",
        },
        closeIcon: {
          stroke: "white",
        },
        title: {
          color: "#fff",
        },
        description: {
          color: "#fff",
        },
        table: {
          wrapper: {
            backgroundColor: "transparent",
            borderRadius: 20,
          },
          root: {
            borderColor: "black",
            borderRadius: 20,
          },
          background: {
            backgroundColor: "violet",
          },
          title: {
            color: "#fff",
          },
          description: {
            color: "#fff",
          },
          th: {
            backgroundColor: "blue",
            color: "red",
            borderColor: "black",
          },
          td: {
            color: "blue",
            backgroundColor: "red",
            borderColor: "black",
          },
        },
      },
    },
    reviewEntries: {
      root: { backgroundColor: "#5B5D6D" },
      switchError: {
        label: {
          color: "#fff",
        },
        badge: {
          backgroundColor: "orange",
          color: "black",
        },
      },
      selectRowColor: "#222431",
      selectedBackground: {
        normal: "#222431",
      },
      infoIcon: {
        color: "#fff",
        ":hover": {
          color: "grayscale(1)",
        },
      },
      edit: {
        category: {
          header: {
            backgroundColor: "blue",
          },
          search: {
            root: {
              backgroundColor: "red",
            },
            icon: {
              color: "green",
            },
          },
          item: {
            option: {
              backgroundColor: "red",
              ":hover": {
                color: "blue",
              },
            },
            selectedOption: {
              backgroundColor: "blue",
            },
          },
          button: {
            arrowIcon: {
              color: "yellow",
            },
            closeIcon: {
              color: "yellow",
            },
          },
          multiSelectionBadge: {
            root: {
              backgroundColor: "green",
              color: "blue",
            },
            icon: {
              color: "blue",
            },
          },
          iconCheckedColor: "yellow",
        },
        string: {
          backgroundColor: "blue",
        },
        currency: {
          backgroundColor: "pink",
        },
        percentage: {
          backgroundColor: "black",
        },
        date: {
          backgroundColor: "#4F8AAB",
          borderColor: "#4BC589",
        },
        time: {
          backgroundColor: "#9AC54B",
          borderColor: "#C5B64B",
        },
        boolean: {
          item: {
            option: {
              backgroundColor: "red",
            },
            selectedOption: {
              backgroundColor: "blue",
            },
          },
          button: {
            arrowIcon: {
              color: "red",
            },
            closeIcon: {
              color: "red",
            },
          },
        },
      },
      table: {
        dragStyle: {
          color: "orange",
          style: "solid",
        },
        th: {
          borderColor: "#222431",
          backgroundColor: "#5B5D6D",
          color: "#fff",
        },
        td: {
          root: {
            borderColor: "#222431",
            backgroundColor: "#5B5D6D",
          },
          normal: {
            borderColor: "#222431",
            backgroundColor: "#5B5D6D",
            color: "#fff",
            ":hover": {
              backgroundColor: "#222431",
            },
          },
        },
      },
    },
  },
  title: "Upload customers to Saleor",
  disableExcelTemplate: true,
  disableTemplates: true,
  allowManualInput: true,
};

const licenseKey = process.env.NEXT_PUBLIC_NUVO_LICENSE_KEY as string;

export const CustomersImporterView = () => {
  const authorized = useAuthorizedToken("MANAGE_USERS");

  const [importedLines, setImportedLines] = useState<CustomerColumnSchema[] | null>(null);

  const handleResults: OnResults = useCallback((resultArray) => {
    const parsedResult = resultArray.map((row) =>
      getResultModelSchema().parse(dotObject.object(row))
    );

    setImportedLines(parsedResult);
  }, []);

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
