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
        background: "black",
        color: "#fff",
      },
    },
    loader:{
      loadAnimationColor: '#000'
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
        background: "#fff",
        border: "1px dashed #ddd",
      },
    },
    globals: { fontFamily: "Inter", backgroundColor: "transparent" },
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
