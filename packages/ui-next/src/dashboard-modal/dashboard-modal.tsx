import { Actions } from "./actions";
import { Body } from "./body";
import { Close } from "./close";
import { Content, type ContentSize } from "./content";
import { ContextHeader } from "./context-header";
import { Header } from "./header";
import { Inset } from "./inset";
import { Root } from "./root";
import { Title } from "./title";

export type DashboardModalContentSize = ContentSize;

export const DashboardModal = Object.assign(Root, {
  Title,
  Content,
  Body,
  Actions,
  Close,
  ContextHeader,
  Header,
  Inset,
});
