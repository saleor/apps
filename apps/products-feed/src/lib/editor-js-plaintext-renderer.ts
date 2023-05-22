interface ParagraphData {
  text: string;
}

interface HeaderData {
  text: string;
  level: number;
}

interface ListData {
  items: string[];
  style: "unordered" | "ordered";
}

interface esjBlock {
  id: string;
  type: string;
  data: ParagraphData | HeaderData | ListData | Record<never, never>;
}

interface ejsData {
  version: string;
  time: number;
  blocks: esjBlock[];
}

const renderParagraph = (data: ParagraphData) => {
  return data.text;
};

const renderHeader = (data: HeaderData) => {
  return data.text + "\n";
};

const renderList = (data: ListData) => {
  if (data.style === "ordered") {
    return data.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  }
  return data.items.map((item) => `- ${item}`).join("\n");
};

const renderDelimiter = () => {
  return "\n";
};

const renderBlock = (block: esjBlock) => {
  switch (block.type) {
    case "header":
      return renderHeader(block.data as HeaderData);
    case "paragraph":
      return renderParagraph(block.data as ParagraphData);
    case "list":
      return renderList(block.data as ListData);
    case "delimiter":
      return renderDelimiter();
    default:
      return "";
  }
};

const removeHtmlTags = (input: string) => {
  /*
   * The EditorJS used in the dashboard produces only a few one letter tags,
   * like <b> or </s>, so we can use simpler regex to remove them
   */
  return input.replace(/<[^>]{1,2}>/g, "");
};

type EditorJSRendererProps = {
  stringData: string;
};

export function EditorJsPlaintextRenderer({ stringData }: EditorJSRendererProps) {
  let data: ejsData;

  try {
    data = JSON.parse(stringData) as ejsData;
  } catch (e) {
    return;
  }
  if (!data) {
    return;
  }
  const { blocks } = data;

  return removeHtmlTags(blocks.map((b) => renderBlock(b)).join("\n")).trim();
}
