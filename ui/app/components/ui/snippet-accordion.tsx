import { Link as RouterLink } from 'react-router-dom';
import { Button, Text, Spinner, HStack, Accordion, Code } from "@chakra-ui/react";
import { Snippet } from "types/snippet.type";
import { Link } from '@remix-run/react';

export function SnippetAccordion(snippet: Snippet & {showLink?: boolean}) {
  const isLoading = !snippet.summary || snippet.summary.trim() === "";

  return (
    <Accordion.Root collapsible defaultValue={[snippet._id]}>
      <Accordion.Item value={snippet._id}>
        <Accordion.ItemTrigger>
          <HStack mb={2} width="100%" justifyContent="flex-start">
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <Text fontWeight="bold" fontSize="md" flex="1">
                  Content is being analyzed/summarized
                </Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold" fontSize="md" flex="1">
                  {snippet.summary}
                </Text>
              </>
            )}
            {snippet.showLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    marginBottom={2}
                  >
                    <Link  to={`/${snippet._id}`}>  Go to snippet</Link>
                  </Button>
            )}
          </HStack>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
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
  );
}
