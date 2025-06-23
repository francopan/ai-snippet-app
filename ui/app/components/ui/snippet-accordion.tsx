import {
  Accordion,
  Box,
  Button,
  Code,
  HStack,
  Spinner,
  Text,
  Clipboard
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Snippet } from "types/snippet.type";
import { API_URL } from "../../constants/api-config.constant";

export function SnippetAccordion(snippet: Snippet & { showLink?: boolean }) {
  const [streamedSummary, setStreamedSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(
    !snippet.summary || snippet.summary.trim() === ""
  );
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamedSummaryRef = useRef<string>("");
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  const processQueue = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    while (queueRef.current.length > 0) {
      const chunk = queueRef.current.shift();
      if (!chunk) continue;

      for (let i = 0; i < chunk.length; i++) {
        streamedSummaryRef.current += chunk[i];
        setStreamedSummary((prev) => prev + chunk[i]);
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    isProcessingRef.current = false;
  };

  useEffect(() => {
    if (isLoading && snippet.id) {
      const url = `${API_URL}/snippets/${snippet.id}/stream`;
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        console.log("SSE connection opened");
      };

      eventSourceRef.current.onmessage = (event) => {
        if (!event.data) return;

        try {
          if (!event.data.trim().startsWith("{")) {
            console.log("Ignoring non-JSON SSE data:", event.data);
            return;
          }

          const data = JSON.parse(event.data);

          if (data.done) {
            setIsLoading(false);
            eventSourceRef.current?.close();
            return;
          }

          const content: string = data.message?.content || "";
          queueRef.current.push(content);
          processQueue();

        } catch (err) {
          console.error("Error parsing SSE data:", err);
          setError("Error parsing stream data");
          setIsLoading(false);
          eventSourceRef.current?.close();
        }
      };

      eventSourceRef.current.onerror = (err) => {
        console.error("SSE error event:", err);
        setError("Error receiving stream");
        setIsLoading(false);
        eventSourceRef.current?.close();
      };

      return () => {
        console.log("Closing SSE");
        eventSourceRef.current?.close();
      };
    }
  }, [isLoading, snippet.id]);

  const summaryToShow =
    snippet.summary && snippet.summary.trim() !== ""
      ? snippet.summary
      : streamedSummary;

  return (
    <Box
      key={snippet.id}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      transition="all 0.2s"
    >
      <Accordion.Root collapsible  >
        <Accordion.Item value={snippet.id}>
          <Accordion.ItemTrigger>
            <HStack mb={2} width="100%" justifyContent="flex-start">
            {isLoading ? (
              <>
                <Spinner size="sm" role="status" />
                <Text fontWeight="bold" fontSize="md" flex="1">
                  {error
                    ? `Error: ${error}`
                    : streamedSummary || "Summarizing..."}
                </Text>
              </>
            ) : (
              <Text fontWeight="bold" fontSize="md" flex="1">
                {summaryToShow}
              </Text>
            )}
            </HStack>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
          <Accordion.ItemBody>
            <Box display="flex" gap={2} alignItems="center">
              {snippet.showLink && snippet.id && (
                <Link style={{ padding: 2 }} to={`/${snippet.id}`}>
                  <Button size="sm" colorScheme="blue" variant={"outline"}>
                    Go to Snippet
                  </Button>
                </Link>
              )}
              {summaryToShow && (
                <Clipboard.Root value={summaryToShow}>
                  <Clipboard.Trigger asChild>
                    <Button variant="surface" size="sm">
                      <Clipboard.Indicator />
                    </Button>
                  </Clipboard.Trigger>
                </Clipboard.Root>
              )}
            </Box>
          </Accordion.ItemBody>
            <Accordion.ItemBody>
              <Code
                whiteSpace="pre-wrap"
                fontSize="sm"
                display="block"
                colorScheme="gray"
              >
                {snippet.text}
              </Code>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}
