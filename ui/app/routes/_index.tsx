import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { Link as RemixLink, json, useLoaderData, useSearchParams } from "@remix-run/react";
import { Snippet } from "types/snippet.type";
import { SnippetAccordion } from "~/components/ui/snippet-accordion";

type PaginatedSnippets = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: Snippet[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "5";
  const response = await fetch(
    `${process.env.VITE_PUBLIC_API_URL}/snippets/paginated?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Response("Failed to fetch snippets", { status: response.status });
  }

  const data: PaginatedSnippets = await response.json();
  return json(data);
};

export default function Index() {
  const data = useLoaderData<PaginatedSnippets>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, totalPages, items: snippets } = data;
  const pageNum = Number(page);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; // safeguard
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Snippets</Heading>
        <RemixLink to="/new">
          <Button colorScheme="blue" size="sm">
            Create New Snippet
          </Button>
        </RemixLink>
      </Flex>

      <Box
        display="flex"
        flexDirection="column"
        gapY={2}
        gapX={0}
        mb={6}
      >
        {(snippets ?? []).map((snippet) => (
          <SnippetAccordion
            summary={snippet.summary}
            id={snippet.id}
            text={snippet.text}
            key={snippet.id}
            showLink={true}
          />
        ))}
      </Box>

      <Flex justify="center" gap={4} align="center">
        <Button
          onClick={() => goToPage(pageNum - 1)}
          disabled={pageNum <= 1}
          size="sm"
        >
          Previous
        </Button>

        <Text>
          Page {pageNum} of {totalPages}
        </Text>

        <Button
          onClick={() => goToPage(pageNum + 1)}
          disabled={pageNum >= totalPages}
          size="sm"
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
}
