import { Accordion, Box, Button, Code, HStack, Spinner, Text } from "@chakra-ui/react";
import { Link } from '@remix-run/react';
import { Snippet } from "types/snippet.type";

export function SnippetAccordion(snippet: Snippet & {showLink?: boolean}) {
  const isLoading = !snippet.summary || snippet.summary.trim() === "";

  return (
    <Box
            key={snippet._id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            
            transition="all 0.2s"
 
          >
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
          </HStack>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>
          {snippet.showLink && snippet._id && (
              <Link style={{ padding: 2}} to={ `/${snippet._id}`}>
              <Button size="sm" colorScheme="blue" variant={"outline"}>
                Go to Snippet
              </Button>
            </Link>
            )} 
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
