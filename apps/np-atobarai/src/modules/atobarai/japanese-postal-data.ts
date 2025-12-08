import postalCodesJson from "jp-postal";

type PostalCode = string;
type Prefecture = string;
type Region = string;

type RegionList = Array<Region>;

type PrefectureAndRegionMappingJson = Record<PostalCode, Record<Prefecture, RegionList>>;

const typedJson = postalCodesJson as PrefectureAndRegionMappingJson;

export class JapanesePostalData {
  resolve(postalCode: PostalCode) {
    const result = typedJson[postalCode];

    if (!result) {
      return null;
    }

    const resultKeys = Object.keys(result);

    if (resultKeys.length === 0 || resultKeys.length > 1) {
      return null;
    } else {
      const prefectureName = resultKeys[0];
      const regions = result[prefectureName];

      return {
        prefecture: prefectureName,
        regions,
      };
    }
  }
}
