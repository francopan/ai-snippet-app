import {
  Box,
  Button,
  Flex,
  Heading
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { Link as RemixLink, json, useLoaderData } from "@remix-run/react";
import { Snippet } from "types/snippet.type";
import { SnippetAccordion } from "~/components/ui/snippet-accordion";

export const loader: LoaderFunction = async () => {
  const response = await fetch( `${process.env.PUBLIC_API_URL}/snippets`);
  const snippets: Snippet[] = await response.json();
  return json(snippets);
};

export default function Index() {
  const snippets = useLoaderData<Snippet[]>();

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Snippets</Heading>
        <RemixLink to="/new">
          <Button  colorScheme="blue" size="sm">
            Create New Snippet
          </Button>
        </RemixLink>
      </Flex>

      <Box display="flex" flexDirection="column" gap={4}>
        {snippets.map((snippet) => (
            <SnippetAccordion summary={snippet.summary} _id={snippet._id} text={snippet.text} key={snippet._id} showLink={true}/>
        ))}
      </Box>
    </Box>
  );
}
