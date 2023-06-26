import { describe, expect, it } from "vitest";
import { AppDetailsFragment } from "../saleor-api/generated/graphql";
import { filterApps } from "./filter-apps";

const mockedApp1: AppDetailsFragment = {
  id: "1",
  name: "app1",
  manifestUrl: "https://app1.com",
};

const mockedApp1Duplicate: AppDetailsFragment = {
  id: "2",
  name: "app1",
  manifestUrl: "https://app1.com",
};

const mockedApp2: AppDetailsFragment = {
  id: "3",
  name: "app2",
  manifestUrl: "https://app2.com",
};

const mockedAppList = [mockedApp1, mockedApp1Duplicate, mockedApp2];

describe("filterApps", function () {
  it("Return the same apps, when no filters applied", async () => {
    expect(
      filterApps({
        apps: mockedAppList,
        filter: {},
      })
    ).toStrictEqual(mockedAppList);
  });
  it("Return all apps with the same name, when filter name is applied", async () => {
    expect(
      filterApps({
        apps: mockedAppList,
        filter: {
          name: mockedApp1.name!,
        },
      })
    ).toStrictEqual([mockedApp1, mockedApp1Duplicate]);
  });
  it("Return all apps with the same manifest, when filter manifest is applied", async () => {
    expect(
      filterApps({
        apps: mockedAppList,
        filter: {
          manifestUrl: mockedApp1.manifestUrl!,
        },
      })
    ).toStrictEqual([mockedApp1, mockedApp1Duplicate]);
  });

  it("Return app with given id, when filter id is applied", async () => {
    expect(
      filterApps({
        apps: mockedAppList,
        filter: {
          id: mockedApp1.id,
        },
      })
    ).toStrictEqual([mockedApp1]);
  });
});
