import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Snippet } from "types/snippet.type";
import { SnippetAccordion } from "~/components/ui/snippet-accordion";

export const loader: LoaderFunction = async ({ params }) => {
  const response = await fetch(`${process.env.PUBLIC_API_URL}/snippets/${params.id}`);
  const snippet: Snippet = await response.json();
  return json(snippet);
};

export default function SnippetView() {
  const snippet: Snippet = useLoaderData();

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <Flex mb={4} align="center" justify="space-between">
        <Link to="/">
          <Button size="sm" colorScheme="blue">
            ← Back
          </Button>
        </Link>
        <Heading size="md">Snippet Detail</Heading>
      </Flex>

      <SnippetAccordion
        summary={snippet.summary}
        _id={snippet._id}
        text={snippet.text}
        key={snippet._id}
      />
    </Box>
  );
}
