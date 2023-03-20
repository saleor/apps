import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";

export const AppMarkdownText = ({ children, components, ...rest }: ReactMarkdownOptions) => {
  const { appBridge } = useAppBridge();

  const onClickHelpTextLink = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href?: string
  ) => {
    event.preventDefault();

    if (href) {
      appBridge?.dispatch(
        actions.Redirect({
          to: href,
          newContext: true,
        })
      );
    }
  };

  return (
    <ReactMarkdown
      {...rest}
      components={{
        ...components,
        a: (props) => <a {...props} onClick={(event) => onClickHelpTextLink(event, props.href)} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
