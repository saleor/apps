import { useEffect, useRef, useState } from "react";
import { useDebounce } from "usehooks-ts";

import { trpcClient } from "../../trpc/trpc-client";

const PREVIEW_DEBOUNCE_DELAY = 1000;

type RenderTemplateError = ReturnType<
  typeof trpcClient.smtpConfiguration.renderTemplate.useMutation
>["error"];

interface UseTemplatePreviewParams {
  template: string;
  subject: string;
  payload: string;
}

export const useTemplatePreview = ({ template, subject, payload }: UseTemplatePreviewParams) => {
  const [lastValidRenderedTemplate, setLastValidRenderedTemplate] = useState("");
  const [lastValidRenderedSubject, setLastValidRenderedSubject] = useState("");
  const [error, setError] = useState<RenderTemplateError>(null);

  const { mutate: fetchPreview, isLoading } =
    trpcClient.smtpConfiguration.renderTemplate.useMutation({
      onSuccess: (data) => {
        setError(null);

        if (data.renderedEmailBody) {
          setLastValidRenderedTemplate(data.renderedEmailBody);
        }
        if (data.renderedSubject) {
          setLastValidRenderedSubject(data.renderedSubject);
        }
      },
      onError: (err) => {
        setError(err);
      },
    });

  const fetchPreviewRef = useRef(fetchPreview);

  fetchPreviewRef.current = fetchPreview;

  const debouncedTemplate = useDebounce(template, PREVIEW_DEBOUNCE_DELAY);
  const debouncedSubject = useDebounce(subject, PREVIEW_DEBOUNCE_DELAY);
  const debouncedPayload = useDebounce(payload, PREVIEW_DEBOUNCE_DELAY);

  useEffect(() => {
    fetchPreviewRef.current({
      template: debouncedTemplate,
      subject: debouncedSubject,
      payload: debouncedPayload,
    });
  }, [debouncedTemplate, debouncedSubject, debouncedPayload]);

  return {
    renderedTemplate: lastValidRenderedTemplate,
    renderedSubject: lastValidRenderedSubject,
    error,
    isLoading,
  };
};
