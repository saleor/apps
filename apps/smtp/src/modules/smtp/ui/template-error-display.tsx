import { Box, Text } from "@saleor/macaw-ui";

import { ErrorContext } from "../services/email-compiler";

interface TemplateErrorDisplayProps {
  error: {
    message: string;
    data?: {
      errorContext?: ErrorContext;
    } | null;
  };
}

interface ErrorHint {
  title: string;
  description: string;
  links?: Array<{ label: string; url: string }>;
}

function getErrorHint(errorMessage: string): ErrorHint | null {
  // Invalid JSON in payload editor
  if (errorMessage.includes("Invalid payload JSON")) {
    return {
      title: "Invalid JSON Syntax",
      description:
        "The test payload JSON is invalid. Check for missing commas, quotes, brackets, or trailing commas.",
      links: [
        {
          label: "JSON Syntax Guide",
          url: "https://www.json.org/json-en.html",
        },
        {
          label: "JSON Validator",
          url: "https://jsonlint.com/",
        },
      ],
    };
  }

  // Missing Handlebars helper
  if (errorMessage.includes("Missing helper")) {
    const helperMatch = errorMessage.match(/Missing helper:\s*["']?(\w+)["']?/);
    const helperName = helperMatch?.[1];

    return {
      title: "Missing Handlebars Helper",
      description: helperName
        ? `The helper "${helperName}" is not available. Make sure you're using a valid Handlebars helper.`
        : "The template uses a helper that doesn't exist. See error message below for more details.",
      links: [
        {
          label: "Available Handlebars Helpers",
          url: "https://github.com/helpers/handlebars-helpers#helpers",
        },
        {
          label: "Handlebars Documentation",
          url: "https://handlebarsjs.com/guide/builtin-helpers.html",
        },
      ],
    };
  }

  // Handlebars parse error
  if (errorMessage.includes("Parse error")) {
    return {
      title: "Template Syntax Error",
      description:
        "There's a syntax error in your Handlebars template. Check for unclosed tags, missing brackets, or invalid expressions.",
      links: [
        {
          label: "Handlebars Syntax Guide",
          url: "https://handlebarsjs.com/guide/",
        },
      ],
    };
  }

  // MJML error
  if (errorMessage.includes("MJML") || errorMessage.includes("mj-")) {
    return {
      title: "MJML Template Error",
      description:
        "There's an error in your MJML markup. Check for unclosed tags, invalid components, or incorrect nesting.",
      links: [
        {
          label: "MJML Documentation",
          url: "https://documentation.mjml.io/",
        },
        {
          label: "MJML Component Reference",
          url: "https://documentation.mjml.io/#components",
        },
      ],
    };
  }

  // Empty template
  if (errorMessage.includes("empty")) {
    return {
      title: "Empty Template",
      description: "The template cannot be empty. Please add content to your email template.",
      links: [],
    };
  }

  return null;
}

function getErrorTitle(errorContext?: ErrorContext): string {
  switch (errorContext) {
    case "SUBJECT":
      return "Subject Template Error";
    case "BODY_MJML":
      return "Email Body Error (MJML)";
    case "BODY_TEMPLATE":
      return "Email Body Template Error";
    default:
      return "Template Error";
  }
}

function cleanErrorMessage(message: string): string {
  // Remove error class name prefix (e.g., "FailedCompileError: ")
  return message.replace(/^[A-Z][a-zA-Z]*Error:\s*/, "");
}

export const TemplateErrorDisplay = ({ error }: TemplateErrorDisplayProps) => {
  const cleanedMessage = cleanErrorMessage(error.message);
  const hint = getErrorHint(cleanedMessage);
  const errorTitle = getErrorTitle(error.data?.errorContext);

  return (
    <Box
      padding={4}
      backgroundColor="critical1"
      borderRadius={4}
      borderColor="critical1"
      borderWidth={1}
      borderStyle="solid"
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <Text color="default1" size={4} fontWeight="bold" as="p">
        {errorTitle}
      </Text>

      {hint && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Text color="default1" size={3} fontWeight="bold" as="p">
            💡 {hint.title}
          </Text>
          <Text color="default1" size={2} as="p">
            {hint.description}
          </Text>

          {hint.links && hint.links.length > 0 && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Text color="default1" size={2} fontWeight="bold" as="p">
                Helpful resources:
              </Text>
              {hint.links.map((link, index) => (
                <Text color="default1" size={2} key={index} as="p">
                  →{" "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    {link.label}
                  </a>
                </Text>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box
        as="pre"
        padding={3}
        backgroundColor="default3"
        borderRadius={2}
        style={{
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "monospace",
          fontSize: "12px",
          margin: 0,
        }}
      >
        <Text color="default1" size={2}>
          {cleanedMessage}
        </Text>
      </Box>
    </Box>
  );
};
